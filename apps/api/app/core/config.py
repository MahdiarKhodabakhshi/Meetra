import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()  # reads apps/api/.env when running from apps/api


@dataclass(frozen=True)
class Settings:
    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://meetra:meetra@localhost:5432/meetra"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")


settings = Settings()
