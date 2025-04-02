"""Tests for SSO authentication."""

import pytest
from unittest.mock import patch
from fastapi import HTTPException

from frait_health_backend.web.api.auth.sso import verify_sso_token, get_or_create_sso_user
from frait_health_backend.db.models.user_model import UserRole


@pytest.mark.asyncio
async def test_verify_sso_token_valid():
    """Test verifying a valid SSO token."""
    test_token = "valid_token"
    test_claims = {
        "sub": "test_user",
        "email": "test@example.com",
        "name": "Test User",
        "roles": ["Admin"],
    }
    
    with patch("jwt.decode") as mock_decode:
        mock_decode.return_value = test_claims
        claims = await verify_sso_token(test_token)
        assert claims == test_claims


@pytest.mark.asyncio
async def test_verify_sso_token_invalid():
    """Test verifying an invalid SSO token."""
    test_token = "invalid_token"
    
    with patch("jwt.decode") as mock_decode:
        mock_decode.side_effect = Exception("Invalid token")
        with pytest.raises(HTTPException) as exc_info:
            await verify_sso_token(test_token)
        assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_or_create_sso_user_existing(session):
    """Test getting an existing SSO user."""
    test_claims = {
        "sub": "test_user",
        "email": "test@example.com",
        "name": "Test User",
        "roles": ["Admin"],
    }
    
    # First create the user
    user = await get_or_create_sso_user(test_claims, session)
    
    # Then try to get the same user
    existing_user = await get_or_create_sso_user(test_claims, session)
    
    assert user.id == existing_user.id
    assert user.external_id == "test_user"
    assert user.email == "test@example.com"
    assert user.role == UserRole.ADMIN