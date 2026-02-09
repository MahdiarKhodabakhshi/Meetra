import uuid
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from redis import Redis
from redis.exceptions import RedisError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.schemas.events import EventCreate, EventCreatedOut, RSVPOut, RSVPStatus
from app.core.config import settings
from app.db import get_db
from app.models import Event, User
from app.models.user import UserRole
from app.redis_client import get_redis
from app.services import events_service, rsvp_service
from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)
from app.worker.celery_app import celery_app

DBSession = Annotated[Session, Depends(get_db)]
RedisClient = Annotated[Redis, Depends(get_redis)]


def require_dev_key(x_dev_key: str | None = Header(default=None)) -> None:
    # Extra belt-and-suspenders: even if /dev were accidentally mounted elsewhere
    if settings.env != "local":
        raise HTTPException(status_code=404, detail="not found")

    # Hard off-switch for dev routes
    if not settings.dev_routes_enabled:
        raise HTTPException(status_code=404, detail="not found")

    # Optional shared secret
    if settings.dev_api_key and x_dev_key != settings.dev_api_key:
        raise HTTPException(status_code=403, detail="invalid dev key")


router = APIRouter(prefix="/dev", tags=["dev"], dependencies=[Depends(require_dev_key)])


class DevEventCreate(EventCreate):
    organizer_email: str | None = None
    organizer_name: str | None = None


@router.post("/events", response_model=EventCreatedOut)
def dev_create_event(payload: DevEventCreate, db: DBSession, r: RedisClient):
    organizer_email = (payload.organizer_email or "dev-organizer@local").strip().lower()
    organizer = db.scalar(select(User).where(User.email == organizer_email))
    if not organizer:
        organizer = User(
            email=organizer_email,
            name=payload.organizer_name or "Dev Organizer",
            role=UserRole.ORGANIZER,
        )
        db.add(organizer)
        db.flush()
    elif organizer.role == UserRole.ATTENDEE:
        organizer.role = UserRole.ORGANIZER
        db.add(organizer)
        db.flush()

    try:
        event = events_service.create_event(db, organizer, payload)
    except PermissionDeniedError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    # Best-effort cache
    try:
        r.setex(f"event:join_code:{event.join_code}", 60, str(event.id))
    except RedisError:
        pass

    return EventCreatedOut(event_id=event.id, join_code=event.join_code)


class JoinEventIn(BaseModel):
    join_code: str
    email: str
    name: str | None = None


@router.post("/events/join", response_model=RSVPOut)
def dev_join_event(payload: JoinEventIn, db: DBSession, r: RedisClient):
    email = payload.email.strip().lower()
    cache_key = f"event:join_code:{payload.join_code}"
    event = None

    # 1) Try cache (best effort)
    try:
        cached_event_id = r.get(cache_key)
        if cached_event_id:
            event = db.get(Event, uuid.UUID(cached_event_id.decode("utf-8")))
    except RedisError:
        event = None

    # 2) Fallback to DB and populate cache
    if not event:
        event = db.scalar(select(Event).where(Event.join_code == payload.join_code))
        if event:
            try:
                r.setex(cache_key, 60, str(event.id))
            except RedisError:
                pass

    if not event:
        raise HTTPException(status_code=404, detail="event not found")

    user = db.scalar(select(User).where(User.email == email))
    if not user:
        user = User(email=email, name=payload.name)
        db.add(user)
        db.flush()

    try:
        _status, already_joined = rsvp_service.rsvp(db, user, event.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return RSVPOut(
        status=RSVPStatus.ALREADY_JOINED if already_joined else RSVPStatus.JOINED,
        event_id=event.id,
        user_id=user.id,
    )


class IngestResumeTextIn(BaseModel):
    user_id: UUID
    text: str


@router.post("/ingest/resume-text")
def dev_ingest_resume_text(payload: IngestResumeTextIn, db: DBSession):
    # Validate FK up-front (prevents Celery task from crashing with FK violation)
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    async_result = celery_app.send_task(
        "ingest_resume_text",
        args=[str(payload.user_id), payload.text],
    )
    return {"status": "queued", "task_id": async_result.id}
