from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.dev import router as dev_router
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.migrations import upgrade_head
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

configure_logging()

app = FastAPI(title="Meetra API")
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)

Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)


@app.on_event("startup")
def _local_auto_migrate() -> None:
    if settings.env != "local" or not settings.auto_migrate:
        return
    upgrade_head(database_url=settings.database_url)


@app.get("/")
def root():
    return {"name": "Meetra API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/version")
def version():
    return {"service": "core-api", "env": settings.env}


app.include_router(v1_router, prefix="/v1")

if settings.env == "local":
    app.include_router(dev_router)
