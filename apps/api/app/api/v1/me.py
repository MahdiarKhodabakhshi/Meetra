from fastapi import APIRouter
from pydantic import BaseModel

from app.auth.deps import CurrentUser

router = APIRouter(prefix="/me", tags=["me"])


class MeOut(BaseModel):
    user_id: str
    clerk_user_id: str | None
    email: str | None
    name: str | None
    role: str
    status: str
    avatar_url: str | None


@router.get("", response_model=MeOut)
def me(user: CurrentUser):
    return MeOut(
        user_id=str(user.id),
        clerk_user_id=user.clerk_user_id,
        email=user.email,
        name=user.name,
        role=user.role.value,
        status=user.status.value,
        avatar_url=user.avatar_url,
    )
