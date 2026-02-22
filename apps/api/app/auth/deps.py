from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated, Callable

import uuid

from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_access_token
from app.core.config import settings
from app.db import get_db
from app.models import User
from app.models.user import UserRole, UserStatus

DBSession = Annotated[Session, Depends(get_db)]


def _unauthorized(detail: str = "unauthorized") -> HTTPException:
    return HTTPException(
        status_code=401,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


@dataclass
class TokenUser:
    """
    User identity from JWT claims (stateless).
    
    This is the primary identity object for microservices architecture.
    Does NOT require database lookup - trusts auth-service JWT claims.
    """

    id: uuid.UUID
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
    """
    Extract and validate user identity from JWT (stateless).
    
    This is the preferred dependency for microservices architecture.
    Trusts JWT claims issued by auth-service without DB lookup.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise _unauthorized("missing bearer token")

    token = auth.removeprefix("Bearer ").strip()

    # Local dev auth mode
    if settings.auth_mode == "dev" and settings.env == "local":
        prefix = settings.dev_auth_prefix
        if not token.startswith(prefix):
            raise _unauthorized(f"invalid dev token (expected prefix {prefix})")

        email = token.removeprefix(prefix).strip().lower()
        if "@" not in email:
            raise _unauthorized("invalid email in token")

        # In dev mode, create a fake TokenUser
        return TokenUser(
            id=uuid.uuid5(uuid.NAMESPACE_DNS, email),
            email=email,
            role=UserRole.ATTENDEE,
            status=UserStatus.ACTIVE,
        )

    # JWT mode (RS256 from auth-service)
    try:
        payload = verify_access_token(token)
    except ValueError:
        raise _unauthorized("invalid access token")

    sub = payload.get("sub")
    if not sub:
        raise _unauthorized("invalid token: missing sub")

    try:
        user_id = uuid.UUID(str(sub))
    except ValueError:
        raise _unauthorized("invalid token: invalid sub format")

    # Extract claims
    role_str = payload.get("role", "ATTENDEE")
    status_str = payload.get("status", "ACTIVE")
    email = payload.get("email")

    try:
        role = UserRole(role_str)
    except ValueError:
        role = UserRole.ATTENDEE

    try:
        status = UserStatus(status_str)
    except ValueError:
        status = UserStatus.ACTIVE

    # Validate status from token
    if status != UserStatus.ACTIVE:
        raise _unauthorized("user is not active")

    return TokenUser(id=user_id, email=email, role=role, status=status)


# Primary dependency for stateless auth
CurrentTokenUser = Annotated[TokenUser, Depends(get_token_user)]


def get_current_user(request: Request, db: DBSession) -> User:
    """
    Get full User model from database (legacy).
    
    DEPRECATED for new code. Use get_token_user instead.
    
    This function exists for backward compatibility with code that needs
    the full User ORM object. It first validates the JWT, then loads
    the User from database.
    
    For new endpoints, prefer CurrentTokenUser which is stateless.
    """
    # First validate JWT and get identity
    token_user = get_token_user(request)

    # For dev mode, ensure user exists in DB
    if settings.auth_mode == "dev" and settings.env == "local":
        user = db.scalar(select(User).where(User.email == token_user.email))
        if not user:
            user = User(id=token_user.id, email=token_user.email, name=None)
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # In JWT mode, load user from DB
    user = db.get(User, token_user.id)
    if not user:
        raise _unauthorized("user not found in database")

    return user


# Legacy dependency - use CurrentTokenUser for new code
CurrentUser = Annotated[User, Depends(get_current_user)]


def require_role(*roles: UserRole) -> Callable[[CurrentTokenUser], TokenUser]:
    """Dependency that requires the user to have one of the specified roles."""

    def _check(user: CurrentTokenUser) -> TokenUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="forbidden")
        return user

    return _check


def require_role_orm(*roles: UserRole) -> Callable[[CurrentUser], User]:
    """
    Dependency that requires the user to have one of the specified roles (ORM version).
    DEPRECATED: Use require_role with CurrentTokenUser for new code.
    """

    def _check(user: CurrentUser) -> User:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="forbidden")
        return user

    return _check
