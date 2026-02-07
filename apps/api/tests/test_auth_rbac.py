from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient
from sqlalchemy import select, update

from app.auth.jwt import hash_refresh_token
from app.models import RefreshToken, User
from app.models.user import UserRole


def register(client: TestClient, email: str, password: str = "StrongPass123", name: str = "Test User"):
    return client.post(
        "/v1/auth/register",
        json={"email": email, "password": password, "name": name},
    )


def login(client: TestClient, email: str, password: str = "StrongPass123"):
    return client.post(
        "/v1/auth/login",
        json={"email": email, "password": password},
    )


def test_register_then_login_works(client: TestClient):
    resp = register(client, "reg1@example.com")
    assert resp.status_code == 200

    resp2 = login(client, "reg1@example.com")
    assert resp2.status_code == 200
    body = resp2.json()
    assert "access_token" in body


def test_login_sets_access_and_refresh_cookie(client: TestClient):
    register(client, "reg2@example.com")

    resp = login(client, "reg2@example.com")
    assert resp.status_code == 200
    body = resp.json()
    assert body["access_token"]
    set_cookie = resp.headers.get("set-cookie", "")
    assert "meetra_refresh" in set_cookie


def test_refresh_rotates_token(client: TestClient, db_session):
    register(client, "reg3@example.com")
    resp = login(client, "reg3@example.com")
    assert resp.status_code == 200

    old_raw = client.cookies.get("meetra_refresh")
    assert old_raw
    old_hash = hash_refresh_token(old_raw)
    old_token = db_session.scalar(select(RefreshToken).where(RefreshToken.token_hash == old_hash))
    assert old_token is not None
    assert old_token.revoked_at is None
    family_id = old_token.family_id

    refresh_resp = client.post("/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    new_raw = client.cookies.get("meetra_refresh")
    assert new_raw
    assert new_raw != old_raw

    db_session.refresh(old_token)
    assert old_token.revoked_at is not None
    assert old_token.replaced_by is not None
    new_token = db_session.get(RefreshToken, old_token.replaced_by)
    assert new_token is not None
    assert new_token.family_id == family_id


def test_refresh_replay_revokes_family(client: TestClient, db_session):
    register(client, "reg4@example.com")
    login(client, "reg4@example.com")

    old_raw = client.cookies.get("meetra_refresh")
    assert old_raw

    refresh_resp = client.post("/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    new_raw = client.cookies.get("meetra_refresh")
    assert new_raw

    # Replay old token
    replay_resp = client.post("/v1/auth/refresh", json={"refresh_token": old_raw})
    assert replay_resp.status_code == 401

    old_hash = hash_refresh_token(old_raw)
    old_token = db_session.scalar(select(RefreshToken).where(RefreshToken.token_hash == old_hash))
    assert old_token is not None
    family_id = old_token.family_id
    assert family_id is not None

    family_tokens = db_session.scalars(
        select(RefreshToken).where(RefreshToken.family_id == family_id)
    ).all()
    assert family_tokens
    assert all(t.revoked_at is not None for t in family_tokens)


def test_rbac_attendee_blocked_from_organizer_route(client: TestClient):
    register(client, "attendee@example.com")
    resp = login(client, "attendee@example.com")
    token = resp.json()["access_token"]

    ev = client.post(
        "/v1/events",
        json={"name": "Attendee Event"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ev.status_code == 403


def test_rbac_organizer_blocked_from_admin_route(client: TestClient, db_session):
    register(client, "org@example.com")
    db_session.execute(
        update(User)
        .where(User.email == "org@example.com")
        .values(role=UserRole.ORGANIZER)
    )
    db_session.commit()

    resp = login(client, "org@example.com")
    token = resp.json()["access_token"]

    admin_list = client.get(
        "/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert admin_list.status_code == 403


def test_rbac_admin_allowed_everywhere(client: TestClient, db_session):
    register(client, "admin@example.com")
    db_session.execute(
        update(User)
        .where(User.email == "admin@example.com")
        .values(role=UserRole.ADMIN)
    )
    db_session.commit()

    resp = login(client, "admin@example.com")
    token = resp.json()["access_token"]

    admin_list = client.get(
        "/v1/admin/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert admin_list.status_code == 200

    ev = client.post(
        "/v1/events",
        json={"name": "Admin Event"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ev.status_code == 200
