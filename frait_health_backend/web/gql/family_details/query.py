"""Query resolvers for family details types."""

from typing import List, Optional

import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.family_details_dao import FamilyDetailsDAO
from frait_health_backend.web.gql.family_details.schema import (
    FamilyDetailsModelDTO,
    SupportingParentDTO,
    ChildDTO,
)


@strawberry.type
class Query:
    @strawberry.field
    async def get_family_details_models(
        self,
        limit: int = 100,
        offset: int = 0,
        info: Info = strawberry.UNSET,
    ) -> List[FamilyDetailsModelDTO]:
        """
        Resolver for getting all family details entries.

        :param limit: Maximum number of records to return
        :param offset: Number of records to skip
        :param info: GraphQL context
        :return: list of all family details
        """
        try:
            dao = FamilyDetailsDAO(session=info.context.db_session)
            family_details_models = await dao.get_all_family_details(
                limit=limit,
                offset=offset,
            )
            # Convert database models to DTOs
            result = []
            for model in family_details_models:
                supporting_parents = []
                if hasattr(model, 'supporting_parents') and model.supporting_parents:
                    supporting_parents = [
                        SupportingParentDTO(
                            id=sp.id,
                            first_name=sp.first_name,
                            last_name=sp.last_name,
                            dob=sp.dob,
                            gender=sp.gender,
                            relation_to_child=sp.relation_to_child,
                            education_level=sp.education_level,
                            parental_responsibility=sp.parental_responsibility,
                            information_provider=sp.information_provider,
                        )
                        for sp in model.supporting_parents
                    ]

                children = []
                if hasattr(model, 'children') and model.children:
                    children = [
                        ChildDTO(
                            id=child.id,
                            first_name=child.first_name,
                            last_name=child.last_name,
                            gender=child.gender,
                            dob=child.dob,
                            support_parent=child.support_parent,
                            support_parent_first_name=child.support_parent_first_name,
                            support_parent_last_name=child.support_parent_last_name,
                        )
                        for child in model.children
                    ]

                result.append(
                    FamilyDetailsModelDTO(
                        id=model.id,
                        main_parent_first_name=model.main_parent_first_name,
                        main_parent_last_name=model.main_parent_last_name,
                        main_parent_dob=model.main_parent_dob,
                        main_parent_gender=model.main_parent_gender,
                        main_parent_relation_to_child=model.main_parent_relation_to_child,
                        main_parent_education_level=model.main_parent_education_level,
                        main_parent_parental_responsibility=model.main_parent_parental_responsibility,
                        main_parent_information_provider=model.main_parent_information_provider,
                        supporting_parents=supporting_parents,
                        children=children,
                    )
                )

            return result
        except Exception as e:
            print(f"Error fetching family details: {e}")
            return []

    @strawberry.field
    async def get_family_details(
        self,
        family_id: int,
        info: Info = strawberry.UNSET,
    ) -> Optional[FamilyDetailsModelDTO]:
        """
        Get specific family details.

        :param family_id: id of the family details to fetch
        :param info: GraphQL context
        :return: family details with matching id
        """
        try:
            dao = FamilyDetailsDAO(session=info.context.db_session)
            model = await dao.get_family_details(family_id=family_id)
            if not model:
                return None

            # Initialize empty lists first
            supporting_parents = []
            children = []

            # Convert supporting parents to DTOs if they exist
            if hasattr(model, 'supporting_parents') and model.supporting_parents:
                supporting_parents = [
                    SupportingParentDTO(
                        id=sp.id,
                        first_name=sp.first_name,
                        last_name=sp.last_name,
                        dob=sp.dob,
                        gender=sp.gender,
                        relation_to_child=sp.relation_to_child,
                        education_level=sp.education_level,
                        parental_responsibility=sp.parental_responsibility,
                        information_provider=sp.information_provider,
                    )
                    for sp in model.supporting_parents
                ]

            # Convert children to DTOs if they exist
            if hasattr(model, 'children') and model.children:
                children = [
                    ChildDTO(
                        id=child.id,
                        first_name=child.first_name,
                        last_name=child.last_name,
                        gender=child.gender,
                        dob=child.dob,
                        support_parent=child.support_parent,
                        support_parent_first_name=child.support_parent_first_name,
                        support_parent_last_name=child.support_parent_last_name,
                    )
                    for child in model.children
                ]

            return FamilyDetailsModelDTO(
                id=model.id,
                main_parent_first_name=model.main_parent_first_name,
                main_parent_last_name=model.main_parent_last_name,
                main_parent_dob=model.main_parent_dob,
                main_parent_gender=model.main_parent_gender,
                main_parent_relation_to_child=model.main_parent_relation_to_child,
                main_parent_education_level=model.main_parent_education_level,
                main_parent_parental_responsibility=model.main_parent_parental_responsibility,
                main_parent_information_provider=model.main_parent_information_provider,
                supporting_parents=supporting_parents,
                children=children,
            )
        except Exception as e:
            print(f"Error fetching family details: {e}")
            return None
