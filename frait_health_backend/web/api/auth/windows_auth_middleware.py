# Create windows_auth_middleware.py
from typing import Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from frait_health_backend.settings import Settings
from frait_health_backend.web.gql.user.mutation import Mutation
from frait_health_backend.db.dao.user_dao import UserDAO

settings = Settings()

class WindowsAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip for non-authenticated endpoints
        if request.url.path.startswith(('/api/docs', '/api/redoc', '/static/')):
            return await call_next(request)

        if not settings.windows_auth_enabled:
            return await call_next(request)

        # Get Windows authentication information from headers
        # These headers come from IIS/Apache when configured for Windows Auth
        auth_user = request.headers.get("X-Auth-User")

        if not auth_user:
            # If no authentication info, return 401 to trigger Windows Auth
            response = Response(status_code=401)
            response.headers["WWW-Authenticate"] = "Negotiate"
            return response

        # Process the authenticated user
        username = self.extract_windows_username(request)
        if username:
            # Store the username in request state for later use
            request.state.windows_username = username

            # Try to find user in database
            user_dao = UserDAO()
            user = await user_dao.get_user_by_external_id(username)

            if user:
                # User exists, create session token
                from frait_health_backend.web.gql.user.mutation import Mutation
                token = Mutation.create_access_token(
                    user_id=user.id,
                    email=user.email,
                    role=user.role,
                )

                # Store token in request state
                request.state.auth_token = token

        # Continue with the request
        return await call_next(request)

    def extract_windows_username(request: Request) -> Optional[str]:
        """Extract Windows username from request headers."""
        auth_user = request.headers.get("X-Auth-User")
        if not auth_user:
            return None

        # Handle domain\username format
        if "\\" in auth_user:
            domain, username = auth_user.split("\\", 1)
            return username

        return auth_user
