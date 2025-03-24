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
            dao = FraiAssessmentDAO(session=info.context.db_connection)
            frai_assessment = await dao.get_all_frai_assessment(
                limit=limit,
                offset=offset,
            )
            return frai_assessment
        except Exception as e:
            print(f"Error fetching frai assessment: {e}")
            return []

    @strawberry.field
    async def get_frai_assessment_details(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> FraiAssessmentModelDTO:
        """
        Get specific frai assessment.

        :param context: GraphQL context
        :param family_id: id of the frai assessment to fetch
        :return: frai assessment with matching id
        """
        try:
            dao = FraiAssessmentDAO(session=info.context.db_session)
            frai_assessment_details = await dao.get_frai_assessment_details(
                family_id=family_id,
            )
            return frai_assessment_details
        except Exception as e:
            print(f"Error fetching frai assessment: {e}")
            return []

    @strawberry.field
    async def get_frai_assessments_by_family(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> List[FraiAssessmentModelDTO]:
        """
        Get all assessments for a specific family.

        :param family_id: id of the family to fetch assessments for
        :param info: GraphQL context
        :return: list of frai assessments for matching family id
        """
        try:
            dao = FraiAssessmentDAO(session=info.context.db_session)
            frai_assessments = await dao.get_frai_assessments_by_family(
                family_id=family_id,
            )
            return frai_assessments
        except Exception as e:
            print(f"Error fetching frai assessments: {e}")
            return []

    @strawberry.field
    async def get_specific_frai_assessment(
        self,
        family_id: int,
        assessment_id: str,
        info: Info = strawberry.UNSET,
    ) -> FraiAssessmentModelDTO:
        """
        Get a specific assessment by family id and assessment id.

        :param family_id: id of the family
        :param assessment_id: id of the assessment
        :param info: GraphQL context
        :return: frai assessment for matching family id and assessment id
        """
        try:
            dao = FraiAssessmentDAO(session=info.context.db_session)
            frai_assessment = await dao.get_specific_frai_assessment(
                family_id=family_id,
                assessment_id=assessment_id,
            )
            return frai_assessment
        except Exception as e:
            print(f"Error fetching specific frai assessment: {e}")
            return None
