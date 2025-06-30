from typing import List, Optional

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.family_details_model import FamilyDetailsModel, SupportingParentModel, ChildModel
from sqlalchemy.orm import selectinload


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
        supporting_parents: List[dict],
        children: List[dict],
    ) -> None:
        """
        Add family details and related supporting parents and children to session.

        :param id: foreign key from initial_families
        :param main_parent_first_name: first name of main parent
        :param main_parent_last_name: last name of main parent
        :param main_parent_dob: date of birth of main parent
        :param main_parent_gender: gender of main parent
        :param main_parent_relation_to_child: relation to child
        :param main_parent_education_level: education level of main parent
        :param main_parent_parental_responsibility: whether main parent has parental responsibility
        :param main_parent_information_provider: whether main parent is information provider
        :param supporting_parents: list of supporting parents data
        :param children: list of children data
        """

        # Initialize empty lists if None was provided
        supporting_parents = supporting_parents or []

        # Check if family details already exist
        existing = await self.get_family_details(family_id=id)

        if existing:
            # Update main parent info
            existing.main_parent_first_name = main_parent_first_name
            existing.main_parent_last_name = main_parent_last_name
            existing.main_parent_dob = main_parent_dob
            existing.main_parent_gender = main_parent_gender
            existing.main_parent_relation_to_child = main_parent_relation_to_child
            existing.main_parent_education_level = main_parent_education_level
            existing.main_parent_parental_responsibility = main_parent_parental_responsibility
            existing.main_parent_information_provider = main_parent_information_provider

            # Clear existing supporting parents and children to replace with new ones
            existing.supporting_parents = []
            existing.children = []

            # Flush to ensure deletes are processed
            await self.session.flush()

            family_details = existing
        else:
            # Create new family details
            family_details = FamilyDetailsModel(
                id=id,
                main_parent_first_name=main_parent_first_name,
                main_parent_last_name=main_parent_last_name,
                main_parent_dob=main_parent_dob,
                main_parent_gender=main_parent_gender,
                main_parent_relation_to_child=main_parent_relation_to_child,
                main_parent_education_level=main_parent_education_level,
                main_parent_parental_responsibility=main_parent_parental_responsibility,
                main_parent_information_provider=main_parent_information_provider,
            )
            self.session.add(family_details)
            await self.session.flush()  # Flush to get the ID

        # Add supporting parents
        for sp_data in supporting_parents:
            supporting_parent = SupportingParentModel(
                family_id=family_details.id,
                first_name=sp_data["first_name"],
                last_name=sp_data["last_name"],
                dob=sp_data["dob"],
                gender=sp_data["gender"],
                relation_to_child=sp_data["relation_to_child"],
                education_level=sp_data["education_level"],
                parental_responsibility=sp_data["parental_responsibility"],
                information_provider=sp_data["information_provider"],
            )
            self.session.add(supporting_parent)

        # Add children
        for child_data in children:
            child = ChildModel(
                family_id=family_details.id,
                first_name=child_data["first_name"],
                last_name=child_data["last_name"],
                gender=child_data["gender"],
                dob=child_data["dob"],
                support_parent=child_data["support_parent"],
                support_parent_first_name=child_data["support_parent_first_name"],
                support_parent_last_name=child_data["support_parent_last_name"],
            )
            self.session.add(child)

        await self.session.flush()

    async def get_all_family_details(self, limit: int = 100, offset: int = 0) -> List[FamilyDetailsModel]:
        """
        Get all family details with their related supporting parents and children.

        :param limit: Maximum number of records to return
        :param offset: Number of records to skip
        :return: List of family details with supporting parents and children
        """

        query = (
            select(FamilyDetailsModel)
            .options(
                selectinload(FamilyDetailsModel.supporting_parents),
                selectinload(FamilyDetailsModel.children)
            )
            .limit(limit)
            .offset(offset)
        )

        raw_family_details = await self.session.execute(query)

        return list(raw_family_details.scalars().unique().all())

    async def get_family_details(self, family_id: int) -> Optional[FamilyDetailsModel]:
        """
        Get specific family details with supporting parents and children.

        :param family_id: ID of the family details entry
        :return: Family details with matching ID including supporting parents and children
        """
        query = (
            select(FamilyDetailsModel)
            .options(
                selectinload(FamilyDetailsModel.supporting_parents),
                selectinload(FamilyDetailsModel.children)
            )
            .where(FamilyDetailsModel.id == family_id)
        )

        raw_family_details = await self.session.execute(query)
        return raw_family_details.scalars().first()
