from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

# Ensure auth mode + secrets are set before app import
os.environ.setdefault("AUTH_MODE", "jwt")
os.environ.setdefault("JWT_SECRET", "test_jwt_secret_32_chars_minimum")
os.environ.setdefault("REFRESH_TOKEN_PEPPER", "test_refresh_pepper")
os.environ.setdefault("ACCESS_TOKEN_TTL_SECONDS", "900")
os.environ.setdefault("REFRESH_TOKEN_TTL_DAYS", "30")
os.environ.setdefault("ENV", "local")
os.environ.setdefault("RATE_LIMIT_ENABLED", "false")

from app.main import app  # noqa: E402
from app.db import SessionLocal  # noqa: E402


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def clean_db():
    # Ensure a clean slate for each test
    db = SessionLocal()
    try:
        db.execute(
            text(
                "TRUNCATE TABLE refresh_tokens, event_attendees, events, users "
                "RESTART IDENTITY CASCADE"
            )
        )
        db.commit()
    finally:
        db.close()
    yield
