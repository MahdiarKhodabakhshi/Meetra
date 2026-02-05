from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_, select, update
from sqlalchemy.orm import Session

from app.auth.deps import CurrentUser, require_role
from app.db import get_db
from app.models import RefreshToken, User
from app.models.user import UserRole, UserStatus

router = APIRouter(
    prefix="/admin/users",
    tags=["admin"],
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)

DBSession = Annotated[Session, Depends(get_db)]
AdminUser = Annotated[User, Depends(require_role(UserRole.ADMIN))]


class UserOut(BaseModel):
    user_id: str
    email: str | None
    name: str | None
    role: str
    status: str
    created_at: datetime
    last_login_at: datetime | None


@router.get("", response_model=list[UserOut])
def list_users(
    db: DBSession,
    query: str | None = Query(default=None, min_length=1),
    limit: int = Query(default=50, ge=1, le=200),
):
    stmt = select(User).order_by(User.created_at.desc()).limit(limit)
    if query:
        like = f"%{query.strip().lower()}%"
        stmt = stmt.where(
            or_(
                User.email.ilike(like),
                User.name.ilike(like),
            )
        )

    users = db.scalars(stmt).all()
    return [
        UserOut(
            user_id=str(u.id),
            email=u.email,
            name=u.name,
            role=u.role.value,
            status=u.status.value,
            created_at=u.created_at,
            last_login_at=u.last_login_at,
        )
        for u in users
    ]


class UpdateUserIn(BaseModel):
    role: UserRole | None = None
    status: UserStatus | None = None


@router.patch("/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UpdateUserIn, db: DBSession, admin: AdminUser):
    if payload.role is None and payload.status is None:
        raise HTTPException(status_code=400, detail="no changes provided")

    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user id")

    user = db.get(User, target_id)
    if not user:
        raise HTTPException(status_code=404, detail="user not found")

    if payload.role is not None:
        if user.id == admin.id:
            raise HTTPException(status_code=400, detail="cannot change own role")
        user.role = payload.role

    if payload.status is not None:
        user.status = payload.status

    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(
        user_id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
        created_at=user.created_at,
        last_login_at=user.last_login_at,
    )


@router.post("/{user_id}/revoke-sessions")
def revoke_sessions(user_id: str, db: DBSession):
    try:
        target_id = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="invalid user id")

    now = datetime.now(timezone.utc)
    result = db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == target_id)
        .where(RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    db.commit()

    return {"revoked": result.rowcount or 0}
