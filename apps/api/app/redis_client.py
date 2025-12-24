from __future__ import annotations

from redis import Redis
from redis.connection import ConnectionPool

from app.core.config import settings

_pool: ConnectionPool | None = None


def get_redis() -> Redis:
    global _pool
    if _pool is None:
        _pool = ConnectionPool.from_url(settings.redis_url, decode_responses=True)
    return Redis(connection_pool=_pool)
