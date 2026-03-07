"""drop users email unique constraint

Revision ID: 9c1a7a0c2b1d
Revises: 7b2e9c4a1f8d
Create Date: 2026-02-10 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9c1a7a0c2b1d"
down_revision: str | Sequence[str] | None = "7b2e9c4a1f8d"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint("users_email_key", "users", type_="unique")


def downgrade() -> None:
    """Downgrade schema."""
    op.create_unique_constraint("users_email_key", "users", ["email"])
