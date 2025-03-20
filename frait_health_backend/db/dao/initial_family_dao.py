from typing import List

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.initial_family_model import InitialFamilyModel


class InitialFamilyDAO:
    """Class for accessing initial_family table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session

    async def create_initial_family(
        self,
        family_name: str,
        child_dob: str,
        nhs_number: str,
    ) -> None:
        """
        Add single initial family record to session.

        :param family_name: name of the family
        :param child_dob: date of birth of the child
        :param nhs_number: NHS number
        """
        self.session.add(
            InitialFamilyModel(
                family_name=family_name,
                child_dob=child_dob,
                nhs_number=nhs_number,
            ),
        )
        await self.session.flush()

    async def get_all_families(
        self,
        limit: int,
        offset: int,
    ) -> List[InitialFamilyModel]:
        """
        Get all initial family entries with limit/offset pagination.

        :param limit: limit of entries
        :param offset: offset of entries
        :return: stream of initial family entries
        """
        raw_families = await self.session.execute(
            select(InitialFamilyModel).limit(limit).offset(offset),
        )

        return list(raw_families.scalars().fetchall())
