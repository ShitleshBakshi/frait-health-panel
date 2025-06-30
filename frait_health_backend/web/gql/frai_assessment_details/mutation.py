import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.frai_assessment_dao import FraiAssessmentDAO

from .schema import FraiAssessmentInput, FraiAssessmentModelDTO


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_initial_frai_assessment(
        self,
        frai_input: FraiAssessmentInput,
        info: Info,
    ) -> FraiAssessmentModelDTO:
        """
        Create initial family record.

        :param input: Input data for creating family
        :param info: GraphQL context
        :return: True if the record was created
        """
        dao = FraiAssessmentDAO(info.context.db_connection)
        assessment = await dao.create_frai_assessment(
            id=frai_input.id,
            assessmentid=frai_input.assessmentid,
            responsive_parenting=frai_input.responsive_parenting,
            family_health=frai_input.family_health,
            family_engagement=frai_input.family_engagement,
            family_support=frai_input.family_support,
            socio_economic=frai_input.socio_economic,
            overall_score=frai_input.overall_score,
        )
        return FraiAssessmentModelDTO(
            id=assessment.id,
            assessmentid=assessment.assessmentid,
            responsive_parenting=assessment.responsive_parenting,
            family_health=assessment.family_health,
            family_engagement=assessment.family_engagement,
            family_support=assessment.family_support,
            socio_economic=assessment.socio_economic,
            overall_score=assessment.overall_score,
        )
