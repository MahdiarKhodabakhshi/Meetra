from __future__ import annotations

from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageAdapter(ABC):
    @abstractmethod
    def put_file(self, key: str, fileobj: BinaryIO) -> str:
        """Store content from file-like object under key and return a URI."""

    @abstractmethod
    def open(self, key: str) -> BinaryIO:
        """Open key for reading in binary mode."""

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete key if it exists."""

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Return whether key exists."""

    @abstractmethod
    def resolve_uri(self, key: str) -> str:
        """Return canonical storage URI for a key."""
