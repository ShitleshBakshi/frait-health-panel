"""Role mapping utilities for SSO integration."""

from typing import Optional

from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.settings import Settings

settings = Settings()

def map_sso_role(claims: dict) -> UserRole:
    """
    Map SSO claims to application role.
    
    :param claims: JWT claims from SSO token
    :return: Mapped UserRole
    """
    # Get roles/groups from claims (implementation depends on SSO provider)
    sso_roles = claims.get("roles", [])
    sso_groups = claims.get("groups", [])
    
    # Azure AD specific mappings
    if settings.sso_provider == "azure":
        return _map_azure_role(sso_roles, sso_groups)
        
    # Default to Health Visitor role
    return UserRole.HEALTH_VISITOR

def _map_azure_role(roles: list, groups: list) -> UserRole:
    """Map Azure AD roles to application roles."""
    role_mappings = {
        "Admin": UserRole.ADMIN,
        "Manager": UserRole.MANAGER,
        "HealthVisitor": UserRole.HEALTH_VISITOR,
        "AssistantHealthVisitor": UserRole.ASSISTANT_HEALTH_VISITOR,
    }
    
    # Check roles first
    for role in roles:
        if mapped_role := role_mappings.get(role):
            return mapped_role
            
    # Then check groups
    for group in groups:
        if mapped_role := role_mappings.get(group):
            return mapped_role
            
    return UserRole.HEALTH_VISITOR