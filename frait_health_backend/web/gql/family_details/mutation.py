
import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.family_details_dao import FamilyDetailsDAO
from frait_health_backend.web.gql.family_details.schema import (
    FamilyDetailsInput,
)


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_family_details(
        self, family_details_input: FamilyDetailsInput, info: Info,
    ) -> bool:
        """
        Create a new family details entry.

        :param family_details_input: input model for family details
        :param context: GraphQL context
        """
        dao = FamilyDetailsDAO(session=info.context.db_connection)
        await dao.create_family_details(
            id=family_details_input.id,
            main_parent_first_name=family_details_input.main_parent_first_name,
            main_parent_last_name=family_details_input.main_parent_last_name,
            main_parent_dob=family_details_input.main_parent_dob,
            main_parent_gender=family_details_input.main_parent_gender,
            main_parent_relation_to_child=family_details_input.main_parent_relation_to_child,
            main_parent_education_level=family_details_input.main_parent_education_level,
            main_parent_parental_responsibility=family_details_input.main_parent_parental_responsibility,
            main_parent_information_provider=family_details_input.main_parent_information_provider,
            support_parent_first_name=family_details_input.support_parent_first_name,
            support_parent_last_name=family_details_input.support_parent_last_name,
            support_parent_dob=family_details_input.support_parent_dob,
            support_parent_gender=family_details_input.support_parent_gender,
            support_parent_relation_to_child=family_details_input.support_parent_relation_to_child,
            support_parent_education_level=family_details_input.support_parent_education_level,
            support_parent_parental_responsibility=family_details_input.support_parent_parental_responsibility,
            support_parent_information_provider=family_details_input.support_parent_information_provider,
            child_first_name=family_details_input.child_first_name,
            child_last_name=family_details_input.child_last_name,
            child_gender=family_details_input.child_gender,
            child_dob=family_details_input.child_dob,
            child_support_parent=family_details_input.child_support_parent,
            child_support_parent_first_name=family_details_input.child_support_parent_first_name,
            child_support_parent_last_name=family_details_input.child_support_parent_last_name,
        )
        return True
