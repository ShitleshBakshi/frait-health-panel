from typing import List, Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.frat_assessment_model import FratAssessmentModel


class FratAssessmentDAO:
    """Class for accessing frat_assessment table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_frat_assessment(
        self,
        id: int,
        assessment_1: str,
        assessment_2: str,
        assessment_3: str,
        assessment_4: str,
        assessment_5: str,
        assessment_6: str,
        assessment_7: str,
        assessment_8: str,
        assessment_9: str,
        assessment_10: str,
        assessment_11: str,
        assessment_12: str,
        assessment_13: str,
        assessment_14: str,
        assessment_15: str,
        assessment_16: str,
        assessment_17: str,
        assessment_18: str,
        assessment_19: str,
        assessment_20: str,
        assessment_21: str,
        assessment_22: str,
        assessment_23: str,
        assessment_24: str,
        assessment_25: str,
        assessment_26: str,
        assessment_27: str,
        assessment_28: str,
        assessment_29: str,
        assessment_30: str,
        assessment_31: str,
        assessment_32: str,
        assessment_33: str,
        assessment_34: str,
        assessment_35: str,
        assessment_36: str
         ) -> None:
        """
        Add single frat assessment details record to session.

        :param id: foreign key from initial_families
        :param assessment_1 to assessment_36 for assessment values
        """
        self.session.add(
            FratAssessmentModel(
                id=id,
                assessment_1=assessment_1,
                assessment_2=assessment_2,
                assessment_3=assessment_3,
                assessment_4=assessment_4,
                assessment_5=assessment_5,
                assessment_6=assessment_6,
                assessment_7=assessment_7,
                assessment_8=assessment_8,
                assessment_9=assessment_9,
                assessment_10=assessment_10,
                assessment_11=assessment_11,
                assessment_12=assessment_12,
                assessment_13=assessment_13,
                assessment_14=assessment_14,
                assessment_15=assessment_15,
                assessment_16=assessment_16,
                assessment_17=assessment_17,
                assessment_18=assessment_18,
                assessment_19=assessment_19,
                assessment_20=assessment_20,
                assessment_21=assessment_21,
                assessment_22=assessment_22,
                assessment_23=assessment_23,
                assessment_24=assessment_24,
                assessment_25=assessment_25,
                assessment_26=assessment_26,
                assessment_27=assessment_27,
                assessment_28=assessment_28,
                assessment_29=assessment_29,
                assessment_30=assessment_30,
                assessment_31=assessment_31,
                assessment_32=assessment_32,
                assessment_33=assessment_33,
                assessment_34=assessment_34,
                assessment_35=assessment_35,
                assessment_36=assessment_36

            ),
        )
        await self.session.flush()

    async def get_all_frat_assessment_details(self) -> List[FratAssessmentModel]:
        """
        Get all frat assessment.

        :return: list of frat assessment
        """
        raw_frat_assessment = await self.session.execute(
            select(FratAssessmentModel),
        )

        return list(raw_frat_assessment.scalars().fetchall())

    async def get_frat_assessment_details(self, family_id: int) -> Optional[FratAssessmentModel]:
        """
        Get specific family details.

        :param family_id: id of the family details entry
        :return: frat assessment for matching family id
        """
        raw_frat_assessment = await self.session.execute(
            select(FratAssessmentModel).where(FratAssessmentModel.id == family_id),
        )

        return raw_frat_assessment.scalars().first()
