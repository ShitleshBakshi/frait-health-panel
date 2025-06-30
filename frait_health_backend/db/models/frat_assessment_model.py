from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String

from frait_health_backend.db.base import Base


class FratAssessmentModel(Base):
    """Model for family details information with reference to initial families."""

    __tablename__ = "frat_assessment"

    id: Mapped[int] = mapped_column(ForeignKey("initial_families.id"), primary_key=True)
    assessmentid: Mapped[str] = mapped_column(String(length=200), primary_key=True)
    assessment_1: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_2: Mapped[str] = mapped_column(String(length=200))
    assessment_3: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_4: Mapped[str] = mapped_column(String(length=200))
    assessment_5: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_6: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_7: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_8: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_9: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_10: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_11: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_12: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_13: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_14: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_15: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_16: Mapped[str] = mapped_column(String(length=200))
    assessment_17: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_18: Mapped[str] = mapped_column(String(length=200))
    assessment_19: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_20: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_21: Mapped[str] = mapped_column(String(length=200))
    assessment_22: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_23: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_24: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_25: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_26: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_27: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_28: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_29: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_30: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_31: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_32: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_33: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_34: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_35: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
    assessment_36: Mapped[str | None] = mapped_column(String(length=200), nullable=True)
