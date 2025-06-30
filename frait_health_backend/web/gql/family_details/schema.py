import strawberry
from typing import List, Optional


@strawberry.type
class SupportingParentDTO:
    """DTO for supporting parent model."""

    id: int
    first_name: str
    last_name: str
    dob: str
    gender: str
    relation_to_child: str
    education_level: str
    parental_responsibility: bool
    information_provider: bool




@strawberry.type
class ChildDTO:
    """DTO for child model."""

    id: int
    first_name: str
    last_name: str
    gender: str
    dob: str
    support_parent: bool
    support_parent_first_name: str
    support_parent_last_name: str

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
    supporting_parents: List[SupportingParentDTO]
    children: List[ChildDTO]


@strawberry.input
class SupportingParentInput:
    """Input for supporting parent creation."""

    first_name: str
    last_name: str
    dob: str
    gender: str
    relation_to_child: str
    education_level: str
    parental_responsibility: bool
    information_provider: bool


@strawberry.input
class ChildInput:
    """Input for child creation."""

    first_name: str
    last_name: str
    gender: str
    dob: str
    support_parent: bool
    support_parent_first_name: str
    support_parent_last_name: str


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
    supporting_parents: List[SupportingParentInput] = strawberry.field(default_factory=list)
    children: List[ChildInput] = strawberry.field(default_factory=list)
