from __future__ import annotations

from fastapi import APIRouter, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from app.core.config import settings
from app.db import SessionLocal
from app.models.user import User
from app.models.user import UserRole, UserStatus

router = APIRouter(prefix="/webhooks/clerk", tags=["clerk-webhooks"])


def _extract_primary_email(data: dict) -> str | None:
    primary_email_id = data.get("primary_email_address_id")
    email_addresses = data.get("email_addresses") or []
    for email_obj in email_addresses:
        if email_obj.get("id") == primary_email_id:
            return email_obj.get("email_address")
    if email_addresses:
        return email_addresses[0].get("email_address")
    return None


def _extract_name(data: dict) -> str | None:
    first = (data.get("first_name") or "").strip()
    last = (data.get("last_name") or "").strip()
    full = f"{first} {last}".strip()
    username = (data.get("username") or "").strip()
    return full or username or None


@router.post("")
async def clerk_webhook(
    request: Request,
    svix_id: str | None = Header(default=None, alias="svix-id"),
    svix_timestamp: str | None = Header(default=None, alias="svix-timestamp"),
    svix_signature: str | None = Header(default=None, alias="svix-signature"),
):
    if not settings.clerk_webhook_signing_secret:
        raise HTTPException(status_code=500, detail="missing webhook signing secret")

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(status_code=400, detail="missing svix headers")

    payload_bytes = await request.body()
    payload_str = payload_bytes.decode("utf-8")

    wh = Webhook(settings.clerk_webhook_signing_secret)

    try:
        event = wh.verify(
            payload_str,
            {
                "svix-id": svix_id,
                "svix-timestamp": svix_timestamp,
                "svix-signature": svix_signature,
            },
        )
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="invalid webhook signature") from None

    event_type = event.get("type")
    data = event.get("data", {})

    clerk_user_id = data.get("id")
    if not clerk_user_id:
        raise HTTPException(status_code=400, detail="missing Clerk user id")

    email = _extract_primary_email(data)
    name = _extract_name(data)
    avatar_url = data.get("image_url")

    if not email:
        print("WARNING: Clerk user has no email, skipping user sync:", clerk_user_id)
        return {"status": "skipped_no_email"}

    db: Session = SessionLocal()
    try:
        print("CLERK WEBHOOK type:", event_type)
        print("CLERK WEBHOOK clerk_user_id:", clerk_user_id)
        print("CLERK WEBHOOK email:", email)
        print("CLERK WEBHOOK name:", name)

        user = db.scalar(select(User).where(User.clerk_user_id == clerk_user_id))

        if event_type == "user.created":
            if not user:
                user = User(
                    clerk_user_id=clerk_user_id,
                    email=email,
                    name=name,
                    avatar_url=avatar_url,
                    role=UserRole.ATTENDEE,
                    status=UserStatus.ACTIVE,
                )
                db.add(user)
            else:
                user.email = email
                user.name = name
                user.avatar_url = avatar_url
                db.add(user)

        elif event_type == "user.updated":
            if user:
                user.email = email
                user.name = name
                user.avatar_url = avatar_url
                db.add(user)
            else:
                user = User(
                    clerk_user_id=clerk_user_id,
                    email=email,
                    name=name,
                    avatar_url=avatar_url,
                    role=UserRole.ATTENDEE,
                    status=UserStatus.ACTIVE,
                )
                db.add(user)

        elif event_type == "user.deleted":
            if user:
                user.status = UserStatus.DELETED
                db.add(user)

        else:
            return {"status": "ignored", "type": event_type}

        db.commit()
        return {"status": "ok", "type": event_type}

    except Exception as e:
        db.rollback()
        print("CLERK WEBHOOK ERROR:", repr(e))
        raise

    finally:
        db.close()