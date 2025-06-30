from enum import Enum
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String, JSON, Text

from frait_health_backend.db.base import Base


class UserRole(str, Enum):
    """Enum for user roles."""

    ADMIN = "Admin"
    MANAGER = "Manager"
    HEALTH_VISITOR = "Health Visitor"
    ASSISTANT_HEALTH_VISITOR = "Assistant Health Visitor"


class UserModel(Base):
    """Model for user."""

    __tablename__ = "user_model"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(length=200))
    email: Mapped[str] = mapped_column(String(length=200), unique=True, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(length=200), unique=True, nullable=True)
    role: Mapped[UserRole] = mapped_column(String(length=200))
    
    # Azure AD specific fields
    external_id: Mapped[Optional[str]] = mapped_column(String(length=200), nullable=True, index=True)
    identity_provider: Mapped[Optional[str]] = mapped_column(String(length=50), nullable=True)
    sso_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)


