"""Automatic user authentication using LDAP without login."""

import os
from typing import Optional

from ldap3.core.exceptions import LDAPException, LDAPBindError
from fastapi import HTTPException, Request

from frait_health_backend.settings import Settings
from frait_health_backend.db.models.user_model import UserModel
from frait_health_backend.web.api.auth.ldap_auth import (
    get_ldap_connection,
    search_ldap_user,
    process_user_attributes,
    get_user_by_external_id
)

settings = Settings()

async def get_windows_identity(request: Request) -> str:
    """
    Get the user's Windows identity from request headers or environment.

    Returns the SAM account name (username) without domain.
    """
    # Try various headers that might contain user identity
    potential_headers = [
        "REMOTE_USER",
        "AUTH_USER",
        "X-AUTH-USER",
        "HTTP_REMOTE_USER",
        "LOGON_USER"
    ]

    username = None

    # Check headers (case-insensitive)
    for header in potential_headers:
        for request_header in request.headers:
            if request_header.lower() == header.lower():
                username = request.headers.get(request_header)
                break
        if username:
            break

    # If no username in headers, try environment variables
    if not username:
        username = os.environ.get("USERNAME") or os.environ.get("USER")

    if not username:
        raise HTTPException(
            status_code=401,
            detail="Could not determine user identity",
        )

    # Extract username if in domain\username format
    if "\\" in username:
        _, username = username.split("\\", 1)

    # Extract username if in username@domain format
    if "@" in username:
        username, _ = username.split("@", 1)

    return username

async def get_user_from_ldap(username: str, db_session=None) -> UserModel:
    """
    Get user details from LDAP without requiring password.

    Uses service account to query LDAP.
    Returns user model if found, otherwise raises an error.
    """
    conn = get_ldap_connection()

    try:
        # First try to bind with service account
        try:
            service_account = settings.ldap_service_account
            service_password = settings.ldap_service_password

            if not service_account or not service_password:
                raise ValueError("LDAP service account credentials not configured")

            print(f"Binding with service account: {service_account}")
            if not conn.bind(user=service_account, password=service_password):
                raise LDAPBindError("Invalid service account credentials")

        except LDAPBindError:
            raise HTTPException(
                status_code=401,
                detail="Invalid service account credentials",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Service account bind failed: {str(e)}",
            )

        # Now search for the user in LDAP
        try:
            user_dn, attributes = await search_ldap_user(conn, username)
        except HTTPException:
            raise HTTPException(
                status_code=401,
                detail=f"User {username} not found in Active Directory",
            )

        # Process the user attributes (for logging/debugging)
        name, email, role, sso_metadata = process_user_attributes(attributes, username)

        # Get user from database - will throw error if not found
        user = await get_user_by_external_id(username, db_session)

        return user

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"LDAP error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Auto-authentication failed: {str(e)}",
        )
    finally:
        conn.unbind()

async def auto_authenticate_user(request: Request, db_session=None) -> UserModel:
    """
    Automatically authenticate a user based on their Windows identity.

    Returns: User model if authentication successful
    Raises: HTTPException if authentication fails
    """
    # Get Windows username
    username = await get_windows_identity(request)

    # Get user from LDAP and verify in database
    return await get_user_from_ldap(username, db_session)
