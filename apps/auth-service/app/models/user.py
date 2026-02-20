from __future__ import annotations

from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, validates

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, Enum):
    ATTENDEE = "ATTENDEE"
    ORGANIZER = "ORGANIZER"
    ADMIN = "ADMIN"


class UserStatus(str, Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"


class AuthUser(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    User identity model owned by auth-service.
    
    Contains only identity/authentication fields.
    Profile data (name, avatar_url) belongs to core service.
    """

    __tablename__ = "users"
    __table_args__ = (
        sa.Index("ix_auth_users_email_lower", sa.text("lower(email)"), unique=True),
    )

    email: Mapped[str] = mapped_column(String(320), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        sa.Enum(UserRole, name="user_role", schema="auth"),
        nullable=False,
        default=UserRole.ATTENDEE,
        server_default=UserRole.ATTENDEE.value,
    )
    status: Mapped[UserStatus] = mapped_column(
        sa.Enum(UserStatus, name="user_status", schema="auth"),
        nullable=False,
        default=UserStatus.ACTIVE,
        server_default=UserStatus.ACTIVE.value,
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    @validates("email")
    def _normalize_email(self, _key: str, value: str) -> str:
        return value.strip().lower()
