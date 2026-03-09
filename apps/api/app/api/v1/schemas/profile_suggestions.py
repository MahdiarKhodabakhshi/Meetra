from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileSuggestionOut(BaseModel):
    resume_version_id: UUID
    parsed_at: datetime | None = None
    parse_confidence: float | None = None
    suggestion: dict[str, Any] = Field(default_factory=dict)


class ApplyProfileSuggestionIn(BaseModel):
    fields: list[str] | None = None
    force: bool = False

