from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db import get_db
from app.models import User

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

        email = token.removeprefix(prefix).strip()
        if "@" not in email:
            raise _unauthorized("invalid email in token")

        user = db.scalar(select(User).where(User.email == email))
        if not user:
            user = User(email=email, name=None)
            db.add(user)
            db.commit()
            db.refresh(user)

        return user

    raise _unauthorized("auth not configured")


CurrentUser = Annotated[User, Depends(get_current_user)]
