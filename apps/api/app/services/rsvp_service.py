from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models import Event, EventAttendee, User
from app.models.event import EventStatus
from app.models.event_attendee import EventAttendeeStatus
from app.services.error_codes import ErrorCode
from app.services.exceptions import ConflictError, NotFoundError, ValidationError


def _now_for_dt(value: datetime | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    return datetime.utcnow() if value.tzinfo is None else datetime.now(timezone.utc)


def _cutoff_for_event(event: Event) -> datetime | None:
    cutoff = event.starts_at
    if event.rsvp_deadline and (cutoff is None or event.rsvp_deadline < cutoff):
        cutoff = event.rsvp_deadline
    return cutoff


def _current_rsvp_count(db: Session, event_id: Any) -> int:
    return int(
        db.scalar(
            select(func.count())
            .select_from(EventAttendee)
            .where(
                EventAttendee.event_id == event_id,
                EventAttendee.status == EventAttendeeStatus.RSVPED,
            )
        )
        or 0
    )


def rsvp(db: Session, user: User, event_id: Any) -> tuple[EventAttendeeStatus, bool]:
    already_joined = False
    try:
        event = db.scalar(select(Event).where(Event.id == event_id).with_for_update())
        if not event:
            raise NotFoundError(ErrorCode.EVENT_NOT_FOUND.value, "event not found")

        if event.status == EventStatus.CANCELLED:
            raise ConflictError(ErrorCode.EVENT_CANCELLED.value, "event is cancelled")
        if event.status != EventStatus.PUBLISHED:
            raise ConflictError(
                ErrorCode.EVENT_NOT_PUBLISHED.value, "event is not published"
            )

        cutoff = _cutoff_for_event(event)
        if cutoff:
            now = _now_for_dt(cutoff)
            if cutoff < now:
                raise ConflictError(
                    ErrorCode.RSVP_CUTOFF_PASSED.value, "rsvp deadline has passed"
                )

        existing = db.scalar(
            select(EventAttendee).where(
                EventAttendee.event_id == event.id,
                EventAttendee.user_id == user.id,
            )
        )
        if existing and existing.status == EventAttendeeStatus.RSVPED:
            already_joined = True
            return EventAttendeeStatus.RSVPED, already_joined

        if event.capacity is not None:
            rsvp_count = _current_rsvp_count(db, event.id)
            if rsvp_count >= event.capacity:
                raise ConflictError(ErrorCode.EVENT_FULL.value, "event is full")

        if existing:
            existing.status = EventAttendeeStatus.RSVPED
            existing.cancelled_at = None
            db.add(existing)
        else:
            db.add(
                EventAttendee(
                    event_id=event.id,
                    user_id=user.id,
                    role="attendee",
                    status=EventAttendeeStatus.RSVPED,
                )
            )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        existing = db.scalar(
            select(EventAttendee).where(
                EventAttendee.event_id == event_id,
                EventAttendee.user_id == user.id,
                EventAttendee.status == EventAttendeeStatus.RSVPED,
            )
        )
        if existing:
            return EventAttendeeStatus.RSVPED, True
        raise ConflictError(
            ErrorCode.RSVP_ALREADY_EXISTS.value, "already joined"
        ) from exc

    return EventAttendeeStatus.RSVPED, already_joined


def cancel_rsvp(db: Session, user: User, event_id: Any) -> EventAttendeeStatus:
    event = db.scalar(select(Event).where(Event.id == event_id).with_for_update())
    if not event:
        raise NotFoundError(ErrorCode.EVENT_NOT_FOUND.value, "event not found")

    attendee = db.scalar(
        select(EventAttendee).where(
            EventAttendee.event_id == event.id,
            EventAttendee.user_id == user.id,
        )
    )
    if not attendee or attendee.status == EventAttendeeStatus.CANCELLED:
        raise ValidationError(
            ErrorCode.RSVP_NOT_FOUND.value, "not currently RSVPed"
        )

    attendee.status = EventAttendeeStatus.CANCELLED
    attendee.cancelled_at = datetime.now(timezone.utc)
    db.add(attendee)
    db.commit()
    return EventAttendeeStatus.CANCELLED
