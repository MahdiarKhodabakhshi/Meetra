from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, root_validator


class ProfileOut(BaseModel):
    user_id: UUID
    headline: str | None = None
    summary: str | None = None
    skills: list[str]
    titles: list[str]
    industries: list[str]
    confidence_json: dict[str, Any]
    source_resume_id: UUID | None = None
    updated_at: datetime

    class Config:
        orm_mode = True


class ProfileUpdate(BaseModel):
    headline: str | None = None
    summary: str | None = None
    skills: list[str] | None = None
    titles: list[str] | None = None
    industries: list[str] | None = None

    @root_validator(pre=True)
    def _require_at_least_one_field(cls, values: dict[str, Any]) -> dict[str, Any]:
        editable_fields = ("headline", "summary", "skills", "titles", "industries")
        if not any(field in values for field in editable_fields):
            raise ValueError("at least one editable field must be provided")
        return values
