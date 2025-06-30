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


class UnauthorizedUserException(Exception):
    """Exception raised when a user has no valid role assigned."""
    pass

class MSALAuthHandler:
    """Handler for MSAL (Azure AD) authentication."""

    _jwks_cache = None
    _jwks_last_updated = None

    @classmethod
    def extract_role_from_claims(cls, claims: Dict[str, Any]) -> Optional[str]:
        """
        Extract user role from Azure AD claims.
        Checks both 'roles' and 'groups' claims.
        Returns None if no valid role is found.
        """
        # Define the mapping from Azure AD groups to application roles
        group_to_role_mapping = {
            "POW_EFRAIT_Admins": "Admin",
            "POW_EFRAIT_Managers": "Manager",
            "POW_EFRAIT_HealthVisitors": "Health Visitor",
            "POW_EFRAIT_AssistantHealthVisitors": "Assistant Health Visitor"
        }
        
        # First, check the 'roles' claim
        roles = claims.get("roles", [])
        if roles:
            for role in roles:
                if role in group_to_role_mapping:
                    return group_to_role_mapping[role]
        
        # Then check the 'groups' claim (Azure AD groups are often provided here)
        groups = claims.get("groups", [])
        if groups:
            for group in groups:
                # Groups might be GUIDs, so you might need to map GUIDs to group names
                # For now, assuming group names are provided
                if group in group_to_role_mapping:
                    return group_to_role_mapping[group]
        
        # Check if groups are in a different format (e.g., as part of other claims)
        # Sometimes Azure AD provides groups in the 'wids' claim or custom claims
        wids = claims.get("wids", [])
        if wids:
            # Map well-known IDs to roles if applicable
            pass
        
        # Log the issue for debugging
        print(f"WARNING: No valid role found for user. Roles: {roles}, Groups: {groups}")
        
        # Return None to indicate no valid role found
        return None

    @classmethod
    async def validate_token(cls, token: str) -> Dict[str, Any]:
        """
        Validate the Azure AD token and return the claims.
        For the dual-authentication approach, we need to validate tokens
        received from the frontend.
        """
        try:
            # Decode header to get key ID (kid)
            header = jwt.get_unverified_header(token)
            if "kid" not in header:
                raise HTTPException(status_code=401, detail="Invalid token header")

            # Get the JSON Web Key Set (JWKS) from Azure AD
            if (cls._jwks_cache is None or cls._jwks_last_updated is None or
                (datetime.datetime.utcnow() - cls._jwks_last_updated).total_seconds() > 86400):
                jwks_uri = f"https://login.microsoftonline.com/{settings.azure_tenant_id}/discovery/v2.0/keys"
                response = requests.get(jwks_uri)
                response.raise_for_status()
                cls._jwks_cache = response.json()
                cls._jwks_last_updated = datetime.datetime.utcnow()

            # Find the signing key
            signing_key = None
            for key in cls._jwks_cache["keys"]:
                if key["kid"] == header["kid"]:
                    signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
                    break

            if not signing_key:
                raise HTTPException(status_code=401, detail="Signing key not found")

            # Verify the token
            audience = settings.azure_client_id
            issuer = f"https://login.microsoftonline.com/{settings.azure_tenant_id}/v2.0"

            claims = jwt.decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=audience,
                issuer=issuer,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True,
                }
            )

            # Additional validation
            if "oid" not in claims:
                raise HTTPException(status_code=401,
                                    detail="Missing required claim: oid")

            return claims

        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=401,
                                detail=f"Token validation failed: {str(e)}")

    @classmethod
    async def get_or_create_user(cls, claims: Dict[str, Any], user_dao: UserDAO) -> Any:
        """Get or create a user based on token claims."""
        # Extract user information from claims
        object_id = claims.get("oid")
        if not object_id:
            raise ValueError("Claims do not contain an object ID (oid)")

        email = claims.get("email") or claims.get("preferred_username")
        if not email:
            raise ValueError("Claims do not contain an email or preferred_username")

        name = claims.get("name")
        if not name:
            name = email.split("@")[0]  # Use part of email as name if not provided

        # Extract role from claims
        role_string = cls.extract_role_from_claims(claims)
        
        # If no valid role found, raise unauthorized exception
        if not role_string:
            raise UnauthorizedUserException(
                f"User {email} is not authorized. No valid role assignment found in Azure AD."
            )

        # Try to find user by external ID
        user = await user_dao.get_user_by_external_id(
            external_id=object_id,
            identity_provider="azure_ad"
        )

        if not user and settings.auto_provision_users:
            # Try to find user by email
            user = await user_dao.get_user_by_email(email=email)

            if user:
                # Update existing user with Azure AD information and role
                user.external_id = object_id
                user.identity_provider = "azure_ad"
                user.sso_metadata = claims
                user.role = UserRole(role_string)  # Update role from claims
                await user_dao.session.flush()
            else:
                # Create new user with role from claims
                user_role = UserRole(role_string)
                user = await user_dao.create_user(
                    name=name,
                    email=email,
                    role=user_role,
                    external_id=object_id,
                    identity_provider="azure_ad",
                    username=email,
                    sso_metadata=claims,
                )
        elif not user:
            raise ValueError(
                f"User with external ID {object_id} not found and auto-provisioning is disabled"
            )
        else:
            # Update existing user's role if it has changed
            user.role = UserRole(role_string)
            user.sso_metadata = claims
            await user_dao.session.flush()

        return user


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
    # Use the centralized method to get or create user
    user = await MSALAuthHandler.get_or_create_user(token_data, user_dao)

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
    db_session: AsyncSession = Depends(get_db_session)
):
    """
    Validate a token from the frontend and return user information.
    The token should be an Azure AD token received directly by the frontend.
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No token provided")

    token = auth_header.replace("Bearer ", "")

    try:
        # Validate the Azure AD token
        claims = await MSALAuthHandler.validate_token(token)

        # Get or create user based on claims
        user_dao = UserDAO(session=db_session)
        user = await MSALAuthHandler.get_or_create_user(claims, user_dao)

        # Return user information without creating a new token
        return {
            "success": True,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "external_id": user.external_id,
                "identity_provider": user.identity_provider
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token validation failed: {str(e)}"
        )

