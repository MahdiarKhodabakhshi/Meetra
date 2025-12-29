from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.dev import router as dev_router
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.middleware.rate_limit import RateLimitMiddleware
from app.middleware.request_id import RequestIdMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

configure_logging()

app = FastAPI(title="Meetra API")

# Middleware ordering matters.
# Starlette runs the LAST added middleware FIRST (outermost).
# We want:
# - RequestId + SecurityHeaders to apply even to CORS preflight + rate limit responses
# - CORS to handle preflight properly
# - RateLimit to be closest to the app (innermost)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIdMiddleware)

Instrumentator().instrument(app).expose(app, endpoint="/metrics", include_in_schema=False)


@app.get("/")
def root():
    return {"name": "Meetra API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(v1_router, prefix="/v1")

if settings.env == "local":
    app.include_router(dev_router)
