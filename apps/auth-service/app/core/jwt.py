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


def create_access_token(
    user_id: uuid.UUID,
    role: str,
    status: str,
    email: str | None = None,
    ttl_seconds: int | None = None,
) -> str:
    """Create a signed JWT access token with RS256."""
    if not settings.jwt_private_key:
        raise RuntimeError("JWT_PRIVATE_KEY not configured")

    now = _now()
    exp = now + timedelta(seconds=ttl_seconds or settings.access_token_ttl_seconds)
    payload = {
        "sub": str(user_id),
        "role": role,
        "status": status,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
    }
    return jwt.encode(payload, settings.jwt_private_key, algorithm=settings.jwt_algorithm)


def verify_access_token(token: str) -> dict:
    """Verify and decode a JWT access token using the public key."""
    if not settings.jwt_public_key:
        raise RuntimeError("JWT_PUBLIC_KEY not configured")

    try:
        return jwt.decode(
            token,
            settings.jwt_public_key,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
    except PyJWTError as exc:
        raise ValueError("invalid access token") from exc


def create_refresh_token() -> str:
    """Generate a cryptographically secure refresh token."""
    return secrets.token_urlsafe(48)


def hash_refresh_token(raw_token: str) -> str:
    """Hash a refresh token with pepper for storage."""
    data = f"{raw_token}{settings.refresh_token_pepper}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()
