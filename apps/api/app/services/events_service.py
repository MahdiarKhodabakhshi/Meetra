from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.schemas.events import EventCreate, EventUpdate
from app.models import Event, EventAttendee, User
from app.models.event import EventStatus
from app.models.event_attendee import EventAttendeeStatus
from app.models.user import UserRole
from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    ValidationError,
)


RSVP_STARTS_AT_BUFFER = timedelta(minutes=5)


def _now_for_dt(value: datetime | None) -> datetime:
    if value is None:
        return datetime.now(timezone.utc)
    return datetime.utcnow() if value.tzinfo is None else datetime.now(timezone.utc)


def _is_admin(user: User) -> bool:
    return user.role == UserRole.ADMIN


def _is_organizer(user: User) -> bool:
    return user.role in {UserRole.ORGANIZER, UserRole.ADMIN}


def _require_manage_permission(user: User, event: Event) -> None:
    if _is_admin(user):
        return
    if event.organizer_id != user.id:
        raise PermissionDeniedError("not organizer for this event")


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


def create_event(db: Session, organizer: User, payload: EventCreate) -> Event:
    if not _is_organizer(organizer):
        raise PermissionDeniedError("only organizers or admins can create events")

    join_code = payload.join_code or secrets.token_urlsafe(6).replace("-", "").replace("_", "")
    title = payload.title or payload.name
    if not title:
        raise ValidationError("title is required")

    if payload.status == EventStatus.CANCELLED:
        raise ValidationError("cannot create a cancelled event")
    if payload.status == EventStatus.PUBLISHED:
        if not payload.starts_at:
            raise ValidationError("starts_at is required to publish")
        now = _now_for_dt(payload.starts_at)
        if payload.starts_at <= now:
            raise ValidationError("starts_at must be in the future to publish")

    event = Event(
        title=title,
        join_code=join_code,
        location=payload.location,
        description=payload.description,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        rsvp_deadline=payload.rsvp_deadline,
        capacity=payload.capacity,
        status=payload.status or EventStatus.DRAFT,
        organizer_id=organizer.id,
    )
    db.add(event)

    try:
        db.flush()
        db.add(
            EventAttendee(
                event_id=event.id,
                user_id=organizer.id,
                role="host",
                status=EventAttendeeStatus.RSVPED,
            )
        )
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ConflictError("join_code already exists") from exc

    db.refresh(event)
    return event


def update_event(db: Session, organizer: User, event_id: Any, patch: EventUpdate) -> Event:
    event = db.get(Event, event_id)
    if not event:
        raise NotFoundError("event not found")

    _require_manage_permission(organizer, event)

    patch_data = patch.dict(exclude_unset=True)
    if "name" in patch_data and "title" not in patch_data:
        patch_data["title"] = patch_data.pop("name")

    rsvp_count: int | None = None
    if ("capacity" in patch_data and patch_data.get("capacity") is not None) or (
        "starts_at" in patch_data
    ):
        rsvp_count = _current_rsvp_count(db, event.id)

    if "capacity" in patch_data and patch_data.get("capacity") is not None:
        if rsvp_count is None:
            rsvp_count = _current_rsvp_count(db, event.id)
        if patch_data["capacity"] < rsvp_count:
            raise ConflictError("capacity cannot be below current RSVP count")

    if "starts_at" in patch_data and patch_data.get("starts_at") is not None:
        if rsvp_count is None:
            rsvp_count = _current_rsvp_count(db, event.id)
        if rsvp_count > 0:
            now = _now_for_dt(patch_data["starts_at"])
            if patch_data["starts_at"] < now + RSVP_STARTS_AT_BUFFER:
                raise ConflictError("cannot move starts_at earlier with existing RSVPs")

    new_starts_at = patch_data.get("starts_at", event.starts_at)
    new_ends_at = patch_data.get("ends_at", event.ends_at)
    if new_starts_at and new_ends_at and new_ends_at <= new_starts_at:
        raise ValidationError("ends_at must be after starts_at")

    new_deadline = patch_data.get("rsvp_deadline", event.rsvp_deadline)
    if new_deadline and new_starts_at and new_deadline > new_starts_at:
        raise ValidationError("rsvp_deadline must be <= starts_at")

    for key, value in patch_data.items():
        setattr(event, key, value)

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def publish_event(db: Session, organizer: User, event_id: Any) -> Event:
    event = db.get(Event, event_id)
    if not event:
        raise NotFoundError("event not found")

    _require_manage_permission(organizer, event)

    if event.status == EventStatus.CANCELLED:
        raise ConflictError("cannot publish a cancelled event")

    if not event.starts_at:
        raise ValidationError("starts_at is required to publish")

    now = _now_for_dt(event.starts_at)
    if event.starts_at <= now:
        raise ValidationError("starts_at must be in the future to publish")

    event.status = EventStatus.PUBLISHED
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def cancel_event(db: Session, organizer: User, event_id: Any) -> Event:
    event = db.get(Event, event_id)
    if not event:
        raise NotFoundError("event not found")

    _require_manage_permission(organizer, event)

    event.status = EventStatus.CANCELLED
    event.cancelled_at = datetime.now(timezone.utc)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
