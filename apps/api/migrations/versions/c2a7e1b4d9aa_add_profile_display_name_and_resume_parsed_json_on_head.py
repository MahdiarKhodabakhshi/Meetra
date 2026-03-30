"""add profile display_name and resume parsed json (head-safe)

Revision ID: c2a7e1b4d9aa
Revises: b8e4d2c1a9f0
Create Date: 2026-03-30 00:00:00.000000

"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "c2a7e1b4d9aa"
down_revision: str | Sequence[str] | None = "b8e4d2c1a9f0"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Use IF NOT EXISTS to tolerate databases that already applied f3c9b7a1d2e0.
    op.execute(
        sa.text(
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(200)"
        )
    )

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

    op.execute(
        sa.text(
            "ALTER TABLE resume_versions ADD COLUMN IF NOT EXISTS parsed_profile_json JSONB"
        )
    )


def downgrade() -> None:
    op.execute(sa.text("ALTER TABLE resume_versions DROP COLUMN IF EXISTS parsed_profile_json"))
    op.execute(sa.text("ALTER TABLE profiles DROP COLUMN IF EXISTS display_name"))

