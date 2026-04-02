from __future__ import annotations

import hashlib
import re
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.v1.schemas.resumes import ResumeStatusOut, ResumeVersionOut
from app.auth.deps import CurrentUser
from app.core.config import settings
from app.db import get_db
from app.models import ResumeVersion
from app.models.resume_version import ResumeVersionStatus
from app.models.user import UserRole
from app.storage.factory import get_storage
from app.worker.celery_app import celery_app

router = APIRouter(prefix="/resumes", tags=["resumes"])

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}
FILENAME_SANITIZE_RE = re.compile(r"[^A-Za-z0-9._-]+")


def _db_session(db: Session = Depends(get_db)) -> Session:
    return db


def _validation_error(code: str, message: str) -> HTTPException:
    return HTTPException(status_code=422, detail={"code": code, "message": message})


def _safe_filename(raw_filename: str | None) -> str:
    fallback = "resume"
    candidate = (raw_filename or fallback).strip()
    candidate = Path(candidate).name
    candidate = FILENAME_SANITIZE_RE.sub("_", candidate)
    candidate = candidate.strip("._") or fallback
    if len(candidate) > 200:
        stem = Path(candidate).stem[:160] or fallback
        suffix = Path(candidate).suffix[:20]
        candidate = f"{stem}{suffix}"
    return candidate


def _storage_key_from_uri(uri: str) -> str:
    """Convert storage URI (local://, gs://) into adapter key."""
    parsed = urlparse(uri)
    if not parsed.scheme:
        return uri.lstrip("/")
    if parsed.scheme in {"gs", "gcs"}:
        # gs://bucket/object -> key is "object"
        return parsed.path.lstrip("/")
    # local://resumes/... -> netloc is first path segment
    key = f"{parsed.netloc}{parsed.path}"
    return key.lstrip("/")


def _progress_stage(status: ResumeVersionStatus) -> str:
    return status.value.lower()


@router.post("", response_model=ResumeVersionOut, status_code=202)
def upload_resume(
    user: CurrentUser,
    file: UploadFile = File(...),
    db: Session = Depends(_db_session),
):
    if file.content_type and file.content_type.lower() not in ALLOWED_MIME_TYPES:
        raise _validation_error("INVALID_MIME_TYPE", "only pdf/docx files are allowed")

    safe_filename = _safe_filename(file.filename)
    file_ext = Path(safe_filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise _validation_error("INVALID_FILE_EXTENSION", "only .pdf and .docx are allowed")

    hasher = hashlib.sha256()
    total_size = 0
    max_size = settings.resume_max_upload_bytes
    buffered = tempfile.SpooledTemporaryFile(max_size=8 * 1024 * 1024, mode="w+b")
    try:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            total_size += len(chunk)
            if total_size > max_size:
                raise _validation_error(
                    "FILE_TOO_LARGE",
                    f"file exceeds max size of {max_size} bytes",
                )
            hasher.update(chunk)
            buffered.write(chunk)
    except Exception:
        buffered.close()
        raise
    finally:
        file.file.close()

    if total_size == 0:
        buffered.close()
        raise _validation_error("EMPTY_FILE", "uploaded file is empty")

    buffered.seek(0)
    sha256 = hasher.hexdigest()

    resume_version_id = uuid.uuid4()
    key = f"resumes/{user.id}/{resume_version_id}/{safe_filename}"
    storage = get_storage()
    file_uri = storage.resolve_uri(key)

    resume_version = ResumeVersion(
        id=resume_version_id,
        user_id=user.id,
        file_uri=file_uri,
        original_filename=safe_filename,
        mime_type=(file.content_type or "").lower() or "application/octet-stream",
        sha256=sha256,
        status=ResumeVersionStatus.UPLOADED,
    )
    db.add(resume_version)
    try:
        db.commit()
        db.refresh(resume_version)
    except IntegrityError as exc:
        db.rollback()
        # If the same resume was uploaded before, allow re-upload only when the
        # backing object is missing (common with old local storage on Cloud Run).
        existing = db.scalar(
            select(ResumeVersion)
            .where(ResumeVersion.user_id == user.id, ResumeVersion.sha256 == sha256)
            .order_by(ResumeVersion.created_at.desc())
            .limit(1)
        )
        if existing:
            storage_key = _storage_key_from_uri(existing.file_uri)
            try:
                if not storage.exists(storage_key):
                    stored_uri = storage.put_file(storage_key, buffered)
                    if stored_uri != existing.file_uri:
                        existing.file_uri = stored_uri
                    existing.status = ResumeVersionStatus.UPLOADED
                    existing.error_code = None
                    existing.error_message = None
                    db.add(existing)
                    db.commit()
                    db.refresh(existing)
                    return existing
            except HTTPException:
                raise
            except Exception:
                # Fall through to the default duplicate error
                pass

        buffered.close()
        raise HTTPException(
            status_code=409,
            detail={"code": "RESUME_DUPLICATE", "message": "duplicate resume for this user"},
        ) from exc

    try:
        stored_uri = storage.put_file(key, buffered)
        if stored_uri != resume_version.file_uri:
            resume_version.file_uri = stored_uri
            db.add(resume_version)
            db.commit()
            db.refresh(resume_version)
    except Exception as exc:
        db.rollback()
        resume_version.status = ResumeVersionStatus.FAILED
        resume_version.error_code = "STORAGE_WRITE_FAILED"
        resume_version.error_message = str(exc)
        db.add(resume_version)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail={"code": "STORAGE_WRITE_FAILED", "message": "failed to store uploaded file"},
        ) from exc
    finally:
        buffered.close()

    return resume_version


@router.get("", response_model=list[ResumeVersionOut])
def list_resumes(
    user: CurrentUser,
    db: Session = Depends(_db_session),
):
    rows = (
        db.execute(
            select(ResumeVersion)
            .where(ResumeVersion.user_id == user.id)
            .order_by(ResumeVersion.created_at.desc())
        )
        .scalars()
        .all()
    )
    return rows


@router.post("/{resume_version_id}/select-and-parse", response_model=ResumeVersionOut, status_code=202)
def select_and_parse_resume(
    user: CurrentUser,
    resume_version_id: uuid.UUID,
    db: Session = Depends(_db_session),
):
    resume_version = db.get(ResumeVersion, resume_version_id)
    if not resume_version:
        raise HTTPException(status_code=404, detail={"code": "RESUME_NOT_FOUND", "message": "not found"})
    if user.role != UserRole.ADMIN and resume_version.user_id != user.id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "forbidden"})

    now = datetime.now(timezone.utc)
    db.execute(
        update(ResumeVersion)
        .where(ResumeVersion.user_id == resume_version.user_id)
        .values(is_selected=False, selected_at=None)
    )
    resume_version.is_selected = True
    resume_version.selected_at = now
    resume_version.status = ResumeVersionStatus.UPLOADED
    resume_version.error_code = None
    resume_version.error_message = None
    resume_version.parsed_at = None
    resume_version.extracted_text_uri = None
    resume_version.parsed_profile_json = None
    resume_version.parse_confidence = None
    db.add(resume_version)
    db.commit()
    db.refresh(resume_version)

    try:
        celery_app.send_task("parse_resume", args=[str(resume_version.id)])
    except Exception as exc:
        resume_version.status = ResumeVersionStatus.FAILED
        resume_version.error_code = "QUEUE_ERROR"
        resume_version.error_message = str(exc)
        db.add(resume_version)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail={"code": "QUEUE_ERROR", "message": "failed to enqueue parse job"},
        ) from exc

    return resume_version


@router.get("/latest", response_model=ResumeVersionOut)
def get_latest_resume(
    user: CurrentUser,
    db: Session = Depends(_db_session),
):
    resume_version = db.scalar(
        select(ResumeVersion)
        .where(ResumeVersion.user_id == user.id)
        .order_by(ResumeVersion.created_at.desc())
        .limit(1)
    )
    if not resume_version:
        raise HTTPException(status_code=404, detail={"code": "RESUME_NOT_FOUND", "message": "not found"})
    return resume_version


@router.get("/{resume_version_id}", response_model=ResumeStatusOut)
def get_resume_status(
    user: CurrentUser,
    resume_version_id: uuid.UUID,
    db: Session = Depends(_db_session),
):
    resume_version = db.get(ResumeVersion, resume_version_id)
    if not resume_version:
        raise HTTPException(status_code=404, detail={"code": "RESUME_NOT_FOUND", "message": "not found"})

    if user.role != UserRole.ADMIN and resume_version.user_id != user.id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "forbidden"})

    return ResumeStatusOut(
        id=resume_version.id,
        status=resume_version.status,
        error_code=resume_version.error_code,
        error_message=resume_version.error_message,
        parsed_at=resume_version.parsed_at,
        progress_stage=_progress_stage(resume_version.status),
    )


@router.post("/{resume_version_id}/reparse", response_model=ResumeVersionOut, status_code=202)
def reparse_resume(
    user: CurrentUser,
    resume_version_id: uuid.UUID,
    db: Session = Depends(_db_session),
):
    resume_version = db.get(ResumeVersion, resume_version_id)
    if not resume_version:
        raise HTTPException(status_code=404, detail={"code": "RESUME_NOT_FOUND", "message": "not found"})
    if user.role != UserRole.ADMIN and resume_version.user_id != user.id:
        raise HTTPException(status_code=403, detail={"code": "FORBIDDEN", "message": "forbidden"})

    # Re-parse keeps selection state as-is, but re-queues parsing.
    resume_version.status = ResumeVersionStatus.UPLOADED
    resume_version.error_code = None
    resume_version.error_message = None
    resume_version.parsed_at = None
    resume_version.extracted_text_uri = None
    resume_version.parsed_profile_json = None
    resume_version.parse_confidence = None
    db.add(resume_version)
    db.commit()
    db.refresh(resume_version)

    try:
        celery_app.send_task("parse_resume", args=[str(resume_version.id)])
    except Exception as exc:
        resume_version.status = ResumeVersionStatus.FAILED
        resume_version.error_code = "QUEUE_ERROR"
        resume_version.error_message = str(exc)
        db.add(resume_version)
        db.commit()
        raise HTTPException(
            status_code=500,
            detail={"code": "QUEUE_ERROR", "message": "failed to enqueue parse job"},
        ) from exc

    return resume_version
