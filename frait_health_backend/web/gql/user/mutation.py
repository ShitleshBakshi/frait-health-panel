import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.user_dao import UserDAO
from frait_health_backend.db.models.user_model import UserRole
from frait_health_backend.web.gql.user.schema import UserModelDTO


@strawberry.type
class Mutation:
    """Mutations for users."""

    @strawberry.mutation(description="Create user object in a database")
    async def create_user(
        self,
        info: Info,
        name: str,
        email: str,
        role: str,
        external_id: str,
        identity_provider: str = "local"
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


