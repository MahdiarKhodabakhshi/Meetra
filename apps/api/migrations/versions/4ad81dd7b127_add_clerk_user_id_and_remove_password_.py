"""add clerk_user_id and remove password_hash

Revision ID: 4ad81dd7b127
Revises: c2a7e1b4d9aa
Create Date: 2026-04-01 17:40:01.823625

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4ad81dd7b127'
down_revision: Union[str, Sequence[str], None] = 'c2a7e1b4d9aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('clerk_user_id', sa.String(length=255), nullable=True))
    op.create_index(op.f('ix_users_clerk_user_id'), 'users', ['clerk_user_id'], unique=True)
    op.drop_column('users', 'password_hash')


def downgrade() -> None:
    op.add_column('users', sa.Column('password_hash', sa.VARCHAR(length=255), autoincrement=False, nullable=True))
    op.drop_index(op.f('ix_users_clerk_user_id'), table_name='users')
    op.drop_column('users', 'clerk_user_id')
