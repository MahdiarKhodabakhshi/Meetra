from fastapi import APIRouter

from app.api.v1.admin_users import router as admin_users_router
from app.api.v1.auth import router as auth_router
from app.api.v1.events import router as events_router
from app.api.v1.profiles import router as profiles_router
from app.api.v1.resumes import router as resumes_router

router = APIRouter()
router.include_router(admin_users_router)
router.include_router(auth_router)
router.include_router(events_router)
router.include_router(profiles_router)
router.include_router(resumes_router)
