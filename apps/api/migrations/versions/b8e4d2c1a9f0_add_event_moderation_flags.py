"""add event moderation flags

Revision ID: b8e4d2c1a9f0
Revises: a1b2c3d4e5f6
Create Date: 2026-03-29 12:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b8e4d2c1a9f0"
down_revision: str | Sequence[str] | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "events",
        sa.Column(
            "is_hidden",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "events",
        sa.Column(
            "is_featured",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column("events", sa.Column("moderation_note", sa.Text(), nullable=True))
    op.create_index(
        "ix_events_catalog_list",
        "events",
        ["status", "is_hidden", "is_featured", "starts_at"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_events_catalog_list", table_name="events")
    op.drop_column("events", "moderation_note")
    op.drop_column("events", "is_featured")
    op.drop_column("events", "is_hidden")
