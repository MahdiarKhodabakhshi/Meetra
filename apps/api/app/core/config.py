import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    env: str = os.getenv("ENV", "local")

    database_url: str = os.getenv(
        "DATABASE_URL", "postgresql+psycopg://meetra:meetra@localhost:5432/meetra"
    )
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    celery_broker_url: str = os.getenv(
        "CELERY_BROKER_URL", os.getenv("REDIS_URL", "redis://localhost:6379/0")
    )
    celery_result_backend: str = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/1")


settings = Settings()
