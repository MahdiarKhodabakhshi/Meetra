from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config


def upgrade_head(*, database_url: str) -> None:
    """Run `alembic upgrade head` for the API service."""

    api_root = Path(__file__).resolve().parents[2]  # .../apps/api (contains alembic.ini)
    alembic_ini = api_root / "alembic.ini"

    cfg = Config(str(alembic_ini))
    cfg.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(cfg, "head")

