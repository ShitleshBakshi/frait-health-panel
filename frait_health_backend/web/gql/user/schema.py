
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


@strawberry.type
class AuthResponse:
    """Response for authentication."""

    access_token: str
    token_type: str = "bearer"
