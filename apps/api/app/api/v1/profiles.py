from __future__ import annotations

from typing import Any, Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.schemas.profiles import ProfileOut, ProfileUpdate
from app.api.v1.schemas.profile_suggestions import (
    ApplyProfileSuggestionIn,
    ProfileSuggestionOut,
)
from app.auth.deps import CurrentUser
from app.db import get_db
from app.models import Profile, ResumeVersion
from app.models.resume_version import ResumeVersionStatus

router = APIRouter(prefix="/profiles", tags=["profiles"])

DBSession = Annotated[Session, Depends(get_db)]

USER_CONFIRMED = "USER_CONFIRMED"
MANUAL_OVERRIDES_KEY = "manual_overrides"
EDITABLE_FIELDS = ("display_name", "headline", "summary", "skills", "titles", "industries")


def _get_or_create_profile(db: Session, user_id) -> Profile:
    profile = db.get(Profile, user_id)
    if profile is not None:
        return profile

    profile = Profile(user_id=user_id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def _normalize_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def _normalize_items(values: list[str]) -> list[str]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        item = value.strip()
        if not item:
            continue
        lower = item.lower()
        if lower in seen:
            continue
        seen.add(lower)
        normalized.append(item)
    return normalized


def _validation_error(message: str) -> HTTPException:
    return HTTPException(
        status_code=422,
        detail={"code": "VALIDATION_ERROR", "message": message},
    )


def _updated_confidence_json(
    existing: dict[str, Any],
    overridden_fields: set[str],
) -> dict[str, Any]:
    merged = dict(existing)
    merged[MANUAL_OVERRIDES_KEY] = sorted(overridden_fields)
    for field in overridden_fields:
        merged[field] = {"value": 1.0, "source": USER_CONFIRMED}
    return merged


def _get_latest_resume_suggestion(db: Session, user_id) -> ResumeVersion | None:
    return db.scalar(
        select(ResumeVersion)
        .where(
            ResumeVersion.user_id == user_id,
            ResumeVersion.status == ResumeVersionStatus.PARSED,
            ResumeVersion.parsed_profile_json.is_not(None),
        )
        .order_by(ResumeVersion.created_at.desc())
        .limit(1)
    )


@router.get("/me", response_model=ProfileOut)
def get_my_profile(user: CurrentUser, db: DBSession):
    profile = _get_or_create_profile(db, user.id)
    return profile


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdate,
    user: CurrentUser,
    db: DBSession,
):
    profile = _get_or_create_profile(db, user.id)

    updates = payload.dict(exclude_unset=True)
    if not updates:
        raise _validation_error("at least one editable field must be provided")

    existing_confidence = (
        profile.confidence_json if isinstance(profile.confidence_json, dict) else {}
    )
    manual_overrides = set()
    current_overrides = existing_confidence.get(MANUAL_OVERRIDES_KEY, [])
    if isinstance(current_overrides, list):
        manual_overrides = {
            str(field)
            for field in current_overrides
            if str(field) in EDITABLE_FIELDS
        }

    for field, value in updates.items():
        if field in {"display_name", "headline", "summary"}:
            setattr(profile, field, _normalize_text(value))
        else:
            if not isinstance(value, list):
                raise _validation_error(f"{field} must be a list of strings")
            normalized_items = _normalize_items([str(item) for item in value])
            setattr(profile, field, normalized_items)

        manual_overrides.add(field)

    profile.confidence_json = _updated_confidence_json(existing_confidence, manual_overrides)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me/suggestions/latest", response_model=ProfileSuggestionOut)
def get_latest_profile_suggestion(user: CurrentUser, db: DBSession):
    resume = _get_latest_resume_suggestion(db, user.id)
    if resume is None:
        raise HTTPException(status_code=404, detail={"code": "NO_SUGGESTION", "message": "no resume suggestion found"})

    payload = resume.parsed_profile_json if isinstance(resume.parsed_profile_json, dict) else {}
    return ProfileSuggestionOut(
        resume_version_id=resume.id,
        parsed_at=resume.parsed_at,
        parse_confidence=float(payload.get("parse_confidence")) if payload.get("parse_confidence") is not None else None,
        suggestion=payload,
    )


@router.post("/me/suggestions/apply", response_model=ProfileOut)
def apply_profile_suggestion(payload: ApplyProfileSuggestionIn, user: CurrentUser, db: DBSession):
    resume = _get_latest_resume_suggestion(db, user.id)
    if resume is None:
        raise HTTPException(status_code=404, detail={"code": "NO_SUGGESTION", "message": "no resume suggestion found"})

    suggestion = resume.parsed_profile_json if isinstance(resume.parsed_profile_json, dict) else {}
    if not suggestion:
        raise HTTPException(status_code=404, detail={"code": "NO_SUGGESTION", "message": "no resume suggestion found"})

    fields = payload.fields or ["headline", "summary", "skills", "titles", "industries"]
    fields = [str(f) for f in fields if str(f) in EDITABLE_FIELDS and str(f) != "display_name"]
    if not fields:
        raise _validation_error("no valid fields requested")

    profile = _get_or_create_profile(db, user.id)
    existing_confidence = profile.confidence_json if isinstance(profile.confidence_json, dict) else {}
    manual_overrides = set()
    current_overrides = existing_confidence.get(MANUAL_OVERRIDES_KEY, [])
    if isinstance(current_overrides, list):
        manual_overrides = {str(f) for f in current_overrides if str(f) in EDITABLE_FIELDS}

    # Apply suggested values; by default, do not overwrite manually overridden fields.
    for field in fields:
        if not payload.force and field in manual_overrides:
            continue
        value = suggestion.get(field)
        if field in {"headline", "summary"}:
            setattr(profile, field, _normalize_text(value if isinstance(value, str) or value is None else str(value)))
        else:
            if value is None:
                setattr(profile, field, [])
            elif isinstance(value, list):
                setattr(profile, field, _normalize_items([str(item) for item in value]))
            else:
                raise _validation_error(f"suggested {field} must be a list of strings")

        # If forcing, the user is explicitly choosing the suggestion: remove override.
        if payload.force and field in manual_overrides:
            manual_overrides.discard(field)

    profile.source_resume_id = resume.id
    profile.confidence_json = _updated_confidence_json(existing_confidence, manual_overrides)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/me/suggestions/reset", response_model=ProfileOut)
def reset_profile_fields_to_suggestion(
    payload: ApplyProfileSuggestionIn,
    user: CurrentUser,
    db: DBSession,
):
    """
    Remove manual overrides for fields and set them to the latest resume suggestion.
    """
    forced_payload = ApplyProfileSuggestionIn(fields=payload.fields, force=True)
    return apply_profile_suggestion(forced_payload, user, db)
