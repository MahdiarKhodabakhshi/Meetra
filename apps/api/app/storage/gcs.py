from __future__ import annotations

import io
from dataclasses import dataclass
from typing import BinaryIO

from app.storage.base import StorageAdapter


@dataclass(frozen=True, slots=True)
class GCSStorageAdapter(StorageAdapter):
    bucket: str
    prefix: str = ""

    def __post_init__(self) -> None:
        b = (self.bucket or "").strip()
        if not b:
            raise ValueError("GCS bucket is required")
        p = (self.prefix or "").strip().strip("/")
        object.__setattr__(self, "bucket", b)
        object.__setattr__(self, "prefix", p)

    def _client(self):
        # Import lazily so local dev doesn't require google-cloud-storage.
        from google.cloud import storage  # type: ignore

        return storage.Client()

    def _object_name(self, key: str) -> str:
        k = (key or "").strip().lstrip("/")
        if not k:
            raise ValueError("invalid storage key")
        return f"{self.prefix}/{k}" if self.prefix else k

    def put_file(self, key: str, fileobj: BinaryIO) -> str:
        client = self._client()
        bucket = client.bucket(self.bucket)
        object_name = self._object_name(key)
        blob = bucket.blob(object_name)
        blob.upload_from_file(fileobj, rewind=True)
        return self.resolve_uri(key)

    def open(self, key: str) -> BinaryIO:
        client = self._client()
        bucket = client.bucket(self.bucket)
        object_name = self._object_name(key)
        blob = bucket.blob(object_name)
        data = blob.download_as_bytes()
        return io.BytesIO(data)

    def delete(self, key: str) -> None:
        client = self._client()
        bucket = client.bucket(self.bucket)
        object_name = self._object_name(key)
        blob = bucket.blob(object_name)
        blob.delete(if_generation_match=0) if blob.exists() else None

    def exists(self, key: str) -> bool:
        client = self._client()
        bucket = client.bucket(self.bucket)
        object_name = self._object_name(key)
        return bucket.blob(object_name).exists()

    def resolve_uri(self, key: str) -> str:
        object_name = self._object_name(key)
        return f"gs://{self.bucket}/{object_name}"

