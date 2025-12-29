from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator

from app.api.dev import router as dev_router
from app.api.v1.router import router as v1_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.middleware.request_id import RequestIdMiddleware

configure_logging()

app = FastAPI(title="Meetra API")
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