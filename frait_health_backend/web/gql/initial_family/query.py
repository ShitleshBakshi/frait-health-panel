"""Query resolvers for initial family types."""

from typing import List

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.initial_family_dao import InitialFamilyDAO

from .schema import InitialFamilyModelDTO


@strawberry.type
class Query:
    @strawberry.field
    async def get_initial_family_models(
        self,
        limit: int = 100,
        offset: int = 0,
        info: Info = strawberry.UNSET,
    ) -> List[InitialFamilyModelDTO]:
        """
        Get all initial family entries.

        :param limit: limit of entries
        :param offset: offset of entries
        :param info: GraphQL context
        :return: List of initial family entries
        """
        try:
            dao = InitialFamilyDAO(info.context.db_connection)
            family = await dao.get_all_families(limit=limit, offset=offset)
            return family
        except Exception as e:
            print(f"Error fetching initial families: {e}")
            return []
