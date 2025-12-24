import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EventAttendee(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "event_attendees"
    __table_args__ = (UniqueConstraint("event_id", "user_id", name="uq_event_attendee_event_user"),)

    event_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # attendee/admin (keep as string for MVP; can move to enum later)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="attendee")
