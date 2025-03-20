
import strawberry


@strawberry.type
class FamilyDetailsModelDTO:
    """DTO for family details model."""

    id: int
    main_parent_first_name: str
    main_parent_last_name: str
    main_parent_dob: str
    main_parent_gender: str
    main_parent_relation_to_child: str
    main_parent_education_level: str
    main_parent_parental_responsibility: bool
    main_parent_information_provider: bool
    support_parent_first_name: str
    support_parent_last_name: str
    support_parent_dob: str
    support_parent_gender: str
    support_parent_relation_to_child: str
    support_parent_education_level: str
    support_parent_parental_responsibility: bool
    support_parent_information_provider: bool
    child_first_name: str
    child_last_name: str
    child_gender: str
    child_dob: str
    child_support_parent: bool
    child_support_parent_first_name: str
    child_support_parent_last_name: str


@strawberry.input
class FamilyDetailsInput:
    """Input for family details creation."""

    id: int
    main_parent_first_name: str
    main_parent_last_name: str
    main_parent_dob: str
    main_parent_gender: str
    main_parent_relation_to_child: str
    main_parent_education_level: str
    main_parent_parental_responsibility: bool
    main_parent_information_provider: bool
    support_parent_first_name: str
    support_parent_last_name: str
    support_parent_dob: str
    support_parent_gender: str
    support_parent_relation_to_child: str
    support_parent_education_level: str
    support_parent_parental_responsibility: bool
    support_parent_information_provider: bool
    child_first_name: str
    child_last_name: str
    child_gender: str
    child_dob: str
    child_support_parent: bool
    child_support_parent_first_name: str
    child_support_parent_last_name: str
