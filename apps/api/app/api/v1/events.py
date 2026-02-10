from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.errors import http_error_from_service
from app.api.v1.schemas.events import (
    EventCreate,
    EventCreatedOut,
    EventListOut,
    EventOut,
    EventUpdate,
    RSVPOut,
    RSVPStatus,
)
from app.auth.deps import CurrentUser, require_role
from app.db import get_db
from app.models import Event, User
from app.models.event import EventStatus
from app.models.user import UserRole
from app.services import events_service, rsvp_service
from app.services.error_codes import ErrorCode
from app.services.exceptions import NotFoundError, ServiceError, ValidationError

router = APIRouter(prefix="/events", tags=["events"])

DBSession = Annotated[Session, Depends(get_db)]
OrganizerUser = Annotated[User, Depends(require_role(UserRole.ORGANIZER, UserRole.ADMIN))]


def _ensure_tzaware(value: datetime | None, field_name: str) -> None:
    if value is None:
        return
    if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
        raise HTTPException(
            status_code=422,
            detail={
                "code": ErrorCode.VALIDATION_ERROR.value,
                "message": f"{field_name} must be timezone-aware",
            },
        )


@router.get("", response_model=EventListOut)
def list_events(
    db: DBSession,
    user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    starts_after: datetime | None = Query(default=None),
    starts_before: datetime | None = Query(default=None),
):
    _ensure_tzaware(starts_after, "starts_after")
    _ensure_tzaware(starts_before, "starts_before")

    filters = [Event.status == EventStatus.PUBLISHED]
    if starts_after:
        filters.append(Event.starts_at >= starts_after)
    if starts_before:
        filters.append(Event.starts_at <= starts_before)

    total = db.scalar(select(func.count()).select_from(Event).where(*filters)) or 0

    items = (
        db.scalars(
            select(Event)
            .where(*filters)
            .order_by(Event.starts_at.asc().nulls_last())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .all()
    )

    return EventListOut(items=items, page=page, page_size=page_size, total=total)


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: str, db: DBSession, user: CurrentUser):
    event = db.get(Event, event_id)
    if not event:
        raise http_error_from_service(
            NotFoundError(ErrorCode.EVENT_NOT_FOUND.value, "event not found")
        )

    if event.status == EventStatus.PUBLISHED:
        return event

    if user.role == UserRole.ADMIN:
        return event
    if user.role == UserRole.ORGANIZER and event.organizer_id == user.id:
        return event

    raise http_error_from_service(
        NotFoundError(ErrorCode.EVENT_NOT_FOUND.value, "event not found")
    )


@router.post("", response_model=EventCreatedOut)
def create_event(payload: EventCreate, db: DBSession, user: OrganizerUser):
    try:
        event = events_service.create_event(db, user, payload)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc

    return EventCreatedOut(event_id=event.id, join_code=event.join_code)


@router.patch("/{event_id}", response_model=EventOut)
def update_event(
    event_id: str,
    payload: EventUpdate,
    db: DBSession,
    user: OrganizerUser,
):
    try:
        event = events_service.update_event(db, user, event_id, payload)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc

    return event


@router.post("/{event_id}/publish", response_model=EventOut)
def publish_event(event_id: str, db: DBSession, user: OrganizerUser):
    try:
        event = events_service.publish_event(db, user, event_id)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc
    return event


@router.post("/{event_id}/cancel", response_model=EventOut)
def cancel_event(event_id: str, db: DBSession, user: OrganizerUser):
    try:
        event = events_service.cancel_event(db, user, event_id)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc
    return event


class JoinEventIn(BaseModel):
    join_code: str
    name: str | None = None


@router.post("/join", response_model=RSVPOut)
def join_event(payload: JoinEventIn, db: DBSession, user: CurrentUser):
    event_id = db.scalar(select(Event.id).where(Event.join_code == payload.join_code))
    if not event_id:
        raise http_error_from_service(
            NotFoundError(ErrorCode.EVENT_NOT_FOUND.value, "event not found")
        )

    if payload.name and not user.name:
        user.name = payload.name
        db.add(user)
        db.flush()

    try:
        _status, already_joined = rsvp_service.rsvp(db, user, event_id)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc

    return RSVPOut(
        status=RSVPStatus.ALREADY_JOINED if already_joined else RSVPStatus.JOINED,
        event_id=event_id,
        user_id=user.id,
    )


@router.post("/{event_id}/rsvp", response_model=RSVPOut)
def rsvp_event(event_id: str, db: DBSession, user: CurrentUser):
    try:
        _status, already_joined = rsvp_service.rsvp(db, user, event_id)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc

    return RSVPOut(
        status=RSVPStatus.ALREADY_JOINED if already_joined else RSVPStatus.JOINED,
        event_id=event_id,
        user_id=user.id,
    )


@router.delete("/{event_id}/rsvp", status_code=204)
def cancel_rsvp(event_id: str, db: DBSession, user: CurrentUser):
    try:
        rsvp_service.cancel_rsvp(db, user, event_id)
    except NotFoundError as exc:
        raise http_error_from_service(exc) from exc
    except ServiceError as exc:
        if isinstance(exc, ValidationError):
            return Response(status_code=204)
        raise http_error_from_service(exc) from exc
    return Response(status_code=204)
