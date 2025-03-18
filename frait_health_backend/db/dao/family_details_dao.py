from typing import List, Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.family_details_model import FamilyDetailsModel


class FamilyDetailsDAO:
    """Class for accessing family_details table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_family_details(
        self,
        id: int,
        main_parent_first_name: str,
        main_parent_last_name: str,
        main_parent_dob: str,
        main_parent_gender: str,
        main_parent_relation_to_child: str,
        main_parent_education_level: str,
        main_parent_parental_responsibility: bool,
        main_parent_information_provider: bool,
        support_parent_first_name: str,
        support_parent_last_name: str,
        support_parent_dob: str,
        support_parent_gender: str,
        support_parent_relation_to_child: str,
        support_parent_education_level: str,
        support_parent_parental_responsibility: bool,
        support_parent_information_provider: bool,
        child_first_name: str,
        child_last_name: str,
        child_gender: str,
        child_dob: str,
        child_support_parent: bool,
        child_support_parent_first_name: str,
        child_support_parent_last_name: str

    ) -> None:
        """
        Add single family details record to session.

        :param id: foreign key from initial_families
        :param main_parent_first_name: first name of main parent
        :param main_parent_last_name: last name of main parent
        :param main_parent_dob: date of birth of main parent
        :param main_parent_gender: gender of main parent
        :param main_parent_relation_to_child: relation to child
        :param main_parent_education_level: education level of main parent
        :param main_parent_parental_responsibility: whether main parent has parental responsibility
        """
        self.session.add(
            FamilyDetailsModel(
                id=id,
                main_parent_first_name=main_parent_first_name,
                main_parent_last_name=main_parent_last_name,
                main_parent_dob=main_parent_dob,
                main_parent_gender=main_parent_gender,
                main_parent_relation_to_child=main_parent_relation_to_child,
                main_parent_education_level=main_parent_education_level,
                main_parent_parental_responsibility=main_parent_parental_responsibility,
                main_parent_information_provider=main_parent_information_provider,
                support_parent_first_name=support_parent_first_name,
                support_parent_last_name=support_parent_last_name,
                support_parent_dob=support_parent_dob,
                support_parent_gender=support_parent_gender,
                support_parent_relation_to_child=support_parent_relation_to_child,
                support_parent_education_level=support_parent_education_level,
                support_parent_parental_responsibility=support_parent_parental_responsibility,
                support_parent_information_provider=support_parent_information_provider,
                child_first_name=child_first_name,
                child_last_name=child_last_name,
                child_gender=child_gender,
                child_dob=child_dob,
                child_support_parent=child_support_parent,
                child_support_parent_first_name=child_support_parent_first_name,
                child_support_parent_last_name=child_support_parent_last_name
            ),
        )
        await self.session.flush()

    async def get_all_family_details(self) -> List[FamilyDetailsModel]:
        """
        Get all family details.

        :return: list of family details
        """
        raw_family_details = await self.session.execute(
            select(FamilyDetailsModel),
        )

        return list(raw_family_details.scalars().fetchall())

    async def get_family_details(self, family_id: int) -> Optional[FamilyDetailsModel]:
        """
        Get specific family details.

        :param family_id: id of the family details entry
        :return: family details with matching id
        """
        raw_family_details = await self.session.execute(
            select(FamilyDetailsModel).where(FamilyDetailsModel.id == family_id),
        )

        return raw_family_details.scalars().first()
