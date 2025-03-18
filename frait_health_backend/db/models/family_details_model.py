from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String, Boolean

from frait_health_backend.db.base import Base


class FamilyDetailsModel(Base):
    """Model for family details information with reference to initial families."""

    __tablename__ = "family_details"

    id: Mapped[int] = mapped_column(ForeignKey("initial_families.id"), primary_key=True)
    main_parent_first_name: Mapped[str] = mapped_column(String(length=200))
    main_parent_last_name: Mapped[str] = mapped_column(String(length=200))
    main_parent_dob: Mapped[str] = mapped_column(String(length=200))
    main_parent_gender: Mapped[str] = mapped_column(String(length=100))
    main_parent_relation_to_child: Mapped[str] = mapped_column(String(length=100))
    main_parent_education_level: Mapped[str] = mapped_column(String(length=200))
    main_parent_parental_responsibility: Mapped[bool] = mapped_column(Boolean, default=False)
    main_parent_information_provider: Mapped[bool] = mapped_column(Boolean, default=False)
    support_parent_first_name: Mapped[str] = mapped_column(String(length=200))
    support_parent_last_name: Mapped[str] = mapped_column(String(length=200))
    support_parent_dob: Mapped[str] = mapped_column(String(length=200))
    support_parent_gender: Mapped[str] = mapped_column(String(length=100))
    support_parent_relation_to_child: Mapped[str] = mapped_column(String(length=100))
    support_parent_education_level: Mapped[str] = mapped_column(String(length=200))
    support_parent_parental_responsibility: Mapped[bool] = mapped_column(Boolean, default=False)
    support_parent_information_provider: Mapped[bool] = mapped_column(Boolean, default=False)
    child_first_name: Mapped[str] = mapped_column(String(length=200))
    child_last_name: Mapped[str] = mapped_column(String(length=200))
    child_gender: Mapped[str] = mapped_column(String(length=100))
    child_dob: Mapped[str] = mapped_column(String(length=200))
    child_support_parent: Mapped[bool] = mapped_column(Boolean, default=False)
    child_support_parent_first_name: Mapped[str] = mapped_column(String(length=200))
    child_support_parent_last_name: Mapped[str] = mapped_column(String(length=200))
