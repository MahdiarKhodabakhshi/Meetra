"""initial auth schema

Revision ID: 0001
Revises: 
Create Date: 2026-03-18 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create enums in auth schema (idempotent)
    bind = op.get_bind()
    
    # Check if user_role exists in auth schema
    result = bind.execute(sa.text(
        "SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid "
        "WHERE t.typname = 'user_role' AND n.nspname = 'auth'"
    ))
    if not result.fetchone():
        op.execute("CREATE TYPE auth.user_role AS ENUM ('ATTENDEE', 'ORGANIZER', 'ADMIN')")
    
    # Check if user_status exists in auth schema
    result = bind.execute(sa.text(
        "SELECT 1 FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid "
        "WHERE t.typname = 'user_status' AND n.nspname = 'auth'"
    ))
    if not result.fetchone():
        op.execute("CREATE TYPE auth.user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED')")

    # Create users table using raw SQL to avoid enum auto-creation issues
    bind.execute(sa.text("""
        CREATE TABLE auth.users (
            id UUID PRIMARY KEY,
            email VARCHAR(320) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role auth.user_role NOT NULL DEFAULT 'ATTENDEE',
            status auth.user_status NOT NULL DEFAULT 'ACTIVE',
            last_login_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        )
    """))
    bind.execute(sa.text("CREATE UNIQUE INDEX ix_auth_users_email_lower ON auth.users(lower(email))"))

    # Create refresh_tokens table
    bind.execute(sa.text("""
        CREATE TABLE auth.refresh_tokens (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            token_hash VARCHAR(128) NOT NULL,
            issued_at TIMESTAMP WITH TIME ZONE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            revoked_at TIMESTAMP WITH TIME ZONE,
            replaced_by UUID REFERENCES auth.refresh_tokens(id) ON DELETE SET NULL,
            family_id UUID
        )
    """))
    bind.execute(sa.text("CREATE INDEX ix_auth_refresh_tokens_user_id ON auth.refresh_tokens(user_id)"))
    bind.execute(sa.text("CREATE UNIQUE INDEX ix_auth_refresh_tokens_token_hash ON auth.refresh_tokens(token_hash)"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_auth_refresh_tokens_token_hash", table_name="refresh_tokens", schema="auth")
    op.drop_index("ix_auth_refresh_tokens_user_id", table_name="refresh_tokens", schema="auth")
    op.drop_table("refresh_tokens", schema="auth")

    op.drop_index("ix_auth_users_email_lower", table_name="users", schema="auth")
    op.drop_table("users", schema="auth")

    op.execute("DROP TYPE IF EXISTS auth.user_status")
    op.execute("DROP TYPE IF EXISTS auth.user_role")
