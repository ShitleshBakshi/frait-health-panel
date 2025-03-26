from importlib import metadata

from fastapi import FastAPI
from fastapi.responses import UJSONResponse
from starlette.middleware.cors import CORSMiddleware

from frait_health_backend.log import configure_logging
from frait_health_backend.web.api.router import api_router
from frait_health_backend.web.gql.router import gql_router
from frait_health_backend.web.lifespan import lifespan_setup


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

    # Main router for the API.
    app.include_router(router=api_router, prefix="/api")
    # Graphql router
    app.include_router(router=gql_router, prefix="/graphql")

    return app
