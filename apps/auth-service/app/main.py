from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db import ensure_schema_exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure auth schema exists
    ensure_schema_exists()
    yield
    # Shutdown: nothing needed


app = FastAPI(
    title="Meetra Auth Service",
    description="Authentication microservice for Meetra",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.service_name}


app.include_router(v1_router, prefix="/v1")
