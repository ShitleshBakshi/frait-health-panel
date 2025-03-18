from enum import Enum

from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql.sqltypes import String

from frait_health_backend.db.base import Base


class UserRole(str, Enum):
    """Enum for user roles."""

    ADMIN = "Admin"
    MANAGER = "Manager"
    EMPLOYEE = "Employee"
    ASSISTANT = "Assistant to Employee"


class UserModel(Base):
    """Model for user."""

    __tablename__ = "user_model"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(length=200))
    email: Mapped[str] = mapped_column(String(length=200), unique=True, index=True)
    password: Mapped[str] = mapped_column(String(length=200))
    role: Mapped[UserRole] = mapped_column(String(length=200))
