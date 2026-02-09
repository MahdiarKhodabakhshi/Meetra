from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.schemas.events import EventCreate, EventCreatedOut, RSVPOut, RSVPStatus
from app.auth.deps import CurrentUser, require_role
from app.db import get_db
from app.models import Event, User
from app.models.user import UserRole
from app.services import events_service, rsvp_service
from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)

router = APIRouter(prefix="/events", tags=["events"])

DBSession = Annotated[Session, Depends(get_db)]
OrganizerUser = Annotated[User, Depends(require_role(UserRole.ORGANIZER, UserRole.ADMIN))]


@router.post("", response_model=EventCreatedOut)
def create_event(payload: EventCreate, db: DBSession, user: OrganizerUser):
    try:
        event = events_service.create_event(db, user, payload)
    except PermissionDeniedError as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return EventCreatedOut(event_id=event.id, join_code=event.join_code)


class JoinEventIn(BaseModel):
    join_code: str
    name: str | None = None


@router.post("/join", response_model=RSVPOut)
def join_event(payload: JoinEventIn, db: DBSession, user: CurrentUser):
    event_id = db.scalar(select(Event.id).where(Event.join_code == payload.join_code))
    if not event_id:
        raise HTTPException(status_code=404, detail="event not found")

    if payload.name and not user.name:
        user.name = payload.name
        db.add(user)
        db.flush()

    try:
        _status, already_joined = rsvp_service.rsvp(db, user, event_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc

    return RSVPOut(
        status=RSVPStatus.ALREADY_JOINED if already_joined else RSVPStatus.JOINED,
        event_id=event_id,
        user_id=user.id,
    )
