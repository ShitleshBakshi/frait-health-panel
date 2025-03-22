import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.family_details_dao import FamilyDetailsDAO
from frait_health_backend.web.gql.family_details.schema import (
    FamilyDetailsInput,
    SupportingParentInput,
    ChildInput,
)


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_family_details(
        self,
        family_details_input: FamilyDetailsInput,
        info: Info,
    ) -> bool:
        """
        Create a new family details entry with supporting parents and children.

        :param family_details_input: input model for family details
        :param info: GraphQL context
        """
        dao = FamilyDetailsDAO(session=info.context.db_connection)

        # Extract supporting parents data
        supporting_parents = [
            {
                "first_name": sp.first_name,
                "last_name": sp.last_name,
                "dob": sp.dob,
                "gender": sp.gender,
                "relation_to_child": sp.relation_to_child,
                "education_level": sp.education_level,
                "parental_responsibility": sp.parental_responsibility,
                "information_provider": sp.information_provider,
            }
            for sp in family_details_input.supporting_parents
        ] if family_details_input.supporting_parents else []

        # Extract children data
        children = [
            {
                "first_name": child.first_name,
                "last_name": child.last_name,
                "gender": child.gender,
                "dob": child.dob,
                "support_parent": child.support_parent,
                "support_parent_first_name": child.support_parent_first_name,
                "support_parent_last_name": child.support_parent_last_name,
            }
            for child in family_details_input.children
        ] if family_details_input.children else []

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
            supporting_parents=supporting_parents,
            children=children,
        )
        return True
