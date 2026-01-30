from __future__ import annotations

from argon2 import PasswordHasher
from argon2.exceptions import HashingError, VerificationError, VerifyMismatchError

_hasher = PasswordHasher()


def hash_password(plain: str) -> str:
    if not plain:
        raise ValueError("password is required")
    try:
        return _hasher.hash(plain)
    except HashingError as exc:
        raise ValueError("failed to hash password") from exc


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return _hasher.verify(hashed, plain)
    except (VerifyMismatchError, VerificationError):
        return False
