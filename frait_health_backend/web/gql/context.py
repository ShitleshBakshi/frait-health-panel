from fastapi import Depends
from redis.asyncio import ConnectionPool
from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import BaseContext

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.services.redis.dependency import get_redis_pool


class Context(BaseContext):
    """Global graphql context."""

    def __init__(
        self,
        redis_pool: ConnectionPool = Depends(get_redis_pool),
        db_connection: AsyncSession = Depends(get_db_session),
    ) -> None:
        self.redis_pool = redis_pool
        self.db_connection = db_connection


def get_context(context: Context = Depends(Context)) -> Context:
    """
    Get custom context.

    :param context: graphql context.
    :return: context
    """
    return context
