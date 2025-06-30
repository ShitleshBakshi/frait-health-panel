from typing import List, Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.frai_assessment_model import FraiAssessmentModel


class FraiAssessmentDAO:
    """Class for accessing Frai Assessment table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_frai_assessment(
        self,
        id: int,
        assessmentid: str,
        responsive_parenting: str,
        family_health: str,
        family_engagement: str,
        family_support: str,
        socio_economic: str,
        overall_score: str,
    ) -> FraiAssessmentModel:
        """
        Add single frai assessment record to session.

        :param frai assessment values: name of the frai assessment values
        """
        assessment = FraiAssessmentModel(
            id=id,
            assessmentid=assessmentid,
            responsive_parenting=responsive_parenting,
            family_health=family_health,
            family_engagement=family_engagement,
            family_support=family_support,
            socio_economic=socio_economic,
            overall_score=overall_score,
        )
        self.session.add(assessment)
        await self.session.flush()
        return assessment

    async def get_all_frai_assessment(
        self,
        limit: int,
        offset: int,
    ) -> List[FraiAssessmentModel]:
        """
        Get all initial family entries with limit/offset pagination.

        :param limit: limit of entries
        :param offset: offset of entries
        :return: stream of initial family entries
        """
        raw_frai_assessment = await self.session.execute(
            select(FraiAssessmentModel).limit(limit).offset(offset),
        )

        return list(raw_frai_assessment.scalars().fetchall())

    async def get_frai_assessment_details(
        self,
        family_id: int,
    ) -> Optional[FraiAssessmentModel]:
        """
        Get specific family details.

        :param family_id: id of the family details entry
        :return: frat assessment for matching family id
        """
        raw_frai_assessment = await self.session.execute(
            select(FraiAssessmentModel).where(FraiAssessmentModel.id == family_id),
        )

        return raw_frai_assessment.scalars().first()

    async def get_frai_assessments_by_family(
        self,
        family_id: int,
    ) -> List[FraiAssessmentModel]:
        """
        Get all assessments for a specific family.

        :param family_id: id of the family
        :return: list of frat assessments for matching family id
        """
        raw_frai_assessments = await self.session.execute(
            select(FraiAssessmentModel).where(FraiAssessmentModel.id == family_id),
        )

        return list(raw_frai_assessments.scalars().fetchall())

    async def get_specific_frai_assessment(
        self,
        family_id: int,
        assessment_id: str,
    ) -> Optional[FraiAssessmentModel]:
        """
        Get a specific assessment by family id and assessment id.

        :param family_id: id of the family
        :param assessment_id: id of the assessment
        :return: frat assessment for matching family id and assessment id
        """
        raw_frai_assessment = await self.session.execute(
            select(FraiAssessmentModel).where(
                FraiAssessmentModel.id == family_id,
                FraiAssessmentModel.assessmentid == assessment_id,
            ),
        )

        return raw_frai_assessment.scalars().first()
