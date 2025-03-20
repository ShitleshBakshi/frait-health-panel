"""Query resolvers for frat assessment types."""

from typing import List

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.frat_assessment_dao import FratAssessmentDAO
from frait_health_backend.web.gql.frat_assessment_details.schema import (
    FratAssessmentDTO,
)


@strawberry.type
class Query:
    @strawberry.field
    async def get_frat_assessment_models(
        self,
        limit: int = 100,
        offset: int = 0,
        info: Info = strawberry.UNSET,
    ) -> List[FratAssessmentDTO]:
        """
        Resolver for getting all frat assessment details entries.

        :param context: GraphQL context
        :return: list of all frat assessment
        """
        try:
            dao = FratAssessmentDAO(session=info.context.db_session)
            frat_assessment_models = await dao.get_all_frat_assessment_details(
                limit=limit, offset=offset,
            )
            return frat_assessment_models
        except Exception as e:
            print(f"Error fetching frat assessment: {e}")
            return []

    @strawberry.field
    async def get_frat_assessment_details(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> FratAssessmentDTO:
        """
        Get specific frat assessment.

        :param context: GraphQL context
        :param family_id: id of the frat assessment to fetch
        :return: frat assessment with matching id
        """
        try:
            dao = FratAssessmentDAO(session=info.context.db_session)
            frat_assessment_details = await dao.get_frat_assessment_details(
                family_id=family_id,
            )
            return frat_assessment_details
        except Exception as e:
            print(f"Error fetching frat assessment: {e}")
            return []
