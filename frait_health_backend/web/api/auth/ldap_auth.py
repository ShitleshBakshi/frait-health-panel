"""LDAP authentication handlers and utilities."""

from typing import Optional
import ldap
from fastapi import HTTPException
from frait_health_backend.settings import Settings
from frait_health_backend.db.models.user_model import UserModel
from frait_health_backend.db.dao.user_dao import UserDAO

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

async def authenticate_ldap_user(username: str, password: str) -> Optional[UserModel]:
    """Authenticate user against LDAP server and get or create user in database."""
    conn = get_ldap_connection()
    
    try:
        # Search for user in AD
        search_filter = f"(&(objectClass=user)(sAMAccountName={username}))"
        result = conn.search_s(
            settings.ldap_search_base,
            ldap.SCOPE_SUBTREE,
            search_filter,
            ["memberOf", "mail", "displayName"],
        )
        
        if not result:
            raise HTTPException(
                status_code=401,
                detail="User not found in Active Directory",
            )
            
        user_dn, attributes = result[0]
        
        # Get user's groups
        groups = attributes.get("memberOf", [])
        if isinstance(groups, bytes):
            groups = [groups]
        groups = [g.decode() for g in groups]
        
        # Map AD groups to roles
        role = None
        for role_name, group_name in settings.ldap_role_groups.items():
            group_dn = settings.get_ldap_group_dn(group_name)
            if group_dn in groups:
                role = role_name
                break
                
        if not role:
            raise HTTPException(
                status_code=403,
                detail="User does not have any mapped roles",
            )
            
        # Get or create user in database
        email = attributes.get("mail", [b""])[0].decode()
        name = attributes.get("displayName", [b""])[0].decode()
        
        # Create or update user in database
        user = await UserDAO().get_user_by_external_id(username)
        if not user:
            user = await UserDAO().create_sso_user(
                external_id=username,
                email=email,
                name=name,
                role=role,
                identity_provider="windows_ad",
                sso_metadata={"groups": groups},
            )
            
        return user
            
    except ldap.LDAPError as e:
        raise HTTPException(
            status_code=401,
            detail=f"LDAP authentication failed: {str(e)}",
        )
    finally:
        conn.unbind()