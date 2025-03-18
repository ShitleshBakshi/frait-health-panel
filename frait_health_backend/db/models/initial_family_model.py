from datetime import date
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String, Date

from frait_health_backend.db.base import Base


class InitialFamilyModel(Base):
    """Model for initial family information."""

    __tablename__ = "initial_families"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    family_name: Mapped[str] = mapped_column(String(length=200))
    child_dob: Mapped[date] = mapped_column(String(length=200))
    nhs_number: Mapped[str] = mapped_column(String(length=200))  # NHS numbers are 10 digits
