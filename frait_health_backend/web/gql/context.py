from typing import Dict, Any, Optional

import jwt
from fastapi import Depends, Request
from redis.asyncio import ConnectionPool
from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import BaseContext

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.services.redis.dependency import get_redis_pool
from frait_health_backend.settings import settings
from frait_health_backend.web.gql.user.dto import UserContextDTO


def get_token_from_request(request: Request) -> Optional[str]:
    """
    Extract token from request.
    
    :param request: HTTP request
    :return: token if found, None otherwise
    """
    # Check Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]  # Remove "Bearer " prefix
        
    # Check query parameters
    token = request.query_params.get("token")
    if token:
        return token
        
    # Check cookies
    token = request.cookies.get("token")
    if token:
        return token
        
    return None


def get_user_from_token(token: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Extract user information from token.
    
    :param token: JWT token
    :return: user information if token is valid, None otherwise
    """
    if not token:
        return None
        
    try:
        # Decode JWT token
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        
        return payload
    except jwt.PyJWTError:
        return None


class Context(BaseContext):
    """Global graphql context."""

    def __init__(
        self,
        request: Request,
        redis_pool: ConnectionPool = Depends(get_redis_pool),
        db_connection: AsyncSession = Depends(get_db_session),
    ) -> None:
        self.redis_pool = redis_pool
        self.db_connection = db_connection
        self.request = request
        
        # Extract token from request
        token = get_token_from_request(request)
        
        # Extract user information from token
        token_data = get_user_from_token(token)
        
        # Create user context
        self.user_context = UserContextDTO.from_token_data(token_data)


def get_context(context: Context = Depends(Context)) -> Context:
    """
    Get custom context.

    :param context: graphql context.
    :return: context
    """
    return context

