"""add resume versions and profiles

Revision ID: d4f1a1b9e3c0
Revises: 2f6b3d9c4e12
Create Date: 2026-02-18 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "d4f1a1b9e3c0"
down_revision: str | Sequence[str] | None = "2f6b3d9c4e12"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    
    # Check if enum exists before creating
    enum_exists_result = bind.execute(
        sa.text("SELECT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'resume_version_status')")
    ).scalar()
    
    # Create enum only if it doesn't exist
    if not enum_exists_result:
        bind.execute(
            sa.text("CREATE TYPE resume_version_status AS ENUM ('UPLOADED', 'SCANNING', 'PARSING', 'PARSED', 'FAILED')")
        )
        bind.commit()
    
    # Create table - use postgresql.ENUM with create_type=False to prevent SQLAlchemy
    # from trying to create the enum type during table creation
    op.create_table(
        "resume_versions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("file_uri", sa.String(length=1024), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=255), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "UPLOADED",
                "SCANNING",
                "PARSING",
                "PARSED",
                "FAILED",
                name="resume_version_status",
                create_type=False,  # Don't create the type, it already exists
            ),
            nullable=False,
            server_default="UPLOADED",
        ),
        sa.Column("error_code", sa.String(length=64), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("parse_confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("extracted_text_uri", sa.String(length=1024), nullable=True),
        sa.Column("parsed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "parse_confidence IS NULL OR (parse_confidence >= 0 AND parse_confidence <= 1)",
            name="ck_resume_versions_parse_confidence_range",
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "sha256", name="uq_resume_versions_user_sha256"),
    )
    
    op.create_index(
        "ix_resume_versions_user_created_at_desc",
        "resume_versions",
        ["user_id", sa.text("created_at DESC")],
    )

    op.create_table(
        "profiles",
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column(
            "skills",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "titles",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "industries",
            postgresql.ARRAY(sa.String()),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
        sa.Column(
            "education_json",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "experience_json",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column("keywords", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("source_resume_id", sa.UUID(), nullable=True),
        sa.Column(
            "confidence_json",
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["source_resume_id"], ["resume_versions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_index("ix_profiles_source_resume_id", "profiles", ["source_resume_id"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_profiles_source_resume_id", table_name="profiles")
    op.drop_table("profiles")

    op.drop_index("ix_resume_versions_user_created_at_desc", table_name="resume_versions")
    op.drop_table("resume_versions")

    bind = op.get_bind()
    resume_status_enum = sa.Enum(
        "UPLOADED",
        "SCANNING",
        "PARSING",
        "PARSED",
        "FAILED",
        name="resume_version_status",
    )
    resume_status_enum.drop(bind, checkfirst=True)
