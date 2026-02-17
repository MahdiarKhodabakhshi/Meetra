from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.resume_version import ResumeVersionStatus


class ResumeVersionOut(BaseModel):
    id: UUID
    user_id: UUID
    file_uri: str
    original_filename: str
    mime_type: str
    sha256: str
    status: ResumeVersionStatus
    error_code: str | None = None
    error_message: str | None = None
    parsed_at: datetime | None = None
    extracted_text_uri: str | None = None
    created_at: datetime

    class Config:
        orm_mode = True


class ResumeStatusOut(BaseModel):
    id: UUID
    status: ResumeVersionStatus
    error_code: str | None = None
    error_message: str | None = None
    parsed_at: datetime | None = None
    progress_stage: str

    class Config:
        orm_mode = True
