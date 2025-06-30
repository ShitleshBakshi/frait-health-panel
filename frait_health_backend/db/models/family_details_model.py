from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql.sqltypes import Boolean, String, Integer

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
    main_parent_parental_responsibility: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )
    main_parent_information_provider: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
    )

    # Relationships to supporting parents and children
    supporting_parents = relationship("SupportingParentModel", back_populates="family_details", cascade="all, delete-orphan")
    children = relationship("ChildModel", back_populates="family_details", cascade="all, delete-orphan")

class SupportingParentModel(Base):
    """Model for supporting parents with reference to family details."""

    __tablename__ = "supporting_parents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_details.id", ondelete="CASCADE"), nullable=False)
    first_name: Mapped[str] = mapped_column(String(length=200), nullable=False)
    last_name: Mapped[str] = mapped_column(String(length=200), nullable=False)
    dob: Mapped[str] = mapped_column(String(length=200), nullable=False)
    gender: Mapped[str] = mapped_column(String(length=100), nullable=False, default="")
    relation_to_child: Mapped[str] = mapped_column(String(length=100), nullable=False, default="")
    education_level: Mapped[str] = mapped_column(String(length=200), nullable=False, default="")
    parental_responsibility: Mapped[bool] = mapped_column(Boolean, default=False)
    information_provider: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relationship to family details
    family_details = relationship("FamilyDetailsModel", back_populates="supporting_parents")

class ChildModel(Base):
    """Model for children with reference to family details."""

    __tablename__ = "children"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    family_id: Mapped[int] = mapped_column(ForeignKey("family_details.id"), nullable=False)
    first_name: Mapped[str] = mapped_column(String(length=200))
    last_name: Mapped[str] = mapped_column(String(length=200))
    gender: Mapped[str] = mapped_column(String(length=100))
    dob: Mapped[str] = mapped_column(String(length=200))
    support_parent: Mapped[bool] = mapped_column(Boolean, default=False)
    support_parent_first_name: Mapped[str] = mapped_column(String(length=200))
    support_parent_last_name: Mapped[str] = mapped_column(String(length=200))

    # Relationship to family details
    family_details = relationship("FamilyDetailsModel", back_populates="children")
