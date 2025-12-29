from __future__ import annotations

import time

from fastapi import Request
from redis.exceptions import RedisError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response

from app.core.config import settings
from app.redis_client import get_redis


def _parse_rate(rate: str) -> tuple[int, int]:
    """
    Parse formats like:
      - "60/minute"
      - "120/hour"
      - "10/second"
    Returns: (limit, window_seconds)
    """
    raw = rate.strip().lower()
    if "/" not in raw:
        raise ValueError(f"Invalid rate format: {rate}")

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

    raise ValueError(f"Invalid rate window: {window_str}")


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if not settings.rate_limit_enabled:
            return await call_next(request)

        # Don’t rate-limit CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        # Exempt endpoints
        path = request.url.path
        if path in set(settings.rate_limit_exempt_paths):
            return await call_next(request)

        # Basic identity: IP-based (good enough for A7 baseline)
        client_ip = request.client.host if request.client else "unknown"

        try:
            limit, window_seconds = _parse_rate(settings.rate_limit_default)
        except ValueError:
            # Misconfigured rate => fail open
            return await call_next(request)

        now = int(time.time())
        bucket = now // window_seconds

        # Include method+path to reduce accidental cross-endpoint coupling
        key = f"rl:{client_ip}:{request.method}:{path}:{window_seconds}:{bucket}"

        try:
            r = get_redis()
            count = r.incr(key)

            # Ensure key expires (best effort). Common pattern:
            if count == 1:
                r.expire(key, window_seconds)

            remaining = max(0, limit - int(count))
            reset = (bucket + 1) * window_seconds

            if count > limit:
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

        except RedisError:
            # Fail open if Redis is unavailable (don’t take down the API)
            return await call_next(request)
