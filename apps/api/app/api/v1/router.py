from fastapi import APIRouter

from app.api.v1.admin_users import router as admin_users_router
from app.api.v1.auth import router as auth_router
from app.api.v1.events import router as events_router

router = APIRouter()
router.include_router(admin_users_router)
router.include_router(auth_router)
router.include_router(events_router)
