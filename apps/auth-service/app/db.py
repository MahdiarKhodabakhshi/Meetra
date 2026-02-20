from collections.abc import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url, echo=(settings.env == "local"))


@event.listens_for(engine, "connect")
def set_search_path(dbapi_connection, connection_record):
    """Set the search_path to auth schema on every connection."""
    cursor = dbapi_connection.cursor()
    cursor.execute(f"SET search_path TO {settings.db_schema}, public")
    cursor.close()


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_schema_exists() -> None:
    """Create the auth schema if it doesn't exist."""
    with engine.connect() as conn:
        conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {settings.db_schema}"))
        conn.commit()
