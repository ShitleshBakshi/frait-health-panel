from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String

from frait_health_backend.db.base import Base


class FraiAssessmentModel(Base):
    """Model for family details information with reference to initial families."""

    __tablename__ = "frai_assessment"

    id: Mapped[int] = mapped_column(ForeignKey("initial_families.id"), primary_key=True)
    assessmentid: Mapped[str] = mapped_column(String(length=200), primary_key=True)
    responsive_parenting: Mapped[str] = mapped_column(String(length=200))
    family_health: Mapped[str] = mapped_column(String(length=200))
    family_engagement: Mapped[str] = mapped_column(String(length=200))
    family_support: Mapped[str] = mapped_column(String(length=200))
    socio_economic: Mapped[str] = mapped_column(String(length=200))
    overall_score: Mapped[str] = mapped_column(String(length=200))
