"""Query resolvers for family details types."""

from typing import List

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.family_details_dao import FamilyDetailsDAO
from frait_health_backend.web.gql.family_details.schema import FamilyDetailsModelDTO


@strawberry.type
class Query:
    @strawberry.field
    async def get_family_details_models(
        self,
        limit: int = 100,
        offset: int = 0,
        info: Info = strawberry.UNSET,
    ) -> List[FamilyDetailsModelDTO]:
        """
        Resolver for getting all family details entries.

        :param context: GraphQL context
        :return: list of all family details
        """
        try:
            dao = FamilyDetailsDAO(session=info.context.db_session)
            family_details_models = await dao.get_all_family_details(
                limit=limit, offset=offset,
            )
            return family_details_models
        except Exception as e:
            print(f"Error fetching family details: {e}")
            return []

    @strawberry.field
    async def get_family_details(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> FamilyDetailsModelDTO:
        """
        Get specific family details.

        :param context: GraphQL context
        :param family_id: id of the family details to fetch
        :return: family details with matching id
        """
        try:
            dao = FamilyDetailsDAO(session=info.context.db_session)
            family_details = await dao.get_family_details(family_id=family_id)
            return family_details
        except Exception as e:
            print(f"Error fetching family details: {e}")
            return []
