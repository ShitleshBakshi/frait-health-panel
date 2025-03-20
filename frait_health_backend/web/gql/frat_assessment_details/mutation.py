
import strawberry
from strawberry.types import Info

from frait_health_backend.db.dao.frat_assessment_dao import FratAssessmentDAO
from frait_health_backend.web.gql.frat_assessment_details.schema import (
    FratAssessmentInput,
)


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_frat_assessment(
        self, frat_assessment_input: FratAssessmentInput, info: Info,
    ) -> bool:
        """
        Create a new family details entry.

        :param frat_assessment_input: input model for frat assessment
        :param context: GraphQL context
        """
        dao = FratAssessmentDAO(info.context.db_connection)
        await dao.create_frat_assessment(
            id=frat_assessment_input.id,
            assessmentid=frat_assessment_input.assessmentid,
            assessment_1=frat_assessment_input.assessment_1,
            assessment_2=frat_assessment_input.assessment_2,
            assessment_3=frat_assessment_input.assessment_3,
            assessment_4=frat_assessment_input.assessment_4,
            assessment_5=frat_assessment_input.assessment_5,
            assessment_6=frat_assessment_input.assessment_6,
            assessment_7=frat_assessment_input.assessment_7,
            assessment_8=frat_assessment_input.assessment_8,
            assessment_9=frat_assessment_input.assessment_9,
            assessment_10=frat_assessment_input.assessment_10,
            assessment_11=frat_assessment_input.assessment_11,
            assessment_12=frat_assessment_input.assessment_12,
            assessment_13=frat_assessment_input.assessment_13,
            assessment_14=frat_assessment_input.assessment_14,
            assessment_15=frat_assessment_input.assessment_15,
            assessment_16=frat_assessment_input.assessment_16,
            assessment_17=frat_assessment_input.assessment_17,
            assessment_18=frat_assessment_input.assessment_18,
            assessment_19=frat_assessment_input.assessment_19,
            assessment_20=frat_assessment_input.assessment_20,
            assessment_21=frat_assessment_input.assessment_21,
            assessment_22=frat_assessment_input.assessment_22,
            assessment_23=frat_assessment_input.assessment_23,
            assessment_24=frat_assessment_input.assessment_24,
            assessment_25=frat_assessment_input.assessment_25,
            assessment_26=frat_assessment_input.assessment_26,
            assessment_27=frat_assessment_input.assessment_27,
            assessment_28=frat_assessment_input.assessment_28,
            assessment_29=frat_assessment_input.assessment_29,
            assessment_30=frat_assessment_input.assessment_30,
            assessment_31=frat_assessment_input.assessment_31,
            assessment_32=frat_assessment_input.assessment_32,
            assessment_33=frat_assessment_input.assessment_33,
            assessment_34=frat_assessment_input.assessment_34,
            assessment_35=frat_assessment_input.assessment_35,
            assessment_36=frat_assessment_input.assessment_36,
        )
        return True
