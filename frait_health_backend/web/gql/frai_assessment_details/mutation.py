from datetime import date
import strawberry
from typing import Optional

from frait_health_backend.db.dao.frai_assessment_dao import FraiAssessmentDAO
from strawberry.types import Info
from .schema import FraiAssessmentInput


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_initial_frai_assessment(
        self,
        frai_input: FraiAssessmentInput,
        info: Info
    ) -> bool:
        """
        Create initial family record.

        :param input: Input data for creating family
        :param info: GraphQL context
        :return: True if the record was created
        """
        dao = FraiAssessmentDAO(info.context.db_connection)
        await dao.create_frai_assessment(
            responsive_parenting=frai_input.responsive_parenting,
            family_health=frai_input.family_health,
            family_engagement=frai_input.family_engagement,
            family_support=frai_input.family_support,
            socio_economic=frai_input.socio_economic,
            overall_score=frai_input.overall_score,
        )
        return True
