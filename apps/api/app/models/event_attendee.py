from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EventAttendeeStatus(str, Enum):
    RSVPED = "RSVPED"
    CANCELLED = "CANCELLED"


class EventAttendee(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "event_attendees"
    __table_args__ = (
        UniqueConstraint("event_id", "user_id", name="uq_event_attendee_event_user"),
        sa.Index("ix_event_attendees_event_id", "event_id"),
        sa.Index("ix_event_attendees_user_id", "user_id"),
    )

    event_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # attendee/admin (keep as string for MVP; can move to enum later)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="attendee")
    status: Mapped[EventAttendeeStatus] = mapped_column(
        sa.Enum(EventAttendeeStatus, name="event_attendee_status"),
        nullable=False,
        default=EventAttendeeStatus.RSVPED,
        server_default=EventAttendeeStatus.RSVPED.value,
    )
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
