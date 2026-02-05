from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser
from app.auth.jwt import create_access_token, create_refresh_token, hash_refresh_token
from app.auth.password import hash_password, verify_password
from app.core.config import settings
from app.db import get_db
from app.models import RefreshToken, User
from app.models.user import UserStatus

router = APIRouter(prefix="/auth", tags=["auth"])

DBSession = Annotated[Session, Depends(get_db)]


class AuthTokensOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str | None
    name: str | None
    role: str
    status: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


@router.post("/register", response_model=AuthTokensOut)
def register(payload: RegisterIn, db: DBSession, response: Response):
    email = payload.email.strip().lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise HTTPException(status_code=409, detail="email already registered")

    user = User(email=email, name=payload.name, password_hash=hash_password(payload.password))
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

    access_token = create_access_token(user.id, user.role.value)
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

    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=AuthTokensOut)
def login(payload: LoginIn, db: DBSession, response: Response):
    email = payload.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    if not user or not user.password_hash:
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

    access_token = create_access_token(user.id, user.role.value)
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

    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


class RefreshIn(BaseModel):
    refresh_token: str | None = None


@router.post("/refresh", response_model=AuthTokensOut)
def refresh(request: Request, response: Response, db: DBSession, payload: RefreshIn | None = None):
    raw_refresh = payload.refresh_token if payload else None
    if not raw_refresh:
        raw_refresh = request.cookies.get(settings.refresh_cookie_name)
    if not raw_refresh:
        raise HTTPException(status_code=401, detail="missing refresh token")

    refresh_hash = hash_refresh_token(raw_refresh)
    token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == refresh_hash))
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

    user = db.get(User, token.user_id)
    if not user:
        db.rollback()
        raise HTTPException(status_code=401, detail="user not found")
    if user.status != UserStatus.ACTIVE:
        db.rollback()
        raise HTTPException(status_code=403, detail="user is not active")

    access_token = create_access_token(user.id, user.role.value)
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

    return AuthTokensOut(
        access_token=access_token,
        expires_in=settings.access_token_ttl_seconds,
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )


class LogoutIn(BaseModel):
    refresh_token: str | None = None


@router.post("/logout")
def logout(request: Request, response: Response, db: DBSession, payload: LogoutIn | None = None):
    raw_refresh = payload.refresh_token if payload else None
    if not raw_refresh:
        raw_refresh = request.cookies.get(settings.refresh_cookie_name)
    if raw_refresh:
        refresh_hash = hash_refresh_token(raw_refresh)
        token = db.scalar(select(RefreshToken).where(RefreshToken.token_hash == refresh_hash))
        if token and token.revoked_at is None:
            token.revoked_at = datetime.now(timezone.utc)
            db.add(token)

    db.commit()
    response.delete_cookie(key=settings.refresh_cookie_name, path="/")
    return {"status": "ok"}


class MeOut(BaseModel):
    user_id: str
    email: str | None
    name: str | None
    role: str
    status: str


@router.get("/me", response_model=MeOut)
def me(user: CurrentUser):
    return MeOut(
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
    )
