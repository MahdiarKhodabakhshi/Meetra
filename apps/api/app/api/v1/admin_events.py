"""Admin-only event moderation (hide / feature / notes)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.errors import http_error_from_service
from app.api.v1.schemas.events import AdminEventModerationIn, EventListOut, EventOut
from app.auth.deps import require_role_orm
from app.db import get_db
from app.models import Event, User
from app.models.event import EventStatus
from app.models.user import UserRole
from app.services import events_service
from app.services.exceptions import ServiceError

router = APIRouter(
    prefix="/admin/events",
    tags=["admin-events"],
)

DBSession = Annotated[Session, Depends(get_db)]
AdminUser = Annotated[User, Depends(require_role_orm(UserRole.ADMIN))]


@router.get("", response_model=EventListOut)
def list_events_for_moderation(
    db: DBSession,
    _admin: AdminUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    status: EventStatus | None = Query(default=None),
    hidden: bool | None = Query(default=None, description="Filter by is_hidden"),
    featured: bool | None = Query(default=None, description="Filter by is_featured"),
    q: str | None = Query(default=None, description="Case-insensitive title search"),
):
    filters: list = []
    if status is not None:
        filters.append(Event.status == status)
    if hidden is not None:
        filters.append(Event.is_hidden == hidden)
    if featured is not None:
        filters.append(Event.is_featured == featured)
    if q and q.strip():
        filters.append(Event.title.ilike(f"%{q.strip()}%"))

    list_stmt = select(Event)
    count_stmt = select(func.count()).select_from(Event)
    if filters:
        list_stmt = list_stmt.where(*filters)
        count_stmt = count_stmt.where(*filters)

    total = db.scalar(count_stmt) or 0

    items = (
        db.scalars(
            list_stmt.order_by(Event.is_featured.desc(), Event.updated_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        .all()
    )

    return EventListOut(items=items, page=page, page_size=page_size, total=total)


@router.patch("/{event_id}/moderation", response_model=EventOut)
def patch_event_moderation(
    event_id: str,
    payload: AdminEventModerationIn,
    db: DBSession,
    admin: AdminUser,
):
    try:
        return events_service.moderate_event(db, admin, event_id, payload)
    except ServiceError as exc:
        raise http_error_from_service(exc) from exc
