"""Query resolvers for initial family types."""

from typing import List

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.frai_assessment_dao import FraiAssessmentDAO

from .schema import FraiAssessmentModelDTO


@strawberry.type
class Query:
    @strawberry.field
    async def get_initial_frai_assessment_models(
        self,
        limit: int = 100,
        offset: int = 0,
        info: Info = strawberry.UNSET,
    ) -> List[FraiAssessmentModelDTO]:
        """
        Get all initial family entries.

        :param limit: limit of entries
        :param offset: offset of entries
        :param info: GraphQL context
        :return: List of initial family entries
        """
        try:
            dao = FraiAssessmentDAO(info.context.db_connection)
            frai_assessment = await dao.get_all_frai_assessment(
                limit=limit,
                offset=offset,
            )
            return frai_assessment
        except Exception as e:
            print(f"Error fetching frai assessment: {e}")
            return []
