"""Router for LDAP authentication endpoints."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from fastapi.security import OAuth2PasswordRequestForm
from frait_health_backend.settings import Settings
from frait_health_backend.web.gql.user.mutation import Mutation
from .ldap_auth import authenticate_ldap_user

security = HTTPBearer()
settings = Settings()
router = APIRouter()

@router.post("/auth/ldap")
async def ldap_auth(form_data: OAuth2PasswordRequestForm = Depends()):
    """Handle LDAP authentication."""
    if not settings.ldap_auth_enabled:
        raise HTTPException(
            status_code=404,
            detail="LDAP authentication not enabled",
        )
    
    # Authenticate against LDAP server
    user = await authenticate_ldap_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )
    
    # Create session token
    access_token = Mutation.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )
    
    return {"access_token": access_token, "token_type": "bearer"}