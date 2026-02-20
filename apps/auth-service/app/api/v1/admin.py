from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import or_, select, update
from sqlalchemy.orm import Session

from app.api.v1.schemas import UpdateUserIn, UserOut
from app.core.jwt import verify_access_token
from app.db import get_db
from app.models import AuthUser, RefreshToken, UserRole, UserStatus

router = APIRouter(prefix="/auth/admin", tags=["auth-admin"])

DBSession = Annotated[Session, Depends(get_db)]


def _require_admin(request: Request) -> dict:
    """Verify the caller is an admin."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")

    token = auth.removeprefix("Bearer ").strip()
    try:
        payload = verify_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="invalid access token")

    if payload.get("role") != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="admin role required")

    return payload


AdminToken = Annotated[dict, Depends(_require_admin)]


@router.get("/users", response_model=list[UserOut])
def list_users(
    admin: AdminToken,
    db: DBSession,
    q: str | None = Query(None, description="Search by email"),
    limit: int = Query(50, le=200),
):
    """List all users (admin only)."""
    stmt = select(AuthUser).order_by(AuthUser.created_at.desc()).limit(limit)

    if q:
        like = f"%{q}%"
        stmt = stmt.where(AuthUser.email.ilike(like))

    users = db.scalars(stmt).all()
    return [
        UserOut(
            user_id=str(u.id),
            email=u.email,
            role=u.role.value,
            status=u.status.value,
            last_login_at=u.last_login_at.isoformat() if u.last_login_at else None,
            created_at=u.created_at.isoformat(),
        )
        for u in users
    ]


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: str, admin: AdminToken, db: DBSession):
    """Get a specific user by ID (admin only)."""
    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user_id format")

    user = db.get(AuthUser, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    return UserOut(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        status=user.status.value,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat(),
    )


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UpdateUserIn, admin: AdminToken, db: DBSession):
    """Update user role or status (admin only)."""
    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user_id format")

    user = db.get(AuthUser, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    if payload.role is not None:
        try:
            user.role = UserRole(payload.role.upper())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"invalid role: must be one of {[r.value for r in UserRole]}",
            )

    if payload.status is not None:
        try:
            user.status = UserStatus(payload.status.upper())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"invalid status: must be one of {[s.value for s in UserStatus]}",
            )

    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        user_id=str(user.id),
        email=user.email,
        role=user.role.value,
        status=user.status.value,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        created_at=user.created_at.isoformat(),
    )


@router.post("/users/{user_id}/revoke-sessions")
def revoke_sessions(user_id: str, admin: AdminToken, db: DBSession):
    """Revoke all refresh tokens for a user (admin only)."""
    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user_id format")

    user = db.get(AuthUser, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    now = datetime.now(timezone.utc)
    result = db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == target_id)
        .where(RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    db.commit()

    return {"status": "ok", "revoked_count": result.rowcount}


@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin: AdminToken, db: DBSession):
    """
    Soft-delete a user by setting status to DELETED (admin only).
    Also revokes all their sessions.
    """
    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user_id format")

    user = db.get(AuthUser, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    # Soft delete
    user.status = UserStatus.DELETED
    db.add(user)

    # Revoke all sessions
    now = datetime.now(timezone.utc)
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == target_id)
        .where(RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )

    db.commit()
    return {"status": "ok", "user_id": user_id}
