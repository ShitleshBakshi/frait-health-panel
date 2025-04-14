from importlib import metadata

from fastapi import FastAPI
from fastapi.responses import UJSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.cors import CORSMiddleware

from frait_health_backend.log import configure_logging
from frait_health_backend.settings import settings
from frait_health_backend.web.api.router import api_router
from frait_health_backend.web.api.auth.router import router
from frait_health_backend.web.gql.router import gql_router
from frait_health_backend.web.lifespan import lifespan_setup
from frait_health_backend.web.api.auth.windows_auth_middleware import WindowsAuthMiddleware


def get_app() -> FastAPI:
    """
    Get FastAPI application.

    This is the main constructor of an application.

    :return: application.
    """
    configure_logging()
    app = FastAPI(
        title="frait_health_backend",
        version=metadata.version("frait_health_backend"),
        lifespan=lifespan_setup,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        default_response_class=UJSONResponse,
    )

    if settings.windows_auth_enabled:
        app.add_middleware(WindowsAuthMiddleware)

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://dev.efrait.com:9443",
                       "http://dev.efrait.com:8080",
                       "http://localhost:3000",
                       # Add both HTTPS and HTTP variants
                       "https://dev.efrait.com:8443"
                       "https://dev.efrait.com",
                       "http://dev.efrait.com",],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    class DefaultAuthMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            # Generate a token for Health Visitor role
            from frait_health_backend.web.gql.user.mutation import Mutation
            token = Mutation.create_access_token(
                user_id=1,
                email="healthvisitor@example.com",
                role="Health Visitor",
            )

            # Add token to request headers
            request.scope["headers"].append(
                (b"authorization", f"Bearer {token}".encode())
            )

            return await call_next(request)

    # Main router for the API.
    app.add_middleware(DefaultAuthMiddleware)
    app.include_router(router=api_router, prefix="/api")
    app.include_router(router=router, prefix="/api/auth", tags=["auth"])
    # Graphql router
    app.include_router(router=gql_router, prefix="/graphql")

    return app
