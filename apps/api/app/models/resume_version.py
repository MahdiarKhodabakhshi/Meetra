from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum

import sqlalchemy as sa
from sqlalchemy import DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ResumeVersionStatus(str, Enum):
    UPLOADED = "UPLOADED"
    SCANNING = "SCANNING"
    PARSING = "PARSING"
    PARSED = "PARSED"
    FAILED = "FAILED"


class ResumeVersion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "resume_versions"
    __table_args__ = (
        UniqueConstraint("user_id", "sha256", name="uq_resume_versions_user_sha256"),
        sa.CheckConstraint(
            "parse_confidence IS NULL OR (parse_confidence >= 0 AND parse_confidence <= 1)",
            name="ck_resume_versions_parse_confidence_range",
        ),
        sa.Index("ix_resume_versions_user_created_at_desc", "user_id", sa.text("created_at DESC")),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    file_uri: Mapped[str] = mapped_column(String(1024), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)

    status: Mapped[ResumeVersionStatus] = mapped_column(
        sa.Enum(ResumeVersionStatus, name="resume_version_status"),
        nullable=False,
        default=ResumeVersionStatus.UPLOADED,
        server_default=ResumeVersionStatus.UPLOADED.value,
    )

    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    parse_confidence: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    extracted_text_uri: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    parsed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
