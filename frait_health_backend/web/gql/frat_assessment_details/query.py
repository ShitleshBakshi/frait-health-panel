"""Query resolvers for frat assessment types."""

from typing import List

#  amazonq-ignore-next-line
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
                limit=limit,
                offset=offset,
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

    @strawberry.field
    async def get_frat_assessments_by_family(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> List[FratAssessmentDTO]:
        """
        Get all assessments for a specific family.

        :param family_id: id of the family to fetch assessments for
        :param info: GraphQL context
        :return: list of frat assessments for matching family id
        """
        try:
            dao = FratAssessmentDAO(session=info.context.db_session)
            frat_assessments = await dao.get_frat_assessments_by_family(
                family_id=family_id,
            )
            return frat_assessments
        except Exception as e:
            print(f"Error fetching frat assessments: {e}")
            return []

    @strawberry.field
    async def get_specific_frat_assessment(
        self,
        family_id: int,
        assessment_id: str,
        info: Info = strawberry.UNSET,
    ) -> FratAssessmentDTO:
        """
        Get a specific assessment by family id and assessment id.

        :param family_id: id of the family
        :param assessment_id: id of the assessment
        :param info: GraphQL context
        :return: frat assessment for matching family id and assessment id
        """
        try:
            dao = FratAssessmentDAO(session=info.context.db_session)
            frat_assessment = await dao.get_specific_frat_assessment(
                family_id=family_id,
                assessment_id=assessment_id,
            )
            return frat_assessment
        except Exception as e:
            print(f"Error fetching specific frat assessment: {e}")
            return None
