#get_token_user, get_current_user, require_role

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Callable

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

import structlog

from app.core.config import settings
from app.db import get_db
from app.models import User
from app.models.user import UserRole, UserStatus
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions

logger = structlog.get_logger(__name__)

clerk = Clerk(bearer_auth=settings.clerk_secret_key)

DBSession = Annotated[Session, Depends(get_db)]


def require_core_legacy_auth_routes() -> None:
    if not settings.core_legacy_auth_routes_enabled:
        raise HTTPException(
            status_code=404,
            detail=(
                "core legacy auth is disabled; use auth-service. "
                "Set CORE_LEGACY_AUTH_ROUTES_ENABLED=1 for monolith rollback."
            ),
        )


def _unauthorized(detail: str = "unauthorized") -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


@dataclass
class TokenUser:

    id: str
    email: str | None
    role: UserRole
    status: UserStatus

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN

    @property
    def is_organizer(self) -> bool:
        return self.role in (UserRole.ORGANIZER, UserRole.ADMIN)


def get_token_user(request: Request) -> TokenUser:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise _unauthorized("missing bearer token")

    token = auth.removeprefix("Bearer ").strip()

    if settings.auth_mode == "dev" and settings.env == "local":
        prefix = settings.dev_auth_prefix
        if not token.startswith(prefix):
            raise _unauthorized(f"invalid dev token (expected prefix {prefix})")

        email = token.removeprefix(prefix).strip().lower()
        if "@" not in email:
            raise _unauthorized("invalid email in token")

        return TokenUser(
            id=f"dev_{email}",
            email=email,
            role=UserRole.ATTENDEE,
            status=UserStatus.ACTIVE,
        )

    try:
        request_state = clerk.authenticate_request(
            request,
            AuthenticateRequestOptions(
                # add your frontend origin here later if needed
                authorized_parties=settings.cors_allow_origins,
            ),
        )
    except Exception:
        raise _unauthorized("invalid clerk token")

    if not request_state.is_signed_in:
        raise _unauthorized("invalid clerk token")

    payload = request_state.payload or {}
    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized("invalid token: missing sub")

    email = payload.get("email")

    return TokenUser(
        id=user_id,
        email=email,
        role=UserRole.ATTENDEE,
        status=UserStatus.ACTIVE,
    )


CurrentTokenUser = Annotated[TokenUser, Depends(get_token_user)]

def _get_clerk_user_info(clerk_user_id: str):
    try:
        cu = clerk.users.get(user_id=clerk_user_id)
    except Exception as e:
        logger.warning("clerk_user_fetch_error", clerk_user_id=clerk_user_id, error=repr(e))
        return None, None, None

    email = None
    if cu.email_addresses:
        for addr in cu.email_addresses:
            if getattr(addr, "id", None) == getattr(cu, "primary_email_address_id", None):
                email = getattr(addr, "email_address", None)
                break

        if email is None:
            email = getattr(cu.email_addresses[0], "email_address", None)

    first = getattr(cu, "first_name", "") or ""
    last = getattr(cu, "last_name", "") or ""
    name = f"{first} {last}".strip() or None

    avatar = getattr(cu, "image_url", None)

    return email, name, avatar

def get_current_user(request: Request, db: DBSession) -> User:

    token_user = get_token_user(request)

    # For dev mode, ensure user exists in DB
    if settings.auth_mode == "dev" and settings.env == "local":
        user = db.scalar(select(User).where(User.email == token_user.email))
        if not user:
            user = User(
                email=token_user.email,
                clerk_user_id=f"dev_{token_user.email}",
                name=None,
                role=UserRole.ATTENDEE,
                status=UserStatus.ACTIVE,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    
    user = db.scalar(
        select(User).where(User.clerk_user_id == token_user.id)
    )
    if not user:
        email, name, avatar = _get_clerk_user_info(token_user.id)

        user = User(
            clerk_user_id=token_user.id,
            email=email,
            name=name,
            avatar_url=avatar,
            role=UserRole.ATTENDEE,
            status=UserStatus.ACTIVE,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    changed = False

    # Only call Clerk API to backfill when identity fields are missing.
    # The webhook handler keeps these in sync for normal updates.
    if not user.email or not user.name or not user.avatar_url:
        email_from_clerk, name_from_clerk, avatar_from_clerk = _get_clerk_user_info(token_user.id)

        if email_from_clerk and user.email != email_from_clerk:
            user.email = email_from_clerk
            changed = True

        if name_from_clerk and user.name != name_from_clerk:
            user.name = name_from_clerk
            changed = True

        if avatar_from_clerk and user.avatar_url != avatar_from_clerk:
            user.avatar_url = avatar_from_clerk
            changed = True

    # Never sync role/status from Clerk token.
    # Those are app-owned fields in your DB.

    if changed:
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


# Legacy dependency - use CurrentTokenUser for new code
CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole) -> Callable[[CurrentTokenUser], TokenUser]:
    def _check(user: CurrentTokenUser) -> TokenUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="forbidden")
        return user

    return _check


def require_role_orm(*roles: UserRole) -> Callable[[CurrentUser], User]:

    def _check(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="forbidden")
        return user

    return _check
