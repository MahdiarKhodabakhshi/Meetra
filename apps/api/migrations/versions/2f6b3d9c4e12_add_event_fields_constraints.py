"""add event fields, constraints, and attendee status

Revision ID: 2f6b3d9c4e12
Revises: 9c1a7a0c2b1d
Create Date: 2026-02-10 00:00:00.000000

"""

from collections.abc import Sequence
import uuid

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "2f6b3d9c4e12"
down_revision: str | Sequence[str] | None = "9c1a7a0c2b1d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    event_status_enum = sa.Enum("DRAFT", "PUBLISHED", "CANCELLED", name="event_status")
    attendee_status_enum = sa.Enum("RSVPED", "CANCELLED", name="event_attendee_status")
    bind = op.get_bind()
    event_status_enum.create(bind, checkfirst=True)
    attendee_status_enum.create(bind, checkfirst=True)

    op.alter_column(
        "events",
        "name",
        new_column_name="title",
        existing_type=sa.String(length=200),
    )
    op.add_column("events", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("events", sa.Column("rsvp_deadline", sa.DateTime(timezone=True), nullable=True))
    op.add_column("events", sa.Column("capacity", sa.Integer(), nullable=True))
    op.add_column(
        "events",
        sa.Column("status", event_status_enum, nullable=False, server_default="DRAFT"),
    )
    op.add_column("events", sa.Column("organizer_id", sa.UUID(), nullable=True))
    op.add_column("events", sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True))

    # Backfill organizer_id from host attendee if present
    bind.execute(
        sa.text(
            """
            WITH hosts AS (
                SELECT DISTINCT ON (event_id) event_id, user_id
                FROM event_attendees
                WHERE role = 'host'
                ORDER BY event_id, created_at ASC
            )
            UPDATE events e
            SET organizer_id = h.user_id
            FROM hosts h
            WHERE e.id = h.event_id AND e.organizer_id IS NULL
            """
        )
    )
    # Fallback to any attendee if no host exists
    bind.execute(
        sa.text(
            """
            WITH attendees AS (
                SELECT DISTINCT ON (event_id) event_id, user_id
                FROM event_attendees
                ORDER BY event_id, created_at ASC
            )
            UPDATE events e
            SET organizer_id = a.user_id
            FROM attendees a
            WHERE e.id = a.event_id AND e.organizer_id IS NULL
            """
        )
    )

    missing = bind.execute(
        sa.text("SELECT COUNT(*) FROM events WHERE organizer_id IS NULL")
    ).scalar()
    if missing:
        fallback = bind.execute(
            sa.text("SELECT id FROM users ORDER BY created_at ASC LIMIT 1")
        ).fetchone()
        if fallback:
            fallback_id = fallback[0]
        else:
            fallback_id = str(uuid.uuid4())
            bind.execute(
                sa.text(
                    "INSERT INTO users (id, name, role) VALUES (:id, :name, :role)"
                ),
                {
                    "id": fallback_id,
                    "name": "Legacy Organizer",
                    "role": "ORGANIZER",
                },
            )
        bind.execute(
            sa.text("UPDATE events SET organizer_id = :id WHERE organizer_id IS NULL"),
            {"id": fallback_id},
        )

    op.create_foreign_key(
        "fk_events_organizer_id_users",
        "events",
        "users",
        ["organizer_id"],
        ["id"],
    )
    op.alter_column("events", "organizer_id", nullable=False)

    op.create_check_constraint(
        "ck_events_ends_after_starts",
        "events",
        "ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at",
    )
    op.create_check_constraint(
        "ck_events_capacity_min",
        "events",
        "capacity IS NULL OR capacity >= 1",
    )
    op.create_check_constraint(
        "ck_events_rsvp_deadline_before_start",
        "events",
        "rsvp_deadline IS NULL OR starts_at IS NULL OR rsvp_deadline <= starts_at",
    )

    op.create_index("ix_events_status_starts_at", "events", ["status", "starts_at"])
    op.create_index(
        "ix_events_organizer_starts_at",
        "events",
        ["organizer_id", "starts_at"],
    )

    op.add_column(
        "event_attendees",
        sa.Column("status", attendee_status_enum, nullable=False, server_default="RSVPED"),
    )
    op.add_column(
        "event_attendees",
        sa.Column("cancelled_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_event_attendees_event_id", "event_attendees", ["event_id"])
    op.create_index("ix_event_attendees_user_id", "event_attendees", ["user_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_event_attendees_user_id", table_name="event_attendees")
    op.drop_index("ix_event_attendees_event_id", table_name="event_attendees")
    op.drop_column("event_attendees", "cancelled_at")
    op.drop_column("event_attendees", "status")

    op.drop_index("ix_events_organizer_starts_at", table_name="events")
    op.drop_index("ix_events_status_starts_at", table_name="events")

    op.drop_constraint("ck_events_rsvp_deadline_before_start", "events", type_="check")
    op.drop_constraint("ck_events_capacity_min", "events", type_="check")
    op.drop_constraint("ck_events_ends_after_starts", "events", type_="check")

    op.drop_constraint("fk_events_organizer_id_users", "events", type_="foreignkey")
    op.drop_column("events", "cancelled_at")
    op.drop_column("events", "organizer_id")
    op.drop_column("events", "status")
    op.drop_column("events", "capacity")
    op.drop_column("events", "rsvp_deadline")
    op.drop_column("events", "description")
    op.alter_column(
        "events",
        "title",
        new_column_name="name",
        existing_type=sa.String(length=200),
    )

    bind = op.get_bind()
    attendee_status_enum = sa.Enum("RSVPED", "CANCELLED", name="event_attendee_status")
    event_status_enum = sa.Enum("DRAFT", "PUBLISHED", "CANCELLED", name="event_status")
    attendee_status_enum.drop(bind, checkfirst=True)
    event_status_enum.drop(bind, checkfirst=True)
