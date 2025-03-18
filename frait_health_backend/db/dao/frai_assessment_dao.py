from typing import List, Optional
from datetime import date

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
        responsive_parenting: str,
        family_health: str,
        family_engagement: str,
        family_support: str,
        socio_economic: str,
        overall_score: str,
    ) -> None:
        """
        Add single frai assessment record to session.

        :param frai assessment values: name of the frai assessment values
        """
        self.session.add(
            FraiAssessmentModel(
                responsive_parenting=responsive_parenting,
                family_health=family_health,
                family_engagement=family_engagement,
                family_support=family_support,
                socio_economic=socio_economic,
                overall_score=overall_score,
            ),
        )
        await self.session.flush()

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
