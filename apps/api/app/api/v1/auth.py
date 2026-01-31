from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from redis import Redis
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser
from app.auth.password import hash_password, verify_password
from app.auth.tokens import (
    create_access_token,
    create_refresh_token,
    revoke_access_token,
    revoke_refresh_token,
    rotate_refresh_token,
)
from app.db import get_db
from app.models import User
from app.models.user import UserStatus
from app.redis_client import get_redis

router = APIRouter(prefix="/auth", tags=["auth"])

DBSession = Annotated[Session, Depends(get_db)]
RedisClient = Annotated[Redis, Depends(get_redis)]


class AuthTokensOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


@router.post("/register", response_model=AuthTokensOut)
def register(payload: RegisterIn, db: DBSession, r: RedisClient):
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

    refresh_token, _ = create_refresh_token(db, user.id)
    access_token, ttl = create_access_token(r, user.id)
    db.commit()

    return AuthTokensOut(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ttl,
    )


class LoginIn(BaseModel):
    email: EmailStr
    password: str


@router.post("/login", response_model=AuthTokensOut)
def login(payload: LoginIn, db: DBSession, r: RedisClient):
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

    refresh_token, _ = create_refresh_token(db, user.id)
    access_token, ttl = create_access_token(r, user.id)
    db.commit()

    return AuthTokensOut(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ttl,
    )


class RefreshIn(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=AuthTokensOut)
def refresh(payload: RefreshIn, db: DBSession, r: RedisClient):
    try:
        new_refresh, new_token = rotate_refresh_token(db, payload.refresh_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="invalid refresh token") from None

    access_token, ttl = create_access_token(r, new_token.user_id)
    db.commit()

    return AuthTokensOut(
        access_token=access_token,
        refresh_token=new_refresh,
        expires_in=ttl,
    )


class LogoutIn(BaseModel):
    refresh_token: str


@router.post("/logout")
def logout(payload: LogoutIn, request: Request, db: DBSession, r: RedisClient):
    revoke_refresh_token(db, payload.refresh_token)

    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth.removeprefix("Bearer ").strip()
        revoke_access_token(r, token)

    db.commit()
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
