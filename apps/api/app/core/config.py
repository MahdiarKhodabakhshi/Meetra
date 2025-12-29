import os
from dataclasses import dataclass, field

from dotenv import load_dotenv

load_dotenv()


def _bool(val: str | None, default: bool = False) -> bool:
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "y", "on"}


def _csv(val: str | None, default: list[str]) -> list[str]:
    if not val:
        return default
    return [v.strip() for v in val.split(",") if v.strip()]


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("ENV", "local")

    # A4: dev auth + dev-route gating
    auth_mode: str = os.getenv("AUTH_MODE", "dev")
    dev_auth_prefix: str = os.getenv("DEV_AUTH_PREFIX", "dev_")
    dev_routes_enabled: bool = _bool(
        os.getenv("DEV_ROUTES_ENABLED"),
        default=(os.getenv("ENV", "local") == "local"),
    )
    dev_api_key: str | None = os.getenv("DEV_API_KEY") or None

    # DB / Redis
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://meetra:meetra@localhost:5432/meetra",
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Celery
    celery_broker_url: str = os.getenv(
        "CELERY_BROKER_URL",
        os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    )
    celery_result_backend: str = os.getenv(
        "CELERY_RESULT_BACKEND",
        "redis://localhost:6379/1",
    )

    # A7: CORS
    cors_allow_origins: list[str] = field(
        default_factory=lambda: _csv(
            os.getenv("CORS_ALLOW_ORIGINS"),
            default=["http://localhost:3000", "http://127.0.0.1:3000"],
        )
    )

    # A7: security headers
    security_headers_enabled: bool = _bool(
        os.getenv("SECURITY_HEADERS_ENABLED"),
        default=True,
    )

    # A7: rate limiting
    rate_limit_enabled: bool = _bool(os.getenv("RATE_LIMIT_ENABLED"), default=True)
    rate_limit_default: str = os.getenv("RATE_LIMIT_DEFAULT", "60/minute")
    rate_limit_exempt_paths: list[str] = field(
        default_factory=lambda: _csv(
            os.getenv("RATE_LIMIT_EXEMPT_PATHS"),
            default=["/health", "/metrics"],
        )
    )


settings = Settings()
