"""add profile display_name and resume parsed json

Revision ID: f3c9b7a1d2e0
Revises: d4f1a1b9e3c0
Create Date: 2026-03-29 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f3c9b7a1d2e0"
down_revision: str | Sequence[str] | None = "d4f1a1b9e3c0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("profiles", sa.Column("display_name", sa.String(length=200), nullable=True))

    # Backfill from legacy users.name when present.
    bind = op.get_bind()
    bind.execute(
        sa.text(
            """
            UPDATE profiles p
            SET display_name = u.name
            FROM users u
            WHERE p.user_id = u.id
              AND p.display_name IS NULL
              AND u.name IS NOT NULL
              AND btrim(u.name) <> '';
            """
        )
    )
    bind.commit()

    op.add_column("resume_versions", sa.Column("parsed_profile_json", postgresql.JSONB(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("resume_versions", "parsed_profile_json")
    op.drop_column("profiles", "display_name")

