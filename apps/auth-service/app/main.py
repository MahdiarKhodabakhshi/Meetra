from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.db import ensure_schema_exists
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware


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

# Middleware (parity with core API hardening)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.service_name}


@app.get("/version")
def version():
    return {"service": settings.service_name, "env": settings.env}


app.include_router(v1_router, prefix="/v1")
