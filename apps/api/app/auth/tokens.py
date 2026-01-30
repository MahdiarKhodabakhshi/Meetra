from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from redis import Redis
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import RefreshToken


def _now() -> datetime:
    return datetime.now(timezone.utc)


def hash_refresh_token(raw_token: str) -> str:
    data = f"{raw_token}{settings.refresh_token_pepper}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def create_refresh_token(
    db: Session,
    user_id: uuid.UUID,
    family_id: uuid.UUID | None = None,
) -> tuple[str, RefreshToken]:
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_refresh_token(raw_token)
    now = _now()
    expires_at = now + timedelta(days=settings.refresh_token_ttl_days)

    token = RefreshToken(
        user_id=user_id,
        token_hash=token_hash,
        issued_at=now,
        expires_at=expires_at,
        family_id=family_id or uuid.uuid4(),
    )
    db.add(token)
    db.flush()
    return raw_token, token


def rotate_refresh_token(
    db: Session,
    raw_token: str,
) -> tuple[str, RefreshToken]:
    token_hash = hash_refresh_token(raw_token)
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    if not token:
        raise ValueError("invalid refresh token")

    now = _now()
    if token.revoked_at is not None:
        raise ValueError("refresh token revoked")
    if token.expires_at <= now:
        raise ValueError("refresh token expired")

    new_raw, new_token = create_refresh_token(db, token.user_id, token.family_id)
    token.revoked_at = now
    token.replaced_by = new_token.id
    db.add(token)
    return new_raw, new_token


def revoke_refresh_token(db: Session, raw_token: str) -> RefreshToken | None:
    token_hash = hash_refresh_token(raw_token)
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == token_hash))
    if not token:
        return None
    if token.revoked_at is None:
        token.revoked_at = _now()
        db.add(token)
    return token


def create_access_token(r: Redis, user_id: uuid.UUID) -> tuple[str, int]:
    raw_token = secrets.token_urlsafe(32)
    key = f"access:{raw_token}"
    ttl = settings.access_token_ttl_seconds
    r.setex(key, ttl, str(user_id))
    return raw_token, ttl


def get_user_id_for_access_token(r: Redis, raw_token: str) -> str | None:
    return r.get(f"access:{raw_token}")


def revoke_access_token(r: Redis, raw_token: str) -> None:
    r.delete(f"access:{raw_token}")
