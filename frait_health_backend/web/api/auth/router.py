"""Router for LDAP authentication endpoints."""
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Request, Query
from fastapi.security import HTTPBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.settings import Settings
from frait_health_backend.web.gql.user.mutation import Mutation
from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.web.api.auth.ldap_auth import authenticate_ldap_user
from frait_health_backend.web.api.auth.auto_auth import auto_authenticate_user
from frait_health_backend.web.api.auth.admin import (
    initialize_system_with_admin,
    admin_sync_user,
    admin_get_users_from_ad,
    check_if_system_initialized
)

security = HTTPBearer()
settings = Settings()
router = APIRouter()

@router.post("/ldap")
async def ldap_auth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db_session: AsyncSession = Depends(get_db_session)
):
    """Handle LDAP authentication."""
    if not settings.ldap_auth_enabled:
        raise HTTPException(
            status_code=404,
            detail="LDAP authentication not enabled",
        )

    # Authenticate against LDAP server
    user = await authenticate_ldap_user(form_data.username, form_data.password, db_session=db_session)

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

@router.get("/auto")
async def auto_auth(
    request: Request,
    db_session: AsyncSession = Depends(get_db_session)
):
    """Automatically authenticate user based on their Windows identity."""

    dao = UserDAO(session=db_session)
    user = await dao.get_user_by_external_id("default-health-visitor")

    if not user:
        # Create a default user if not exists
        user = await dao.create_user(
            name="Default Health Visitor",
            email="healthvisitor@example.com",
            external_id="default-health-visitor",
            role=UserRole.HEALTH_VISITOR,
            identity_provider="default",
            sso_metadata={}
        )

        # Generate JWT token
    access_token = Mutation.create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

    # if not settings.ldap_auth_enabled:
    #     raise HTTPException(
    #         status_code=404,
    #         detail="LDAP authentication not enabled",
    #     )
    #
    # try:
    #     # Get authenticated user
    #     user = await auto_authenticate_user(request, db_session)
    #
    #     # Create session token
    #     access_token = Mutation.create_access_token(
    #         user_id=user.id,
    #         email=user.email,
    #         role=user.role,
    #     )
    #
    #     return {
    #         "access_token": access_token,
    #         "token_type": "bearer",
    #         "user": {
    #             "id": user.id,
    #             "name": user.name,
    #             "email": user.email,
    #             "role": user.role
    #         }
    #     }
    #
    # except HTTPException:
    #     # Re-raise HTTP exceptions
    #     raise
    # except Exception as e:
    #     print(f"Auto-authentication error: {str(e)}")
    #     raise HTTPException(
    #         status_code=500,
    #         detail=f"Auto-authentication failed: {str(e)}",
    #     )

# === SYSTEM INITIALIZATION AND ADMIN ROUTES ===

@router.post("/admin/initialize")
async def initialize_system(
    admin_username: str,
    db_session: AsyncSession = Depends(get_db_session)
):
    """
    Initialize the system with the first admin user.
    Only works when the database has no users.
    """
    try:
        admin_user = await initialize_system_with_admin(admin_username, db_session)

        return {
            "message": "System initialized successfully",
            "admin": {
                "id": admin_user.id,
                "name": admin_user.name,
                "email": admin_user.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"System initialization failed: {str(e)}"
        )

@router.get("/admin/system-status")
async def check_system_status(
    db_session: AsyncSession = Depends(get_db_session)
):
    """Check if the system has been initialized with users."""
    is_initialized = await check_if_system_initialized(db_session)

    return {
        "initialized": is_initialized,
        "auth_method": "LDAP" if settings.ldap_auth_enabled else "Unknown"
    }

@router.post("/admin/sync-user")
async def sync_user(
    username: str,
    role: str,
    db_session: AsyncSession = Depends(get_db_session),
    token: str = Depends(security)
):
    """
    Sync a user from AD and create in the system.
    Only administrators can perform this action.
    """
    try:
        # Proper token validation based on your existing code
        from jwt import decode, PyJWTError

        try:
            token_data = decode(
                token.credentials,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm]
            )

            # Extract user information from token
            user_id = token_data.get("sub")
            user_role = token_data.get("role")

            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token - missing user ID"
                )

            # Verify user is an admin
            if user_role != UserRole.ADMIN.value:
                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can sync users"
                )

            # Verify token is not expired
            if "exp" in token_data and token_data["exp"] < datetime.utcnow().timestamp():
                raise HTTPException(
                    status_code=401,
                    detail="Token has expired"
                )

            # Look up user to verify they exist and are an admin
            dao = UserDAO(session=db_session)
            current_user = await dao.get_user_by_id(user_id)

            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="User not found"
                )

            if current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can sync users"
                )

        except PyJWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid authentication token: {str(e)}"
            )

        # Sync the user
        new_user = await admin_sync_user(username, role, db_session, user_id)

        return {
            "message": f"User {username} synced successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"User sync failed: {str(e)}"
        )

@router.get("/admin/search-ad-users")
async def search_ad_users(
    filter: Optional[str] = Query(None, description="Filter term for username or name"),
    limit: int = Query(20, description="Maximum number of results"),
    db_session: AsyncSession = Depends(get_db_session),
    token: str = Depends(security)
):
    """
    Search for users in Active Directory.
    Only administrators can use this endpoint.
    """
    # Extract user ID from token - similar to above endpoint

    try:
        # Proper token validation based on your existing code
        from jwt import decode, PyJWTError

        try:
            token_data = decode(
                token.credentials,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm]
            )

            # Extract user information from token
            user_id = token_data.get("sub")
            user_role = token_data.get("role")

            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token - missing user ID"
                )

            # Verify user is an admin
            if user_role != UserRole.ADMIN.value:
                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can sync users"
                )

            # Verify token is not expired
            if "exp" in token_data and token_data["exp"] < datetime.utcnow().timestamp():
                raise HTTPException(
                    status_code=401,
                    detail="Token has expired"
                )

            # Look up user to verify they exist and are an admin
            dao = UserDAO(session=db_session)
            current_user = await dao.get_user_by_id(user_id)

            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="User not found"
                )

            if current_user.role != UserRole.ADMIN:
                raise HTTPException(
                    status_code=403,
                    detail="Only administrators can sync users"
                )

        except PyJWTError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid authentication token: {str(e)}"
            )

        # Search AD
        users = await admin_get_users_from_ad(filter, limit, db_session)

        return {"users": users}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AD Search failed: {str(e)}"
        )


