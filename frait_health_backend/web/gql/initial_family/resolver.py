"""GraphQL resolvers for initial family module."""
from datetime import date
from typing import List

from strawberry.types import Info

from frait_health_backend.db.dao.initial_family_dao import InitialFamilyDAO
from .schema import InitialFamilyModelDTO, InitialFamilyInput


async def resolve_create_initial_family(
    family_input: InitialFamilyInput,
    info: Info,
) -> bool:
    """
    Resolver for creating an initial family.

    :param family_input: Input data for creating family
    :param info: GraphQL context
    :return: True if successful
    """
    dao = InitialFamilyDAO(info.context.db_connection)
    await dao.create_initial_family(
        family_name=family_input.family_name,
        child_dob=family_input.child_dob,
        nhs_number=family_input.nhs_number,
    )
    return True


async def resolve_get_initial_families(
    limit: int,
    offset: int,
    info: Info,
) -> List[InitialFamilyModelDTO]:
    """
    Resolver for getting all initial families.

    :param limit: Maximum number of records to return
    :param offset: Number of records to skip
    :param info: GraphQL context
    :return: List of initial family records
    """
    dao = InitialFamilyDAO(info.context.db_session)
    return await dao.get_all_families(limit=limit, offset=offset)
