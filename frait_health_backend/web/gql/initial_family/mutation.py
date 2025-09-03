import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.initial_family_dao import InitialFamilyDAO

from .schema import InitialFamilyInput, InitialFamilyModelDTO


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_initial_family(
        self,
        input: InitialFamilyInput,
        info: Info,
    ) -> InitialFamilyModelDTO:
        """
        Create initial family record.

        :param input: Input data for creating family
        :param info: GraphQL context
        :return: True if the record was created
        """
        dao = InitialFamilyDAO(info.context.db_session)
        family = await dao.create_initial_family(
            family_name=input.family_name,
            child_dob=input.child_dob,
            nhs_number=input.nhs_number,
        )
        return InitialFamilyModelDTO(
            id=family.id,
            family_name=family.family_name,
            child_dob=family.child_dob,
            nhs_number=family.nhs_number,
        )
