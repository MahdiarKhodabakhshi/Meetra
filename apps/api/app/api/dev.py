import secrets
import uuid
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from redis import Redis
from redis.exceptions import RedisError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import Event, EventAttendee, User
from app.redis_client import get_redis
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


class CreateEventIn(BaseModel):
    name: str
    join_code: str | None = None
    location: str | None = None


@router.post("/events")
def dev_create_event(payload: CreateEventIn, db: DBSession, r: RedisClient):
    join_code = payload.join_code or secrets.token_urlsafe(6).replace("-", "").replace("_", "")
    event = Event(name=payload.name, join_code=join_code, location=payload.location)
    db.add(event)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="join_code already exists") from None

    db.refresh(event)

    # Best-effort cache
    try:
        r.setex(f"event:join_code:{event.join_code}", 60, str(event.id))
    except RedisError:
        pass

    return {"event_id": str(event.id), "join_code": event.join_code}


class JoinEventIn(BaseModel):
    join_code: str
    email: str
    name: str | None = None


@router.post("/events/join")
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

    attendee = EventAttendee(event_id=event.id, user_id=user.id, role="attendee")
    db.add(attendee)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"status": "already_joined", "event_id": str(event.id), "user_id": str(user.id)}

    return {"status": "joined", "event_id": str(event.id), "user_id": str(user.id)}


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
