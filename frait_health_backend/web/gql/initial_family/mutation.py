import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.initial_family_dao import InitialFamilyDAO

from .schema import InitialFamilyInput


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_initial_family(
        self, input: InitialFamilyInput, info: Info,
    ) -> bool:
        """
        Create initial family record.

        :param input: Input data for creating family
        :param info: GraphQL context
        :return: True if the record was created
        """
        dao = InitialFamilyDAO(info.context.db_connection)
        await dao.create_initial_family(
            family_name=input.family_name,
            child_dob=input.child_dob,
            nhs_number=input.nhs_number,
        )
        return True
