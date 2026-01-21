from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.models.event import EventStatus


def _ensure_tzaware(value: datetime | None) -> datetime | None:
    if value is None:
        return value
    if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
        raise ValueError("datetime must be timezone-aware")
    return value


class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")


class TZAwareMixin(BaseModel):
    @field_validator(
        "starts_at",
        "ends_at",
        "rsvp_deadline",
        "cancelled_at",
        "created_at",
        "updated_at",
        mode="after",
        check_fields=False,
    )
    @classmethod
    def _validate_tzaware(cls, value: datetime | None) -> datetime | None:
        return _ensure_tzaware(value)


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

    @model_validator(mode="before")
    @classmethod
    def _coerce_title(cls, data):
        if isinstance(data, dict):
            if not data.get("title") and data.get("name"):
                data["title"] = data["name"]
        return data

    @model_validator(mode="after")
    def _validate_time_bounds(self):
        if not self.title:
            raise ValueError("title is required")
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.rsvp_deadline and self.starts_at and self.rsvp_deadline > self.starts_at:
            raise ValueError("rsvp_deadline must be <= starts_at")
        return self


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

    @model_validator(mode="before")
    @classmethod
    def _coerce_title(cls, data):
        if isinstance(data, dict):
            if not data.get("title") and data.get("name"):
                data["title"] = data["name"]
        return data

    @model_validator(mode="after")
    def _validate_time_bounds(self):
        if self.starts_at and self.ends_at and self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.rsvp_deadline and self.starts_at and self.rsvp_deadline > self.starts_at:
            raise ValueError("rsvp_deadline must be <= starts_at")
        return self


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
