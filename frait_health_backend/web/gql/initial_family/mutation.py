from datetime import date
import strawberry
from typing import Optional

from frait_health_backend.db.dao.initial_family_dao import InitialFamilyDAO
from strawberry.types import Info
from .schema import InitialFamilyInput
from .resolver import resolve_create_initial_family


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_initial_family(
        self,
        input: InitialFamilyInput,
        info: Info
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
