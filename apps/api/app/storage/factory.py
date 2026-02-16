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
    raise ValueError(f"unsupported storage backend: {selected_backend}")


@lru_cache(maxsize=1)
def get_storage() -> StorageAdapter:
    return create_storage()
