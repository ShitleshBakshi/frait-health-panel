from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.web.api.auth.msal_router import MSALAuthHandler


class MSALAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public routes
        if request.url.path.startswith(('/api/auth', '/api/docs', '/api/openapi.json')):
            return await call_next(request)

        # Get token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Not authenticated")

        token = auth_header.replace("Bearer ", "")

        try:
            # Validate token
            claims = await MSALAuthHandler.validate_token(token)

            # Get user from database
            session = request.app.state.db_session_factory()
            user_dao = UserDAO(session=session)

            # Get external ID from token
            external_id = claims.get("oid")
            user = await user_dao.get_user_by_external_id(external_id, "azure_ad")

            if not user:
                # Auto-provision user if needed
                user = await MSALAuthHandler.get_or_create_user(claims, user_dao)

            # Attach user to request state
            request.state.user = user

            # Continue with the request
            response = await call_next(request)

            # Clean up
            await session.close()

            return response
        except Exception as e:
            raise HTTPException(status_code=401,
                                detail=f"Authentication failed: {str(e)}")
