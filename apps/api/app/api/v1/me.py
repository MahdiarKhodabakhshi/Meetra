from fastapi import APIRouter
from pydantic import BaseModel

from app.auth.deps import CurrentUser

router = APIRouter(prefix="/me", tags=["me"])


class MeOut(BaseModel):
    user_id: str
    email: str
    name: str | None


@router.get("", response_model=MeOut)
def me(user: CurrentUser):
    return MeOut(user_id=str(user.id), email=user.email, name=user.name)
