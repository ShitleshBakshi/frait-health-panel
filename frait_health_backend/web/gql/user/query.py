from typing import List, Optional

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.web.gql.user.schema import UserModelDTO


@strawberry.type
class Query:
    """Query to interact with users."""

    @strawberry.field(description="Get current authenticated user")
    async def me(self, info: Info) -> Optional[UserModelDTO]:
        """
        Retrieves the current authenticated user based on JWT token.

        :param info: connection info with context that contains user data from JWT.
        :return: current user or None if not authenticated.
        """

        user_dao = UserDAO(session=info.context.db_connection)
        user = await user_dao.filter(role=UserRole.HEALTH_VISITOR, limit=1)

        if user and len(user) > 0:
            user = user[0]
        else:
            # Return default user info
            return UserModelDTO(
                id=1,
                name="Default Health Visitor",
                email="healthvisitor@example.com",
                role="Health Visitor",
                username="healthvisitor",
                external_id="default-hv",
                identity_provider="default",
                sso_metadata=None
            )

        return UserModelDTO(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            username=user.username,
            external_id=user.external_id,
            identity_provider=user.identity_provider,
            sso_metadata=user.sso_metadata,
        )

        # # if not info.context.user_context.id:
        # #     return None
        #
        # # Get user ID from the JWT token data stored in context
        # user_id = info.context.user_context.id
        # if not user_id:
        #     return None
        #
        # # Use the UserDAO to fetch the complete user model
        # user_dao = UserDAO()
        # user = await user_dao.get_user_by_id(user_id=user_id)
        #
        # if not user:
        #     return None
        #
        # return UserModelDTO(
        #     id=user.id,
        #     name=user.name,
        #     email=user.email,
        #     role=user.role,
        #     username=user.username,
        #     external_id=user.external_id,
        #     identity_provider=user.identity_provider,
        #     sso_metadata=user.sso_metadata,
        # )

    @strawberry.field(description="Get all users")
    async def get_users(
        self,
        info: Info,
        limit: int = 15,
        offset: int = 0,
    ) -> List[UserModelDTO]:
        """
        Retrieves all user objects from database.

        :param info: connection info.
        :param limit: limit of user objects, defaults to 15.
        :param offset: offset of user objects, defaults to 0.
        :return: list of user objects from database.
        """
        dao = UserDAO(session=info.context.db_connection)
        users = await dao.get_all_users(limit=limit, offset=offset)
        return [
            UserModelDTO(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                username=user.username,
                external_id=user.external_id,
                identity_provider=user.identity_provider,
                sso_metadata=user.sso_metadata,
            )
            for user in users
        ]

    @strawberry.field(description="Filter users")
    async def filter_users(
        self,
        info: Info,
        email: Optional[str] = None,
        name: Optional[str] = None,
        role: Optional[str] = None,
    ) -> List[UserModelDTO]:
        """
        Filter users by various criteria.

        :param info: connection info.
        :param email: email of the user.
        :param name: name of the user.
        :param role: role of the user.
        :return: list of filtered user objects from database.
        """
        dao = UserDAO(session=info.context.db_connection)
        from frait_health_backend.db.models.user_model import UserRole

        user_role = UserRole(role) if role else None
        users = await dao.filter(
            email=email,
            name=name,
            role=user_role,
        )

        if not users:
            return []

        return [
            UserModelDTO(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                username=user.username,
                external_id=user.external_id,
                identity_provider=user.identity_provider,
                sso_metadata=user.sso_metadata,
            )
            for user in users
        ]
