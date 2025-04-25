from fastapi.routing import APIRouter

from frait_health_backend.web.api import monitoring
from frait_health_backend.web.api.auth import msal_router

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(msal_router, prefix="/auth")


