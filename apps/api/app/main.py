from fastapi import FastAPI
from fastapi.responses import Response

app = FastAPI(title="Meetra API")


@app.get("/")
def root():
    return {"name": "Meetra API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/favicon.ico")
def favicon():
    return Response(status_code=204)
