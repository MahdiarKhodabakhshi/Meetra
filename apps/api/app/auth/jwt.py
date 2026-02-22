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
    status: str = "ACTIVE",
    email: str | None = None,
    ttl_seconds: int | None = None,
) -> str:
    """
    Create a JWT access token (legacy HS256 mode for core API).
    
    NOTE: In production, tokens should be created by auth-service using RS256.
    This function exists for backward compatibility during migration.
    """
    if not settings.jwt_secret:
        raise RuntimeError("JWT_SECRET not configured for token creation")
    
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
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token() -> str:
    """Generate a cryptographically secure refresh token."""
    return secrets.token_urlsafe(48)


def verify_access_token(token: str) -> dict:
    """
    Verify and decode a JWT access token.
    
    During migration, tries RS256 (auth-service) first, then HS256 (legacy).
    """
    errors = []
    
    # Try RS256 first (tokens from auth-service)
    if settings.jwt_public_key:
        try:
            return jwt.decode(
                token,
                settings.jwt_public_key,
                algorithms=["RS256"],
                issuer=settings.jwt_issuer,
                audience=settings.jwt_audience,
            )
        except PyJWTError as e:
            errors.append(f"RS256: {e}")
    
    # Try HS256 (legacy tokens from core API)
    if settings.jwt_use_legacy_hs256 and settings.jwt_secret:
        try:
            return jwt.decode(
                token,
                settings.jwt_secret,
                algorithms=["HS256"],
                issuer=settings.jwt_issuer,
                audience=settings.jwt_audience,
            )
        except PyJWTError as e:
            errors.append(f"HS256: {e}")
    
    raise ValueError(f"invalid access token: {'; '.join(errors)}")


def hash_refresh_token(raw_token: str) -> str:
    """Hash a refresh token with pepper for storage lookup."""
    data = f"{raw_token}{settings.refresh_token_pepper}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()
