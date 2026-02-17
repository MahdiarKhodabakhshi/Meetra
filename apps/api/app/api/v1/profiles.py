from __future__ import annotations

from typing import Any, Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.schemas.profiles import ProfileOut, ProfileUpdate
from app.auth.deps import CurrentUser
from app.db import get_db
from app.models import Profile

router = APIRouter(prefix="/profiles", tags=["profiles"])

DBSession = Annotated[Session, Depends(get_db)]

USER_CONFIRMED = "USER_CONFIRMED"
MANUAL_OVERRIDES_KEY = "manual_overrides"
EDITABLE_FIELDS = ("headline", "summary", "skills", "titles", "industries")


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
        if field in {"headline", "summary"}:
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
