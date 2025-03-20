
import strawberry


@strawberry.type
class FratAssessmentDTO:
    """DTO for frat assessment model."""

    id: int
    assessmentid: str
    assessment_1: str | None
    assessment_2: str
    assessment_3: str | None
    assessment_4: str
    assessment_5: str | None
    assessment_6: str | None
    assessment_7: str | None
    assessment_8: str | None
    assessment_9: str | None
    assessment_10: str | None
    assessment_11: str | None
    assessment_12: str | None
    assessment_13: str | None
    assessment_14: str | None
    assessment_15: str | None
    assessment_16: str
    assessment_17: str | None
    assessment_18: str
    assessment_19: str | None
    assessment_20: str | None
    assessment_21: str
    assessment_22: str | None
    assessment_23: str | None
    assessment_24: str | None
    assessment_25: str | None
    assessment_26: str | None
    assessment_27: str | None
    assessment_28: str | None
    assessment_29: str | None
    assessment_30: str | None
    assessment_31: str | None
    assessment_32: str | None
    assessment_33: str | None
    assessment_34: str | None
    assessment_35: str | None
    assessment_36: str | None


@strawberry.input
class FratAssessmentInput:
    """Input for frat assessment creation."""

    id: int
    assessmentid: str
    assessment_1: str | None = None
    assessment_2: str
    assessment_3: str | None = None
    assessment_4: str
    assessment_5: str | None = None
    assessment_6: str | None = None
    assessment_7: str | None = None
    assessment_8: str | None = None
    assessment_9: str | None = None
    assessment_10: str | None = None
    assessment_11: str | None = None
    assessment_12: str | None = None
    assessment_13: str | None = None
    assessment_14: str | None = None
    assessment_15: str | None = None
    assessment_16: str
    assessment_17: str | None = None
    assessment_18: str
    assessment_19: str | None = None
    assessment_20: str | None = None
    assessment_21: str
    assessment_22: str | None = None
    assessment_23: str | None = None
    assessment_24: str | None = None
    assessment_25: str | None = None
    assessment_26: str | None = None
    assessment_27: str | None = None
    assessment_28: str | None = None
    assessment_29: str | None = None
    assessment_30: str | None = None
    assessment_31: str | None = None
    assessment_32: str | None = None
    assessment_33: str | None = None
    assessment_34: str | None = None
    assessment_35: str | None = None
    assessment_36: str | None = None
