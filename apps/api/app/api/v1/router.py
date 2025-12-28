from fastapi import APIRouter

from app.api.v1.events import router as events_router
from app.api.v1.me import router as me_router

router = APIRouter()
router.include_router(events_router)
router.include_router(me_router)
