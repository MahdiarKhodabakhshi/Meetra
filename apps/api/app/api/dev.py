import secrets
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from redis.exceptions import RedisError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Event, EventAttendee, User
from app.redis_client import get_redis

router = APIRouter(prefix="/dev", tags=["dev"])

DBSession = Annotated[Session, Depends(get_db)]


class CreateEventIn(BaseModel):
    name: str
    join_code: str | None = None
    location: str | None = None


@router.post("/events")
def dev_create_event(payload: CreateEventIn, db: DBSession):
    join_code = payload.join_code or secrets.token_urlsafe(6).replace("-", "").replace("_", "")
    event = Event(name=payload.name, join_code=join_code, location=payload.location)
    db.add(event)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="join_code already exists") from None
    db.refresh(event)

    # Optional: warm cache for faster immediate joins
    try:
        r = get_redis()
        r.setex(f"event:join_code:{event.join_code}", 60, str(event.id))
    except RedisError:
        pass

    return {"event_id": str(event.id), "join_code": event.join_code}


class JoinEventIn(BaseModel):
    join_code: str
    email: str
    name: str | None = None


@router.post("/events/join")
def dev_join_event(payload: JoinEventIn, db: DBSession):
    cache_key = f"event:join_code:{payload.join_code}"
    event = None

    # 1) Try cache (best effort)
    try:
        r = get_redis()
        cached_event_id = r.get(cache_key)
        if cached_event_id:
            event = db.get(Event, uuid.UUID(cached_event_id))
    except RedisError:
        event = None

    # 2) Fallback to DB and populate cache
    if not event:
        event = db.scalar(select(Event).where(Event.join_code == payload.join_code))
        if event:
            try:
                r = get_redis()
                r.setex(cache_key, 60, str(event.id))
            except RedisError:
                pass

    if not event:
        raise HTTPException(status_code=404, detail="event not found")

    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        user = User(email=payload.email, name=payload.name)
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
