from __future__ import annotations

from typing import Annotated

import uuid

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import User
from app.redis_client import get_redis
from app.auth.tokens import get_user_id_for_access_token

DBSession = Annotated[Session, Depends(get_db)]


def _unauthorized(detail: str = "unauthorized") -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(request: Request, db: DBSession) -> User:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise _unauthorized("missing bearer token")

    token = auth.removeprefix("Bearer ").strip()

    # Local dev auth only
    if settings.auth_mode == "dev" and settings.env == "local":
        prefix = settings.dev_auth_prefix
        if not token.startswith(prefix):
            raise _unauthorized(f"invalid dev token (expected prefix {prefix})")

        email = token.removeprefix(prefix).strip().lower()
        if "@" not in email:
            raise _unauthorized("invalid email in token")

        user = db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(email=email, name=None)
            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    if settings.auth_mode == "password":
        r = get_redis()
        user_id = get_user_id_for_access_token(r, token)
        if not user_id:
            raise _unauthorized("invalid access token")
        try:
            user_uuid = uuid.UUID(str(user_id))
        except ValueError:
            raise _unauthorized("invalid access token")
        user = db.get(User, user_uuid)
        if not user:
            raise _unauthorized("user not found")
        return user

    raise _unauthorized("auth not configured")


CurrentUser = Annotated[User, Depends(get_current_user)]
