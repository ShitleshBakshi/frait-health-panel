"""Router for authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from frait_health_backend.settings import Settings
from frait_health_backend.web.gql.user.mutation import Mutation
from .sso import authenticate_sso_user, verify_sso_token

settings = Settings()
router = APIRouter()

@router.get("/login/sso")
async def login_sso():
    """Redirect to SSO provider login page."""
    if not settings.sso_enabled:
        raise HTTPException(status_code=404, detail="SSO not enabled")
        
    return RedirectResponse(
        url=f"{settings.sso_authorize_endpoint}?"
        f"client_id={settings.sso_client_id}&"
        f"response_type=code&"
        f"redirect_uri={settings.sso_redirect_uri}"
    )

@router.get("/login/sso/callback")
async def sso_callback(code: str, request: Request):
    """Handle SSO callback and create session."""
    if not settings.sso_enabled:
        raise HTTPException(status_code=404, detail="SSO not enabled")
        
    # Exchange code for token with SSO provider
    token = await exchange_code_for_token(code)
    
    # Verify token and get user
    claims = await verify_sso_token(token)
    user = await authenticate_sso_user(token)
    
    # Create session token
    access_token = Mutation.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

async def exchange_code_for_token(code: str) -> str:
    """Exchange authorization code for access token with SSO provider."""
    if settings.sso_provider == "azure":
        return await _exchange_azure_code(code)
    raise HTTPException(
        status_code=400,
        detail=f"Unsupported SSO provider: {settings.sso_provider}",
    )

async def _exchange_azure_code(code: str) -> str:
    """Exchange authorization code for Azure AD token."""
    import aiohttp
    
    token_url = f"https://login.microsoftonline.com/{settings.sso_tenant_id}/oauth2/v2.0/token"
    
    data = {
        "client_id": settings.sso_client_id,
        "client_secret": settings.sso_client_secret,
        "code": code,
        "redirect_uri": settings.sso_redirect_uri,
        "grant_type": "authorization_code",
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(token_url, data=data) as response:
            if response.status != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Failed to exchange code for token",
                )
            
            result = await response.json()
            return result.get("access_token")