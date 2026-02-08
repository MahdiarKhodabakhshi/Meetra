from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EventStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    CANCELLED = "CANCELLED"


class Event(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "events"
    __table_args__ = (
        sa.CheckConstraint(
            "ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at",
            name="ck_events_ends_after_starts",
        ),
        sa.CheckConstraint(
            "capacity IS NULL OR capacity >= 1",
            name="ck_events_capacity_min",
        ),
        sa.CheckConstraint(
            "rsvp_deadline IS NULL OR starts_at IS NULL OR rsvp_deadline <= starts_at",
            name="ck_events_rsvp_deadline_before_start",
        ),
        sa.Index("ix_events_status_starts_at", "status", "starts_at"),
        sa.Index("ix_events_organizer_starts_at", "organizer_id", "starts_at"),
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    starts_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rsvp_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[EventStatus] = mapped_column(
        sa.Enum(EventStatus, name="event_status"),
        nullable=False,
        default=EventStatus.DRAFT,
        server_default=EventStatus.DRAFT.value,
    )
    organizer_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Human-friendly join code (you will use this in QR codes / links)
    join_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
