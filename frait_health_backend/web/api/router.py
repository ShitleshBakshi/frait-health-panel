from fastapi.routing import APIRouter

from frait_health_backend.web.api import monitoring
from frait_health_backend.web.api.auth import router as auth_router

api_router = APIRouter()
api_router.include_router(monitoring.router)
api_router.include_router(auth_router.router, prefix="/auth", tags=["auth"])
