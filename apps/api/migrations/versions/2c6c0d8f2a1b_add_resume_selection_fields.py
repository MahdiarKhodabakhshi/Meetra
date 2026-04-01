"""Add resume selection fields.

Revision ID: 2c6c0d8f2a1b
Revises: c2a7e1b4d9aa
Create Date: 2026-04-08
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "2c6c0d8f2a1b"
down_revision = "c2a7e1b4d9aa"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "resume_versions",
        sa.Column(
            "is_selected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "resume_versions",
        sa.Column("selected_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("resume_versions", "selected_at")
    op.drop_column("resume_versions", "is_selected")

