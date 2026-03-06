import os
from dataclasses import dataclass, field
from pathlib import Path

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


def _load_key_file(path: str | None) -> str | None:
    if not path:
        return None
    p = Path(path)
    if p.exists():
        return p.read_text().strip()
    return None


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("ENV", "local")
    service_name: str = "auth-service"

    # Database (auth schema)
    database_url: str = os.getenv(
        "AUTH_DATABASE_URL",
        os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://meetra:meetra@localhost:5432/meetra",
        ),
    )
    db_schema: str = os.getenv("AUTH_DB_SCHEMA", "auth")
    # Off by default; set SQLALCHEMY_ECHO=1 only when debugging SQL.
    sqlalchemy_echo: bool = _bool(os.getenv("SQLALCHEMY_ECHO"), default=False)

    # RS256 JWT signing
    jwt_private_key_path: str = os.getenv("JWT_PRIVATE_KEY_PATH", "")
    jwt_public_key_path: str = os.getenv("JWT_PUBLIC_KEY_PATH", "")
    jwt_private_key: str = field(default="")
    jwt_public_key: str = field(default="")
    jwt_algorithm: str = "RS256"
    jwt_issuer: str = os.getenv("JWT_ISSUER", "meetra-auth")
    jwt_audience: str = os.getenv("JWT_AUDIENCE", "meetra")

    # Token TTLs
    access_token_ttl_seconds: int = int(os.getenv("ACCESS_TOKEN_TTL_SECONDS", "900"))
    refresh_token_ttl_days: int = int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "30"))
    refresh_token_pepper: str = os.getenv("REFRESH_TOKEN_PEPPER", "dev_pepper")

    # Refresh cookie
    refresh_cookie_name: str = os.getenv("REFRESH_COOKIE_NAME", "meetra_refresh")
    refresh_cookie_samesite: str = os.getenv("REFRESH_COOKIE_SAMESITE", "lax")
    refresh_cookie_secure: bool = _bool(
        os.getenv("REFRESH_COOKIE_SECURE"),
        default=(os.getenv("ENV", "local") != "local"),
    )

    # CORS
    cors_allow_origins: list[str] = field(
        default_factory=lambda: _csv(
            os.getenv("CORS_ALLOW_ORIGINS"),
            default=["http://localhost:3000", "http://127.0.0.1:3000"],
        )
    )

    # Security headers (baseline hardening)
    security_headers_enabled: bool = _bool(os.getenv("SECURITY_HEADERS_ENABLED"), default=True)

    # Rate limiting
    rate_limit_enabled: bool = _bool(os.getenv("RATE_LIMIT_ENABLED"), default=True)
    rate_limit_login: str = os.getenv("RATE_LIMIT_LOGIN", "10/minute")
    rate_limit_register: str = os.getenv("RATE_LIMIT_REGISTER", "5/minute")
    rate_limit_refresh: str = os.getenv("RATE_LIMIT_REFRESH", "30/minute")
    rate_limit_default: str = os.getenv("RATE_LIMIT_DEFAULT", "60/minute")

    rate_limit_exempt_paths: list[str] = field(
        default_factory=lambda: _csv(
            os.getenv("RATE_LIMIT_EXEMPT_PATHS"),
            default=["/health", "/metrics", "/docs", "/openapi.json"],
        )
    )

    def __post_init__(self) -> None:
        # Load keys from files if paths provided
        private_key = _load_key_file(self.jwt_private_key_path) or os.getenv(
            "JWT_PRIVATE_KEY", ""
        )
        public_key = _load_key_file(self.jwt_public_key_path) or os.getenv(
            "JWT_PUBLIC_KEY", ""
        )
        # Use object.__setattr__ because dataclass is frozen
        object.__setattr__(self, "jwt_private_key", private_key)
        object.__setattr__(self, "jwt_public_key", public_key)


settings = Settings()
