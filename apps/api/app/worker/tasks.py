import uuid
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import IngestionJob
from app.worker.celery_app import celery_app

logger = get_task_logger(__name__)


@celery_app.task(name="ingest_resume_text")
def ingest_resume_text(user_id: str | None, raw_text: str) -> dict:
    # Create DB row
    db: Session = SessionLocal()
    try:
        job = IngestionJob(
            user_id=uuid.UUID(user_id) if user_id else None,
            kind="resume_text",
            status="processing",
            input_text=raw_text,
        )
        db.add(job)
        db.commit()
        db.refresh(job)

        logger.info("ingest_resume_text started job_id=%s user_id=%s", job.id, user_id)

        # Placeholder work (no PDF parsing yet)
        # Later: parse, embed, match, etc.

        job.status = "completed"
        db.commit()

        logger.info("ingest_resume_text completed job_id=%s", job.id)
        return {"job_id": str(job.id), "status": job.status}
    except Exception as e:
        db.rollback()
        # Best-effort failure record (if job exists)
        try:
            if "job" in locals():
                job.status = "failed"
                job.error = str(e)
                db.commit()
        except Exception:
            pass
        raise
    finally:
        db.close()
