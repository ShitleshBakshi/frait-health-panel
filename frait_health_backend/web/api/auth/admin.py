"""Admin functions for user management and system initialization."""

from typing import List, Optional

import ldap3
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.settings import Settings
from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserModel, UserRole
from frait_health_backend.web.api.auth.ldap_auth import (
    get_ldap_connection,
    search_ldap_user,
    process_user_attributes
)
from frait_health_backend.db.dependencies import get_db_session

settings = Settings()

async def check_if_system_initialized(db_session: AsyncSession) -> bool:
    """Check if the system has any users registered."""
    dao = UserDAO(session=db_session)
    users = await dao.get_all_users(limit=1, offset=0)
    return len(users) > 0

async def get_ad_user_details(username: str) -> dict:
    """
    Get user details from Active Directory.

    Returns a dictionary with user information.
    """
    conn = get_ldap_connection()

    try:
        # Bind with service account
        service_account = settings.ldap_service_account
        service_password = settings.ldap_service_password

        if not service_account or not service_password:
            raise ValueError("LDAP service account credentials not configured")

        conn.simple_bind_s(service_account, service_password)

        # Search for the user
        user_dn, attributes = await search_ldap_user(conn, username)

        # Process attributes
        name, email, role, sso_metadata = process_user_attributes(attributes, username)

        return {
            "username": username,
            "name": name,
            "email": email,
            "role": role,
            "sso_metadata": sso_metadata
        }

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"User not found in Active Directory: {str(e)}"
        )
    finally:
        conn.unbind()

async def initialize_system_with_admin(
    admin_username: str,
    db_session: AsyncSession
) -> UserModel:
    """
    Initialize the system with the first admin user.

    This should only be called when the system has no users.
    """
    # Verify system is not already initialized
    is_initialized = await check_if_system_initialized(db_session)
    if is_initialized:
        raise HTTPException(
            status_code=403,
            detail="System already initialized with users"
        )

    try:
        # Get admin details from AD
        admin_details = await get_ad_user_details(admin_username)

        # Create admin user
        dao = UserDAO(session=db_session)
        admin_user = await dao.create_user(
            name=admin_details["name"],
            email=admin_details["email"] or f"{admin_username}@fraithealth.com",
            external_id=admin_username,
            role=UserRole.ADMIN,  # Force admin role
            identity_provider="ldap",
            sso_metadata=admin_details["sso_metadata"]
        )

        return admin_user

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to initialize system: {str(e)}"
        )

async def admin_sync_user(
    username: str,
    role: str,
    db_session: AsyncSession,
    current_user_id: Optional[int] = None
) -> UserModel:
    """
    Sync a user from AD and create them in the database with the specified role.

    This should only be callable by existing admin users.
    """
    # Verify the current user is an admin if provided
    if current_user_id:
        dao = UserDAO(session=db_session)
        current_user = await dao.get_user_by_id(current_user_id)

        if not current_user or current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=403,
                detail="Only administrators can sync users"
            )

    try:
        # Get user details from AD
        user_details = await get_ad_user_details(username)

        # Create user with specified role (override AD-derived role)
        dao = UserDAO(session=db_session)

        # Check if user already exists
        existing_user = await dao.get_user_by_external_id(username)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"User {username} already exists in the system"
            )

        # Create new user
        user = await dao.create_user(
            name=user_details["name"],
            email=user_details["email"] or f"{username}@fraithealth.com",
            external_id=username,
            role=UserRole(role),  # Use specified role
            identity_provider="ldap",
            sso_metadata=user_details["sso_metadata"]
        )

        return user

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync user: {str(e)}"
        )

async def admin_get_users_from_ad(
    filter_term: Optional[str] = None,
    limit: int = 20,
    db_session: AsyncSession = None
) -> List[dict]:
    """
    Search for users in Active Directory.

    This can be used by admins to find users to add to the system.
    """
    conn = get_ldap_connection()

    try:
        # Bind with service account
        service_account = settings.ldap_service_account
        service_password = settings.ldap_service_password

        if not service_account or not service_password:
            raise ValueError("LDAP service account credentials not configured")

        conn.simple_bind_s(service_account, service_password)

        # Create search filter
        if filter_term:
            # Search by name or username
            search_filter = f"(&(objectClass=user)(|(cn=*{filter_term}*)(sAMAccountName=*{filter_term}*)))"
        else:
            # Just get all users
            search_filter = "(objectClass=user)"

        # Perform the search
        result = conn.search_s(
            settings.ldap_search_base,
            ldap.SCOPE_SUBTREE,
            search_filter,
            ["sAMAccountName", "displayName", "mail", "memberOf"],
            sizelimit=limit
        )

        # Process results
        users = []
        for user_dn, attributes in result:
            # Skip non-user objects
            if "sAMAccountName" not in attributes:
                continue

            # Get username
            username_attr = attributes["sAMAccountName"]
            if not username_attr or not isinstance(username_attr, list) or not username_attr[0]:
                continue

            username = username_attr[0].decode() if isinstance(username_attr[0], bytes) else username_attr[0]

            # Process attributes
            name, email, role, _ = process_user_attributes(attributes, username)

            # Check if user already exists in database
            exists_in_db = False
            if db_session:
                dao = UserDAO(session=db_session)
                existing_user = await dao.get_user_by_external_id(username)
                exists_in_db = existing_user is not None

            users.append({
                "username": username,
                "name": name,
                "email": email,
                "ad_role": role,
                "exists_in_system": exists_in_db
            })

        return users

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search AD: {str(e)}"
        )
    finally:
        conn.unbind()
