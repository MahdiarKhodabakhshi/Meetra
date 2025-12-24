from fastapi import FastAPI

from app.api.v1.router import router as v1_router

app = FastAPI(title="Meetra API")


@app.get("/")
def root():
    return {"name": "Meetra API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(v1_router, prefix="/v1")
