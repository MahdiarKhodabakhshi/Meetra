from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field, root_validator, validator

from app.models.event import EventStatus


def _ensure_tzaware(value: datetime | None) -> datetime | None:
    if value is None:
        return value
    if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
        raise ValueError("datetime must be timezone-aware")
    return value


class TZAwareMixin:
    @validator(
        "starts_at",
        "ends_at",
        "rsvp_deadline",
        "cancelled_at",
        "created_at",
        "updated_at",
        pre=False,
        check_fields=False,
    )
    def _validate_tzaware(cls, value: datetime | None) -> datetime | None:
        return _ensure_tzaware(value)


class SchemaBase(BaseModel):
    class Config:
        orm_mode = True
        extra = "ignore"


class EventCreate(TZAwareMixin, SchemaBase):
    title: str | None = None
    name: str | None = Field(default=None, description="Deprecated; use title")
    join_code: str | None = None
    description: str | None = None
    location: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    rsvp_deadline: datetime | None = None
    capacity: int | None = Field(default=None, ge=1)
    status: EventStatus | None = None

    @root_validator(pre=True)
    def _coerce_title(cls, values: dict) -> dict:
        if not values.get("title") and values.get("name"):
            values["title"] = values["name"]
        return values

    @root_validator
    def _validate_time_bounds(cls, values: dict) -> dict:
        starts_at = values.get("starts_at")
        ends_at = values.get("ends_at")
        rsvp_deadline = values.get("rsvp_deadline")
        title = values.get("title")
        if not title:
            raise ValueError("title is required")
        if starts_at and ends_at and ends_at <= starts_at:
            raise ValueError("ends_at must be after starts_at")
        if rsvp_deadline and starts_at and rsvp_deadline > starts_at:
            raise ValueError("rsvp_deadline must be <= starts_at")
        return values


class EventUpdate(TZAwareMixin, SchemaBase):
    title: str | None = None
    name: str | None = Field(default=None, description="Deprecated; use title")
    description: str | None = None
    location: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    rsvp_deadline: datetime | None = None
    capacity: int | None = Field(default=None, ge=1)
    status: EventStatus | None = None
    cancelled_at: datetime | None = None

    @root_validator(pre=True)
    def _coerce_title(cls, values: dict) -> dict:
        if not values.get("title") and values.get("name"):
            values["title"] = values["name"]
        return values

    @root_validator
    def _validate_time_bounds(cls, values: dict) -> dict:
        starts_at = values.get("starts_at")
        ends_at = values.get("ends_at")
        rsvp_deadline = values.get("rsvp_deadline")
        if starts_at and ends_at and ends_at <= starts_at:
            raise ValueError("ends_at must be after starts_at")
        if rsvp_deadline and starts_at and rsvp_deadline > starts_at:
            raise ValueError("rsvp_deadline must be <= starts_at")
        return values


class EventOut(TZAwareMixin, SchemaBase):
    id: UUID
    title: str
    description: str | None = None
    location: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    rsvp_deadline: datetime | None = None
    capacity: int | None = None
    status: EventStatus
    organizer_id: UUID
    created_at: datetime
    updated_at: datetime
    cancelled_at: datetime | None = None


class EventListOut(SchemaBase):
    items: list[EventOut]
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total: int = Field(ge=0)


class RSVPStatus(str, Enum):
    JOINED = "joined"
    ALREADY_JOINED = "already_joined"
    CANCELLED = "cancelled"


class RSVPOut(SchemaBase):
    status: RSVPStatus
    event_id: UUID
    user_id: UUID


class EventCreatedOut(SchemaBase):
    event_id: UUID
    join_code: str
