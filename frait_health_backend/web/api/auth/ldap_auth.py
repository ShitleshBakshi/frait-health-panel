"""LDAP authentication handlers and utilities."""

from typing import Optional, Dict, Any, List, Tuple
import ldap
from fastapi import HTTPException

from frait_health_backend.settings import Settings
from frait_health_backend.db.models.user_model import UserModel, UserRole


settings = Settings()

def get_ldap_connection():
    """Establish connection to LDAP server."""
    try:
        conn = ldap.initialize(settings.ldap_server_url)
        conn.protocol_version = ldap.VERSION3
        conn.set_option(ldap.OPT_REFERRALS, 0)
        return conn
    except ldap.LDAPError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to connect to LDAP server: {str(e)}",
        )

def decode_ldap_attribute(attr_value):
    """Decode LDAP attribute from bytes if needed."""
    if isinstance(attr_value, bytes):
        return attr_value.decode()
    return attr_value

def get_ldap_attribute(attributes: Dict[str, Any], key: str) -> str:
    """Extract and decode an LDAP attribute safely."""
    if key not in attributes:
        return ""

    attr = attributes[key]
    if not attr or not isinstance(attr, list) or not attr[0]:
        return ""

    return decode_ldap_attribute(attr[0])

def process_ldap_groups(group_list) -> List[str]:
    """Process and normalize LDAP group list."""
    if not group_list:
        return []

    if isinstance(group_list, bytes):
        group_list = [group_list]

    return [decode_ldap_attribute(g) for g in group_list]


def map_groups_to_role(groups: List[str]) -> str:
    """Map AD groups to application roles."""
    role = None
    for role_name, group_name in settings.ldap_role_groups.items():
        group_pattern = f"CN={group_name},"
        for group in groups:
            if group_pattern in group:
                role = role_name
                break
        if role:
            break

    if not role:
        print(f"User has no mapped roles. Groups: {groups}")
        print(f"Looking for groups: {settings.ldap_role_groups.values()}")
        # Assign default role for testing
        role = "Health Visitor"  # Default role for testing - remove in production

    return role

def process_user_attributes(attributes: Dict[str, Any], username: str) -> Tuple[str, str, str, Dict[str, List[str]]]:
    """
    Process LDAP user attributes to extract name, email, role, and metadata.

    Returns: (name, email, role, sso_metadata)
    """
    # Get display name or default to username
    name = get_ldap_attribute(attributes, "displayName") or username

    # Get email
    email = get_ldap_attribute(attributes, "mail")

    # Process groups
    groups = process_ldap_groups(attributes.get("memberOf", []))

    # Map groups to role
    role = map_groups_to_role(groups)

    # Prepare SSO metadata
    sso_metadata = {"groups": groups}

    return name, email, role, sso_metadata

async def get_user_by_external_id(username: str, db_session) -> UserModel:
    """
    Get existing user by external ID.

    Throws an error if user doesn't exist.
    """
    from frait_health_backend.db.dao.user_dao import UserDAO

    dao = UserDAO(session=db_session)
    user = await dao.get_user_by_external_id(username)

    if not user:
        print(f"User with external_id {username} not found in database")
        raise HTTPException(
            status_code=401,
            detail="User not registered in system. Please contact your administrator."
        )

    print(f"Found existing user in database: {user.id} - {user.name}")
    return user

async def search_ldap_user(conn, username: str) -> Tuple[str, Dict[str, Any]]:
    """Search for a user in LDAP and return their DN and attributes."""
    search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"

    # Perform the search
    result = conn.search_s(
        settings.ldap_search_base,
        ldap.SCOPE_SUBTREE,
        search_filter,
        ["memberOf", "mail", "displayName"],
    )

    if not result:
        print("User found in AD but no attributes returned")
        raise HTTPException(
            status_code=401,
            detail="User not found in Active Directory",
        )

    user_dn, attributes = result[0]
    print(f"Found user DN: {user_dn}")

    return user_dn, attributes

async def authenticate_ldap_user(username: str, password: str, db_session=None) -> Optional[UserModel]:
    """Authenticate user against LDAP server and verify user exists in database."""
    conn = get_ldap_connection()

    # Try multiple username formats
    bind_formats = [
        f"{username}@{settings.ldap_domain.lower()}.local",
        f"{settings.ldap_domain}\\{username}",
        username
    ]

    try:
        # First try authenticating with various username formats
        bind_successful = False
        bind_error = None

        for bind_format in bind_formats:
            try:
                print(f"Attempting LDAP bind with: {bind_format}")
                conn.simple_bind_s(bind_format, password)
                bind_successful = True
                print(f"Bind successful with: {bind_format}")
                break
            except ldap.INVALID_CREDENTIALS:
                continue
            except ldap.LDAPError as e:
                bind_error = e
                continue

        if not bind_successful:
            if bind_error:
                raise bind_error
            else:
                raise ldap.INVALID_CREDENTIALS()

        # Search for user in AD
        user_dn, attributes = await search_ldap_user(conn, username)

        # Process the user attributes (still useful for logging/debugging)
        name, email, role, sso_metadata = process_user_attributes(attributes, username)

        # Get the user from database - will raise error if not found
        user = await get_user_by_external_id(username, db_session)

        return user

    except ldap.INVALID_CREDENTIALS:
        print("Invalid LDAP credentials")
        raise HTTPException(
            status_code=401,
            detail="Invalid LDAP credentials",
        )
    except ldap.LDAPError as e:
        print(f"LDAP error: {str(e)}")
        raise HTTPException(
            status_code=401,
            detail=f"LDAP authentication failed: {str(e)}",
        )
    finally:
        conn.unbind()
