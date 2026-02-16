from __future__ import annotations

from app.storage.base import StorageAdapter
from app.storage.local import LocalStorageAdapter


def create_storage(*args, **kwargs):
    from app.storage.factory import create_storage as _create_storage

    return _create_storage(*args, **kwargs)


def get_storage():
    from app.storage.factory import get_storage as _get_storage

    return _get_storage()


__all__ = ["StorageAdapter", "LocalStorageAdapter", "create_storage", "get_storage"]
