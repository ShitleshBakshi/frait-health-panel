from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String

from frait_health_backend.db.base import Base


class FratAssessmentModel(Base):
    """Model for family details information with reference to initial families."""

    __tablename__ = "frat_assessment"

    id: Mapped[int] = mapped_column(ForeignKey("initial_families.id"), primary_key=True)
    assessment_1: Mapped[str] = mapped_column(String(length=200))
    assessment_2: Mapped[str] = mapped_column(String(length=200))
    assessment_3: Mapped[str] = mapped_column(String(length=200))
    assessment_4: Mapped[str] = mapped_column(String(length=200))
    assessment_5: Mapped[str] = mapped_column(String(length=200))
    assessment_6: Mapped[str] = mapped_column(String(length=200))
    assessment_7: Mapped[str] = mapped_column(String(length=200))
    assessment_8: Mapped[str] = mapped_column(String(length=200))
    assessment_9: Mapped[str] = mapped_column(String(length=200))
    assessment_10: Mapped[str] = mapped_column(String(length=200))
    assessment_11: Mapped[str] = mapped_column(String(length=200))
    assessment_12: Mapped[str] = mapped_column(String(length=200))
    assessment_13: Mapped[str] = mapped_column(String(length=200))
    assessment_14: Mapped[str] = mapped_column(String(length=200))
    assessment_15: Mapped[str] = mapped_column(String(length=200))
    assessment_16: Mapped[str] = mapped_column(String(length=200))
    assessment_17: Mapped[str] = mapped_column(String(length=200))
    assessment_18: Mapped[str] = mapped_column(String(length=200))
    assessment_19: Mapped[str] = mapped_column(String(length=200))
    assessment_20: Mapped[str] = mapped_column(String(length=200))
    assessment_21: Mapped[str] = mapped_column(String(length=200))
    assessment_22: Mapped[str] = mapped_column(String(length=200))
    assessment_23: Mapped[str] = mapped_column(String(length=200))
    assessment_24: Mapped[str] = mapped_column(String(length=200))
    assessment_25: Mapped[str] = mapped_column(String(length=200))
    assessment_26: Mapped[str] = mapped_column(String(length=200))
    assessment_27: Mapped[str] = mapped_column(String(length=200))
    assessment_28: Mapped[str] = mapped_column(String(length=200))
    assessment_29: Mapped[str] = mapped_column(String(length=200))
    assessment_30: Mapped[str] = mapped_column(String(length=200))
    assessment_31: Mapped[str] = mapped_column(String(length=200))
    assessment_32: Mapped[str] = mapped_column(String(length=200))
    assessment_33: Mapped[str] = mapped_column(String(length=200))
    assessment_34: Mapped[str] = mapped_column(String(length=200))
    assessment_35: Mapped[str] = mapped_column(String(length=200))
    assessment_36: Mapped[str] = mapped_column(String(length=200))
