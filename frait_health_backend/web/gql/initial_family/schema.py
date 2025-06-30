import strawberry


@strawberry.type
class InitialFamilyModelDTO:
    """Data transfer object for InitialFamilyModel."""

    id: int
    family_name: str
    child_dob: str
    nhs_number: str


@strawberry.input
class InitialFamilyInput:
    """Input type for creating an initial family."""

    family_name: str
    child_dob: str
    nhs_number: str
    """
    DTO for initial family models.

    It is returned when accessing initial family models from the API.
    """

    id: int
    family_name: str
    child_dob: str
    nhs_number: str
