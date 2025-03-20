import strawberry


@strawberry.type
class FraiAssessmentModelDTO:
    """Data transfer object for FraiAssessmentModel."""

    id: int
    responsive_parenting: str
    family_health: str
    family_engagement: str
    family_support: str
    socio_economic: str
    overall_score: str


@strawberry.input
class FraiAssessmentInput:
    """Input type for creating a new Frai assessment."""

    responsive_parenting: str
    family_health: str
    family_engagement: str
    family_support: str
    socio_economic: str
    overall_score: str
    """
    DTO for initial family models.

    It is returned when accessing initial family models from the API.
    """

    id: int
    responsive_parenting: str
    family_health: str
    family_engagement: str
    family_support: str
    socio_economic: str
    overall_score: str
