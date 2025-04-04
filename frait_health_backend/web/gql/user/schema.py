import strawberry


@strawberry.type
class UserModelDTO:
    """
    DTO for user models.

    It returned when accessing user models from the API.
    """

    id: int
    name: str
    email: str
    role: str
    username: Optional[str] = None
    external_id: Optional[str] = None
    identity_provider: Optional[str] = None
    sso_metadata: Optional[dict] = None


@strawberry.type
class AuthResponse:
    """Response for authentication."""

    access_token: str
    token_type: str = "bearer"
