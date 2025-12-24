import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Event, EventAttendee, User

router = APIRouter(prefix="/events")

DBSession = Annotated[Session, Depends(get_db)]


class CreateEventIn(BaseModel):
    name: str
    join_code: str | None = None
    location: str | None = None


@router.post("")
def create_event(payload: CreateEventIn, db: DBSession):
    join_code = payload.join_code or secrets.token_urlsafe(6).replace("-", "").replace("_", "")

    event = Event(name=payload.name, join_code=join_code, location=payload.location)
    db.add(event)

    try:
        db.commit()
    except IntegrityError as err:
        db.rollback()
        raise HTTPException(status_code=409, detail="join_code already exists") from err

    db.refresh(event)
    return {"event_id": str(event.id), "join_code": event.join_code}


class JoinEventIn(BaseModel):
    join_code: str
    email: str
    name: str | None = None


@router.post("/join")
def join_event(payload: JoinEventIn, db: DBSession):
    event = db.scalar(select(Event).where(Event.join_code == payload.join_code))
    if not event:
        raise HTTPException(status_code=404, detail="event not found")

    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        user = User(email=payload.email, name=payload.name)
        db.add(user)
        db.flush()  # assigns user.id without committing yet

    attendee = EventAttendee(event_id=event.id, user_id=user.id, role="attendee")
    db.add(attendee)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"status": "already_joined", "event_id": str(event.id), "user_id": str(user.id)}

    return {"status": "joined", "event_id": str(event.id), "user_id": str(user.id)}
