"""LDAP authentication handlers and utilities."""

from typing import Optional
import ldap
from fastapi import HTTPException

from frait_health_backend.settings import Settings
from frait_health_backend.db.models.user_model import UserModel


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

async def authenticate_ldap_user(username: str, password: str, db_session=None) -> Optional[UserModel]:
    """Authenticate user against LDAP server and get or create user in database."""
    conn = get_ldap_connection()

    # Try multiple username formats
    bind_formats = [
        f"{username}@{settings.ldap_domain.lower()}.local",  # username@domain.local
        f"{settings.ldap_domain}\\{username}",              # DOMAIN\username
        username                                            # Just username
    ]

    user_dn = None
    attributes = None

    try:
        # First try authenticating with various username formats
        bind_successful = False
        bind_error = None

        for bind_format in bind_formats:
            try:
                # Print for debugging
                print(f"Attempting LDAP bind with: {bind_format}")
                conn.simple_bind_s(bind_format, password)
                bind_successful = True
                print(f"Bind successful with: {bind_format}")
                break
            except ldap.INVALID_CREDENTIALS:
                # Try next format
                continue
            except ldap.LDAPError as e:
                bind_error = e
                continue

        if not bind_successful:
            # If all binds failed, raise the last error
            if bind_error:
                raise bind_error
            else:
                raise ldap.INVALID_CREDENTIALS()

        # Search for user in AD to get their groups and details
        # Use samAccountName filter which is more reliable
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

        # Get user's groups
        groups = attributes.get("memberOf", [])
        if isinstance(groups, bytes):
            groups = [groups]
        groups = [g.decode() if isinstance(g, bytes) else g for g in groups]

        # Map AD groups to roles
        role = None
        for role_name, group_name in settings.ldap_role_groups.items():
            # Look for the group name in the group strings
            # Instead of doing exact match, check if the CN=GroupName part exists in any groups
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

        # Get user details
        email = ""
        if "mail" in attributes:
            mail_attr = attributes["mail"]
            if mail_attr and isinstance(mail_attr, list) and mail_attr[0]:
                email = mail_attr[0].decode() if isinstance(mail_attr[0], bytes) else mail_attr[0]

        name = username  # Default to username if displayName not available
        if "displayName" in attributes:
            name_attr = attributes["displayName"]
            if name_attr and isinstance(name_attr, list) and name_attr[0]:
                name = name_attr[0].decode() if isinstance(name_attr[0], bytes) else name_attr[0]

        # Create or update user in database
        from frait_health_backend.db.dao.user_dao import UserDAO
        from frait_health_backend.db.models.user_model import UserRole

        dao = UserDAO(session=db_session)
        user = await dao.get_user_by_external_id(username)

        if not user:
            user = await dao.create_user(
                name=name,
                email=email or f"{username}@example.com",  # Fallback email
                external_id=username,
                role=UserRole(role),
                identity_provider="ldap",
                sso_metadata={"groups": groups},
            )
            print(f"Created new user in database: {user.id} - {user.name}")
        else:
            print(f"Found existing user in database: {user.id} - {user.name}")

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
