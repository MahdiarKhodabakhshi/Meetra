from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from app.core.config import settings
from app.storage.base import StorageAdapter
from app.storage.local import LocalStorageAdapter


def create_storage(
    backend: str | None = None,
    root: str | Path | None = None,
) -> StorageAdapter:
    selected_backend = (backend or settings.storage_backend).strip().lower()
    if selected_backend == "local":
        storage_root = Path(root or settings.storage_root)
        return LocalStorageAdapter(storage_root)
    if selected_backend in {"gcs", "gs"}:
        # Lazy import so local dev doesn't require google-cloud-storage installed.
        from app.storage.gcs import GCSStorageAdapter

        return GCSStorageAdapter(
            bucket=settings.gcs_bucket,
            prefix=settings.gcs_prefix,
        )
    raise ValueError(f"unsupported storage backend: {selected_backend}")


@lru_cache(maxsize=1)
def get_storage() -> StorageAdapter:
    return create_storage()
