from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.schemas import (
    AuthTokensOut,
    LoginIn,
    LogoutIn,
    MeOut,
    PublicKeyOut,
    RefreshIn,
    RegisterIn,
)
from app.core.config import settings
from app.core.jwt import create_access_token, create_refresh_token, hash_refresh_token
from app.core.password import hash_password, verify_password
from app.db import get_db
from app.models import AuthUser, RefreshToken, UserStatus

router = APIRouter(prefix="/auth", tags=["auth"])

DBSession = Annotated[Session, Depends(get_db)]


_AUTH_NAME_DEPRECATION_MSG = (
    "The auth-service does not own profile/display fields. "
    "The `name` field in auth responses is deprecated and will be removed."
)


@router.post("/register", response_model=AuthTokensOut)
def register(payload: RegisterIn, db: DBSession, response: Response):
    email = payload.email.strip().lower()
    existing = db.scalar(select(AuthUser).where(AuthUser.email == email))
    if existing:
        raise HTTPException(status_code=409, detail="email already registered")

    user = AuthUser(
        email=email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="email already registered") from None

    raw_refresh = create_refresh_token()
    refresh_hash = hash_refresh_token(raw_refresh)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.refresh_token_ttl_days)
    token_row = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        issued_at=now,
        expires_at=expires_at,
        family_id=uuid.uuid4(),
    )
    db.add(token_row)

    access_token = create_access_token(
        user.id, user.role.value, user.status.value, user.email
    )
    db.commit()

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=raw_refresh,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=int(settings.refresh_token_ttl_days * 86400),
        path="/",
    )

    response.headers.setdefault("Deprecation", "true")
    response.headers.setdefault("Warning", f'299 - "{_AUTH_NAME_DEPRECATION_MSG}"')
    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=None,
        role=user.role.value,
        status=user.status.value,
    )


@router.post("/login", response_model=AuthTokensOut)
def login(payload: LoginIn, db: DBSession, response: Response):
    email = payload.email.strip().lower()
    user = db.scalar(select(AuthUser).where(AuthUser.email == email))
    if not user:
        raise HTTPException(status_code=401, detail="invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="invalid credentials")
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="user is not active")

    user.last_login_at = datetime.now(timezone.utc)
    db.add(user)

    raw_refresh = create_refresh_token()
    refresh_hash = hash_refresh_token(raw_refresh)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.refresh_token_ttl_days)
    token_row = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        issued_at=now,
        expires_at=expires_at,
        family_id=uuid.uuid4(),
    )
    db.add(token_row)

    access_token = create_access_token(
        user.id, user.role.value, user.status.value, user.email
    )
    db.commit()

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=raw_refresh,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=int(settings.refresh_token_ttl_days * 86400),
        path="/",
    )

    response.headers.setdefault("Deprecation", "true")
    response.headers.setdefault("Warning", f'299 - "{_AUTH_NAME_DEPRECATION_MSG}"')
    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=None,
        role=user.role.value,
        status=user.status.value,
    )


@router.post("/refresh", response_model=AuthTokensOut)
def refresh(
    request: Request, response: Response, db: DBSession, payload: RefreshIn | None = None
):
    raw_refresh = payload.refresh_token if payload else None
    if not raw_refresh:
        raw_refresh = request.cookies.get(settings.refresh_cookie_name)
    if not raw_refresh:
        raise HTTPException(status_code=401, detail="missing refresh token")

    refresh_hash = hash_refresh_token(raw_refresh)
    token = db.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == refresh_hash)
    )
    if not token:
        raise HTTPException(status_code=401, detail="invalid refresh token")

    now = datetime.now(timezone.utc)
    if token.revoked_at is not None:
        # Replay detected: revoke entire family
        if token.family_id:
            db.execute(
                update(RefreshToken)
                .where(RefreshToken.family_id == token.family_id)
                .values(revoked_at=now)
            )
        db.commit()
        raise HTTPException(status_code=401, detail="refresh token revoked")

    if token.expires_at <= now:
        raise HTTPException(status_code=401, detail="refresh token expired")

    # Rotate
    new_raw = create_refresh_token()
    new_hash = hash_refresh_token(new_raw)
    family_id = token.family_id or uuid.uuid4()
    new_token = RefreshToken(
        user_id=token.user_id,
        token_hash=new_hash,
        issued_at=now,
        expires_at=now + timedelta(days=settings.refresh_token_ttl_days),
        family_id=family_id,
    )
    db.add(new_token)
    db.flush()

    token.revoked_at = now
    token.replaced_by = new_token.id
    db.add(token)

    user = db.get(AuthUser, token.user_id)
    if not user:
        db.rollback()
        raise HTTPException(status_code=401, detail="user not found")
    if user.status != UserStatus.ACTIVE:
        db.rollback()
        raise HTTPException(status_code=403, detail="user is not active")

    access_token = create_access_token(
        user.id, user.role.value, user.status.value, user.email
    )
    db.commit()

    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=new_raw,
        httponly=True,
        secure=settings.refresh_cookie_secure,
        samesite=settings.refresh_cookie_samesite,
        max_age=int(settings.refresh_token_ttl_days * 86400),
        path="/",
    )

    response.headers.setdefault("Deprecation", "true")
    response.headers.setdefault("Warning", f'299 - "{_AUTH_NAME_DEPRECATION_MSG}"')
    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=None,
        role=user.role.value,
        status=user.status.value,
    )


@router.post("/logout")
def logout(
    request: Request, response: Response, db: DBSession, payload: LogoutIn | None = None
):
    raw_refresh = payload.refresh_token if payload else None
    if not raw_refresh:
        raw_refresh = request.cookies.get(settings.refresh_cookie_name)
    if raw_refresh:
        refresh_hash = hash_refresh_token(raw_refresh)
        token = db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == refresh_hash)
        )
        if token and token.revoked_at is None:
            token.revoked_at = datetime.now(timezone.utc)
            db.add(token)

    db.commit()
    response.delete_cookie(key=settings.refresh_cookie_name, path="/")
    return {"status": "ok"}


@router.get("/me", response_model=MeOut)
def me(request: Request, db: DBSession):
    """Get current user info from token. Validates token is still valid."""
    from app.core.jwt import verify_access_token

    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")

    token = auth.removeprefix("Bearer ").strip()
    try:
        payload = verify_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="invalid access token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="invalid token payload")

    # Optionally verify user still exists and is active
    user = db.get(AuthUser, uuid.UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="user not found")
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="user is not active")

    return MeOut(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        status=user.status.value,
    )


@router.get("/public-key", response_model=PublicKeyOut)
def public_key(response: Response):
    """Expose PEM public key used to verify RS256 JWTs (not a JWKS)."""
    if not settings.jwt_public_key:
        raise HTTPException(status_code=503, detail="public key not configured")

    response.headers.setdefault(
        "Cache-Control",
        # Safe default: public key changes are rare; keep caching conservative.
        "public, max-age=300",
    )
    return PublicKeyOut(
        algorithm=settings.jwt_algorithm,
        public_key=settings.jwt_public_key,
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
    )


@router.get("/.well-known/jwks", response_model=PublicKeyOut, include_in_schema=False)
def legacy_jwks_alias(response: Response):
    """
    Backward-compatible alias for older clients.

    Note: This endpoint does NOT return a real JWKS (no kid/kty/n/e). Prefer `/public-key`.
    """
    response.headers.setdefault("Deprecation", "true")
    response.headers.setdefault(
        "Warning",
        '299 - "This endpoint is not a real JWKS; use /v1/auth/public-key instead."',
    )
    return public_key(response)
