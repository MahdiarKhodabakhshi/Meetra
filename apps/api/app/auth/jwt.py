from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from jwt import PyJWTError

from app.core.config import settings


def _now() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(user_id: uuid.UUID, role: str, ttl_seconds: int | None = None) -> str:
    now = _now()
    exp = now + timedelta(seconds=ttl_seconds or settings.access_token_ttl_seconds)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
    except PyJWTError as exc:
        raise ValueError("invalid access token") from exc


def create_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(raw_token: str) -> str:
    data = f"{raw_token}{settings.refresh_token_pepper}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()
