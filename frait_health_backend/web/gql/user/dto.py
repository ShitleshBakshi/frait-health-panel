from typing import Any, Dict, Optional

import strawberry


@strawberry.type
class UserContextDTO:
    """DTO for user context data that is exposed to GraphQL."""

    id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

    @classmethod
    def from_token_data(cls, token_data: Optional[Dict[str, Any]]) -> "UserContextDTO":
        """Create DTO from token data dictionary."""
        if not token_data:
            return cls()
        return cls(
            id=token_data.get("id"),
            email=token_data.get("email"),
            role=token_data.get("role"),
        )
