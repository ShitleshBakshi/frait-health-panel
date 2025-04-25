"""MSAL authentication router for Azure AD authentication."""

import json
from typing import Dict, Any, Optional, List
from urllib.parse import urlencode

import msal
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.settings import settings

# Create router
router = APIRouter(prefix="/msal", tags=["auth"])

# Cache for MSAL confidential client applications
_msal_apps: Dict[str, msal.ConfidentialClientApplication] = {}


def get_msal_app() -> msal.ConfidentialClientApplication:
    """
    Get or create an MSAL confidential client application.
    
    :return: MSAL confidential client application
    """
    tenant_id = settings.azure_tenant_id
    if not tenant_id:
        raise ValueError("Azure AD tenant ID is not configured")
        
    if tenant_id not in _msal_apps:
        _msal_apps[tenant_id] = msal.ConfidentialClientApplication(
            client_id=settings.azure_client_id,
            client_credential=settings.azure_client_secret,
            authority=settings.azure_authority_url,
            validate_authority=settings.azure_validate_authority,
        )
    
    return _msal_apps[tenant_id]


def generate_auth_url(redirect_uri: str, state: Optional[str] = None, scopes: Optional[List[str]] = None) -> str:
    """
    Generate an authorization URL for Azure AD authentication.
    
    :param redirect_uri: redirect URI after authentication
    :param state: optional state to include in the request
    :param scopes: optional scopes to request
    :return: authorization URL
    """
    if not scopes:
        scopes = settings.azure_scopes
        
    msal_app = get_msal_app()
    auth_url = msal_app.get_authorization_request_url(
        scopes=scopes,
        redirect_uri=redirect_uri,
        state=state,
    )
    
    return auth_url


async def get_user_from_token(token_data: Dict[str, Any], user_dao: UserDAO) -> Dict[str, Any]:
    """
    Get or create a user from token data.
    
    :param token_data: token data from Azure AD
    :param user_dao: user DAO
    :return: user data
    """
    # Extract user information from token
    object_id = token_data.get("oid")
    if not object_id:
        raise ValueError("Token does not contain an object ID (oid)")
        
    email = token_data.get("email") or token_data.get("preferred_username")
    if not email:
        raise ValueError("Token does not contain an email or preferred_username")
        
    name = token_data.get("name")
    if not name:
        name = email.split("@")[0]  # Use part of email as name if not provided
        
    # Try to find user by external ID
    user = await user_dao.get_user_by_external_id(external_id=object_id, identity_provider="azure_ad")
    
    if not user and settings.auto_provision_users:
        # Try to find user by email
        user = await user_dao.get_user_by_email(email=email)
        
        if user:
            # Update existing user with Azure AD information
            user.external_id = object_id
            user.identity_provider = "azure_ad"
            user.sso_metadata = token_data
            await user_dao.session.flush()
        else:
            # Create new user
            user_role = UserRole(settings.default_user_role)
            user = await user_dao.create_user(
                name=name,
                email=email,
                role=user_role,
                external_id=object_id,
                identity_provider="azure_ad",
                username=email,
                sso_metadata=token_data,
            )
    elif not user:
        raise ValueError(f"User with external ID {object_id} not found and auto-provisioning is disabled")
        
    # Return user data
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "external_id": user.external_id,
        "identity_provider": user.identity_provider,
    }


@router.get("/login")
async def login(request: Request, redirect_uri: Optional[str] = None):
    """
    Initiate Azure AD authentication.
    
    :param request: request object
    :param redirect_uri: optional redirect URI after successful authentication
    :return: redirect to Azure AD login page
    """
    # Use configured redirect URI if not provided
    if not redirect_uri:
        redirect_uri = settings.azure_redirect_uri
        
    # Generate state to include the final redirect URI
    state = None
    if redirect_uri != settings.azure_redirect_uri:
        state = json.dumps({"redirect_uri": redirect_uri})
        
    # Generate authorization URL
    auth_url = generate_auth_url(
        redirect_uri=settings.azure_redirect_uri,
        state=state,
    )
    
    return RedirectResponse(auth_url)


@router.get("/callback")
async def callback(
    request: Request,
    code: str,
    state: Optional[str] = None,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Handle callback from Azure AD authentication.
    
    :param request: request object
    :param code: authorization code from Azure AD
    :param state: optional state from the authorization request
    :param session: database session
    :return: redirect to the application with the token
    """
    # Get MSAL app
    msal_app = get_msal_app()
    
    # Get token from authorization code
    result = msal_app.acquire_token_by_authorization_code(
        code=code,
        scopes=settings.azure_scopes,
        redirect_uri=settings.azure_redirect_uri,
    )
    
    # Check for errors
    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {result.get('error_description', result.get('error'))}",
        )
        
    # Get ID token claims
    id_token_claims = result.get("id_token_claims")
    if not id_token_claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No ID token claims found in the authentication result",
        )
        
    # Get or create user
    try:
        user_dao = UserDAO(session=session)
        user_data = await get_user_from_token(id_token_claims, user_dao)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )
        
    # Create JWT token
    import jwt
    import datetime
    
    # Create token payload
    payload = {
        "sub": str(user_data["id"]),
        "name": user_data["name"],
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.jwt_token_expire_minutes),
        "iat": datetime.datetime.utcnow(),
    }
    
    # Create JWT token
    token = jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    
    # Determine redirect URI
    redirect_uri = settings.azure_redirect_uri
    if state:
        try:
            state_data = json.loads(state)
            if "redirect_uri" in state_data:
                redirect_uri = state_data["redirect_uri"]
        except (json.JSONDecodeError, TypeError):
            pass
            
    # Add token to redirect URI
    if "?" in redirect_uri:
        redirect_uri += f"&token={token}"
    else:
        redirect_uri += f"?token={token}"
        
    return RedirectResponse(redirect_uri)


@router.post("/validate")
async def validate_token(
    request: Request,
    token: str,
    session: AsyncSession = Depends(get_db_session),
):
    """
    Validate a token and return user information.
    
    :param request: request object
    :param token: token to validate
    :param session: database session
    :return: user information
    """
    try:
        # Decode JWT token
        import jwt
        
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        
        # Get user
        user_dao = UserDAO(session=session)
        user = await user_dao.get_user_by_id(int(payload["sub"]))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
            
        # Return user information
        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "external_id": user.external_id,
            "identity_provider": user.identity_provider,
        }
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )