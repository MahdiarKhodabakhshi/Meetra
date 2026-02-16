from __future__ import annotations

from pathlib import Path, PurePosixPath
from typing import BinaryIO

from app.storage.base import StorageAdapter


class LocalStorageAdapter(StorageAdapter):
    def __init__(self, root: Path) -> None:
        self._root = root.resolve()
        self._root.mkdir(parents=True, exist_ok=True)

    def _normalize_key(self, key: str) -> str:
        normalized = key.strip().lstrip("/")
        path_key = PurePosixPath(normalized)
        if not normalized or path_key.is_absolute() or ".." in path_key.parts:
            raise ValueError(f"invalid storage key: {key!r}")
        return str(path_key)

    def _path_for_key(self, key: str) -> Path:
        normalized = self._normalize_key(key)
        return self._root.joinpath(*PurePosixPath(normalized).parts)

    def put_file(self, key: str, fileobj: BinaryIO) -> str:
        path = self._path_for_key(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as out:
            while True:
                chunk = fileobj.read(1024 * 1024)
                if not chunk:
                    break
                out.write(chunk)
        return self.resolve_uri(key)

    def open(self, key: str) -> BinaryIO:
        return self._path_for_key(key).open("rb")

    def delete(self, key: str) -> None:
        path = self._path_for_key(key)
        if path.exists():
            path.unlink()

    def exists(self, key: str) -> bool:
        return self._path_for_key(key).exists()

    def resolve_uri(self, key: str) -> str:
        normalized = self._normalize_key(key)
        return f"local://{normalized}"
