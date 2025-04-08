from datetime import datetime, timedelta
from typing import Optional

import jwt
import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.settings import Settings, settings
from frait_health_backend.web.gql.user.schema import AuthResponse, UserModelDTO


@strawberry.type
class Mutation:
    """Mutations for users."""

    @staticmethod
    def get_settings() -> Settings:
        """Cache settings to avoid repeated instantiation."""
        return Settings()

    @classmethod
    def create_access_token(cls, user_id: int, email: str, role: str) -> str:
        """
        Create JWT access token.

        :param user_id: ID of the user.
        :param email: email of the user.
        :param role: role of the user.
        :return: JWT token string.
        """
        settings = cls.get_settings()
        expire = datetime.utcnow() + timedelta(
            minutes=settings.jwt_token_expire_minutes,
        )

        payload = {
            "sub": str(user_id),
            "email": email,
            "role": role,
            "exp": expire.timestamp(),
            "iat": datetime.utcnow().timestamp(),
        }

        jwt_secret = settings.jwt_secret_key

        return jwt.encode(
            payload,
            jwt_secret,
            algorithm=settings.jwt_algorithm,
        )

    @strawberry.mutation(description="Create user object in a database")
    async def create_user(
        self,
        info: Info,
        name: str,
        email: str,
        role: str,
        external_id: str,
        identity_provider: str = "ldap"
    ) -> UserModelDTO:
        """Creates user model in a database."""
        dao = UserDAO(info.context.db_connection)
        user_role = UserRole(role)
        user = await dao.create_user(
            name=name,
            email=email,
            external_id=external_id,
            role=user_role,
            identity_provider=identity_provider,
        )
        return UserModelDTO(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
        )

    @strawberry.mutation(description="LDAP authentication")

    async def ldap_login(
        self,
        info: Info,
        username: str,
        password: str,
    ) -> AuthResponse:
        """
        Authenticate user with LDAP credentials.

        :param info: connection info.
        :param username: LDAP username of the user (typically without domain)
        :param password: LDAP password of the user
        :return: authentication response with user details if successful.
        """
        if not settings.ldap_auth_enabled:
            return AuthResponse(
                success=False,
                message="LDAP authentication not enabled",
                token=None,
                user=None,
            )

        try:
            # Import the LDAP authentication function
            from frait_health_backend.web.api.auth.ldap_auth import authenticate_ldap_user

            # Authenticate against LDAP
            user = await authenticate_ldap_user(username, password, db_session=info.context.db_connection)

            if not user:
                return AuthResponse(
                    success=False,
                    message="Invalid LDAP credentials",
                    token=None,
                    user=None,
                )

            # Generate JWT token
            token = Mutation.create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role,
            )

            user_dto = UserModelDTO(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
            )

            return AuthResponse(
                success=True,
                token=token,
                message="LDAP authentication successful",
                user=user_dto,
            )
        except Exception as e:
            return AuthResponse(
                success=False,
                message=f"LDAP authentication error: {str(e)}",
                token=None,
                user=None,
            )

    # async def login(
    #     self,
    #     info: Info,
    #     email: str,
    #     password: str,
    # ) -> AuthResponse:
    #     """
    #     Authenticate user with email and password.
    #
    #     :param info: connection info.
    #     :param email: email of the user.
    #     :param password: password of the user.
    #     :return: authentication response with user details if successful.
    #     """
    #     dao = UserDAO(info.context.db_connection)
    #     user = await dao.authenticate_user(email=email, password=password)
    #
    #     if user is None:
    #         return AuthResponse(
    #             success=False,
    #             message="Invalid credentials",
    #             token=None,
    #             user=None,
    #         )
    #
    #     # Generate JWT tokens
    #     token = Mutation.create_access_token(
    #         user_id=user.id,
    #         email=user.email,
    #         role=user.role,
    #     )
    #
    #     user_dto = UserModelDTO(
    #         id=user.id,
    #         name=user.name,
    #         email=user.email,
    #         role=user.role,
    #     )
    #
    #     return AuthResponse(
    #         success=True,
    #         token=token,
    #         message="Login successful",
    #         user=user_dto,
    #     )
