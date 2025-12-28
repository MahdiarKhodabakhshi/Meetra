import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


def _bool(val: str | None, default: bool = False) -> bool:
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "y", "on"}


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("ENV", "local")

    # A4: dev auth + dev-route gating
    auth_mode: str = os.getenv("AUTH_MODE", "dev")
    dev_auth_prefix: str = os.getenv("DEV_AUTH_PREFIX", "dev_")
    dev_routes_enabled: bool = _bool(os.getenv("DEV_ROUTES_ENABLED"), default=True)
    dev_api_key: str | None = os.getenv("DEV_API_KEY") or None

    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://meetra:meetra@localhost:5432/meetra",
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    celery_broker_url: str = os.getenv(
        "CELERY_BROKER_URL",
        os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    )
    celery_result_backend: str = os.getenv(
        "CELERY_RESULT_BACKEND",
        "redis://localhost:6379/1",
    )


settings = Settings()
