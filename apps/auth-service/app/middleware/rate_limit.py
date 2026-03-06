from __future__ import annotations

import time
from dataclasses import dataclass

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.core.config import settings


def _parse_rate(rate: str) -> tuple[int, int]:
    raw = rate.strip().lower()
    if "/" not in raw:
        raise ValueError(f"invalid rate format: {rate}")

    limit_str, window_str = raw.split("/", 1)
    limit = int(limit_str)

    window_str = window_str.strip()
    if window_str in {"sec", "second", "seconds"}:
        return limit, 1
    if window_str in {"min", "minute", "minutes"}:
        return limit, 60
    if window_str in {"hour", "hours"}:
        return limit, 3600
    if window_str in {"day", "days"}:
        return limit, 86400
    raise ValueError(f"invalid rate window: {window_str}")


@dataclass(slots=True)
class _Bucket:
    window_seconds: int
    bucket: int
    count: int


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Best-effort in-memory rate limiting.

    This protects a single process. For multi-instance deployments, replace with Redis/shared
    limiter so limits apply across replicas.
    """

    def __init__(self, app) -> None:
        super().__init__(app)
        self._counters: dict[str, _Bucket] = {}

    async def dispatch(self, request: Request, call_next) -> Response:
        if not settings.rate_limit_enabled:
            return await call_next(request)
        if request.method == "OPTIONS":
            return await call_next(request)

        path = request.url.path
        if path in set(settings.rate_limit_exempt_paths):
            return await call_next(request)

        # Apply stricter limits for login/register endpoints.
        if path.endswith("/v1/auth/login") or path.endswith("/auth/login"):
            rate = settings.rate_limit_login
        elif path.endswith("/v1/auth/register") or path.endswith("/auth/register"):
            rate = settings.rate_limit_register
        elif path.endswith("/v1/auth/refresh") or path.endswith("/auth/refresh"):
            rate = settings.rate_limit_refresh
        else:
            rate = settings.rate_limit_default

        try:
            limit, window_seconds = _parse_rate(rate)
        except ValueError:
            return await call_next(request)

        now = int(time.time())
        bucket = now // window_seconds

        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.method}:{path}:{window_seconds}"

        entry = self._counters.get(key)
        if entry is None or entry.bucket != bucket:
            entry = _Bucket(window_seconds=window_seconds, bucket=bucket, count=0)
            self._counters[key] = entry

        entry.count += 1
        remaining = max(0, limit - entry.count)
        reset = (bucket + 1) * window_seconds

        if entry.count > limit:
            headers = {
                "X-RateLimit-Limit": str(limit),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset),
                "Retry-After": str(max(0, reset - now)),
            }
            return JSONResponse(
                status_code=429,
                content={"detail": "rate limit exceeded"},
                headers=headers,
            )

        response = await call_next(request)
        response.headers.setdefault("X-RateLimit-Limit", str(limit))
        response.headers.setdefault("X-RateLimit-Remaining", str(remaining))
        response.headers.setdefault("X-RateLimit-Reset", str(reset))
        return response

