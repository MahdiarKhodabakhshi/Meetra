from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
import threading
import uuid

from fastapi.testclient import TestClient
from sqlalchemy import func, select, update

from app.main import app
from app.models import EventAttendee, User
from app.models.event_attendee import EventAttendeeStatus
from app.models.user import UserRole
from tests.test_auth_rbac import login, register


def _auth_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def _make_organizer(client: TestClient, db_session, email: str) -> str:
    register(client, email)
    db_session.execute(
        update(User).where(User.email == email).values(role=UserRole.ORGANIZER)
    )
    db_session.commit()
    resp = login(client, email)
    return resp.json()["access_token"]


def _make_attendee(client: TestClient, email: str) -> str:
    register(client, email)
    resp = login(client, email)
    return resp.json()["access_token"]


def _create_event(client: TestClient, token: str, **overrides):
    payload = {
        "title": "Test Event",
        "starts_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
    }
    payload.update(overrides)
    return client.post("/v1/events", json=payload, headers=_auth_headers(token))


def test_organizer_can_create_update_publish_cancel(client: TestClient, db_session):
    token = _make_organizer(client, db_session, "org1@example.com")

    create_resp = _create_event(client, token)
    assert create_resp.status_code == 200
    event_id = create_resp.json()["event_id"]

    patch_resp = client.patch(
        f"/v1/events/{event_id}",
        json={"title": "Updated Title"},
        headers=_auth_headers(token),
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "Updated Title"

    publish_resp = client.post(
        f"/v1/events/{event_id}/publish",
        headers=_auth_headers(token),
    )
    assert publish_resp.status_code == 200
    assert publish_resp.json()["status"] == "PUBLISHED"

    cancel_resp = client.post(
        f"/v1/events/{event_id}/cancel",
        headers=_auth_headers(token),
    )
    assert cancel_resp.status_code == 200
    body = cancel_resp.json()
    assert body["status"] == "CANCELLED"
    assert body["cancelled_at"] is not None


def test_attendee_cannot_create_or_update(client: TestClient, db_session):
    attendee_token = _make_attendee(client, "attendee1@example.com")

    create_resp = client.post(
        "/v1/events",
        json={"title": "Nope"},
        headers=_auth_headers(attendee_token),
    )
    assert create_resp.status_code == 403

    organizer_token = _make_organizer(client, db_session, "org2@example.com")
    event_id = _create_event(client, organizer_token).json()["event_id"]

    update_resp = client.patch(
        f"/v1/events/{event_id}",
        json={"title": "Blocked"},
        headers=_auth_headers(attendee_token),
    )
    assert update_resp.status_code == 403


def test_attendee_browsing_only_sees_published(client: TestClient, db_session):
    organizer_token = _make_organizer(client, db_session, "org3@example.com")
    attendee_token = _make_attendee(client, "attendee2@example.com")

    draft_id = _create_event(client, organizer_token).json()["event_id"]

    published_resp = _create_event(
        client,
        organizer_token,
        title="Published Event",
    )
    pub_id = published_resp.json()["event_id"]
    client.post(f"/v1/events/{pub_id}/publish", headers=_auth_headers(organizer_token))

    list_resp = client.get("/v1/events", headers=_auth_headers(attendee_token))
    assert list_resp.status_code == 200
    data = list_resp.json()
    ids = {item["id"] for item in data["items"]}
    assert pub_id in ids
    assert draft_id not in ids


def test_rsvp_uniqueness_same_user(client: TestClient, db_session):
    organizer_token = _make_organizer(client, db_session, "org4@example.com")
    attendee_token = _make_attendee(client, "attendee3@example.com")

    event_id = _create_event(client, organizer_token).json()["event_id"]
    client.post(f"/v1/events/{event_id}/publish", headers=_auth_headers(organizer_token))

    first = client.post(
        f"/v1/events/{event_id}/rsvp", headers=_auth_headers(attendee_token)
    )
    assert first.status_code == 200
    assert first.json()["status"] == "joined"

    second = client.post(
        f"/v1/events/{event_id}/rsvp", headers=_auth_headers(attendee_token)
    )
    assert second.status_code == 200
    assert second.json()["status"] == "already_joined"

    user = db_session.scalar(select(User).where(User.email == "attendee3@example.com"))
    event_uuid = uuid.UUID(event_id)
    count = db_session.scalar(
        select(func.count())
        .select_from(EventAttendee)
        .where(
            EventAttendee.event_id == event_uuid,
            EventAttendee.user_id == user.id,
            EventAttendee.status == EventAttendeeStatus.RSVPED,
        )
    )
    assert count == 1


def test_rsvp_cutoff_rejected(client: TestClient, db_session):
    organizer_token = _make_organizer(client, db_session, "org5@example.com")
    attendee_token = _make_attendee(client, "attendee4@example.com")

    starts_at = datetime.now(timezone.utc) + timedelta(days=1)
    rsvp_deadline = datetime.now(timezone.utc) - timedelta(minutes=1)
    event_id = _create_event(
        client,
        organizer_token,
        starts_at=starts_at.isoformat(),
        rsvp_deadline=rsvp_deadline.isoformat(),
    ).json()["event_id"]

    client.post(f"/v1/events/{event_id}/publish", headers=_auth_headers(organizer_token))

    resp = client.post(
        f"/v1/events/{event_id}/rsvp", headers=_auth_headers(attendee_token)
    )
    assert resp.status_code == 409
    assert resp.json()["detail"]["code"] == "RSVP_CUTOFF_PASSED"


def test_capacity_concurrent_rsvp_capacity_one(client: TestClient, db_session):
    organizer_token = _make_organizer(client, db_session, "org6@example.com")

    # capacity=2: organizer fills one slot, one slot left for two concurrent RSVPs
    event_id = _create_event(
        client,
        organizer_token,
        capacity=2,
    ).json()["event_id"]
    client.post(f"/v1/events/{event_id}/publish", headers=_auth_headers(organizer_token))

    token_a = _make_attendee(client, "attendee5@example.com")
    token_b = _make_attendee(client, "attendee6@example.com")

    barrier = threading.Barrier(2)

    def _rsvp_call(token: str):
        with TestClient(app) as local_client:
            barrier.wait()
            return local_client.post(
                f"/v1/events/{event_id}/rsvp",
                headers=_auth_headers(token),
            )

    with ThreadPoolExecutor(max_workers=2) as executor:
        futures = [executor.submit(_rsvp_call, token_a), executor.submit(_rsvp_call, token_b)]
        responses = [f.result() for f in futures]

    statuses = [resp.status_code for resp in responses]
    assert statuses.count(200) == 1
    assert statuses.count(409) == 1

    conflict = next(resp for resp in responses if resp.status_code == 409)
    assert conflict.json()["detail"]["code"] == "EVENT_FULL"

    event_uuid = uuid.UUID(event_id)
    count = db_session.scalar(
        select(func.count())
        .select_from(EventAttendee)
        .where(
            EventAttendee.event_id == event_uuid,
            EventAttendee.status == EventAttendeeStatus.RSVPED,
        )
    )
    # Organizer (1) + one successful concurrent RSVP (1) = 2
    assert count == 2
