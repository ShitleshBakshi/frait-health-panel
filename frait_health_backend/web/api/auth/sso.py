"""SSO authentication handlers and utilities."""

from typing import Optional
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
from frait_health_backend.settings import Settings
from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserModel
from .role_mapper import map_sso_role

settings = Settings()
oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl=settings.sso_authorize_endpoint,
    tokenUrl=settings.sso_token_endpoint,
)

async def verify_sso_token(token: str) -> dict:
    """Verify SSO token and extract claims."""
    try:
        # Decode and verify the JWT token
        decoded = jwt.decode(
            token,
            settings.sso_client_secret,
            algorithms=["RS256"],
            audience=settings.sso_client_id,
        )
        return decoded
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
        )

async def get_or_create_sso_user(
    claims: dict,
    db_connection,
) -> UserModel:
    """Get or create user from SSO claims."""
    dao = UserDAO(db_connection)
    
    # Extract user info from claims
    external_id = claims.get("sub")
    email = claims.get("email")
    name = claims.get("name")
    
    # Try to find existing user
    user = await dao.get_user_by_external_id(external_id)
    if user:
        return user
        
    # Create new user if not exists
    role = map_sso_role(claims)
    user = await dao.create_sso_user(
        external_id=external_id,
        email=email,
        name=name,
        role=role,
        identity_provider=settings.sso_provider,
        sso_metadata=claims,
    )
    return user

async def authenticate_sso_user(token: str = Depends(oauth2_scheme)):
    """Authenticate user via SSO token."""
    claims = await verify_sso_token(token)
    return await get_or_create_sso_user(claims)