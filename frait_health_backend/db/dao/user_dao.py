from typing import List, Optional

import bcrypt
from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from frait_health_backend.db.dependencies import get_db_session
from frait_health_backend.db.models.user_model import UserModel, UserRole


class UserDAO:
    """Class for accessing user table."""

    def __init__(self, session: AsyncSession = Depends(get_db_session)) -> None:
        self.session = session


    async def create_user(
        self,
        name: str,
        email: str,
        external_id: str,
        role: UserRole,
        identity_provider: str,
        sso_metadata: Optional[dict] = None,
    ) -> UserModel:
        """
        Add single user to session.

        :param name: name of the user
        :param email: email of the user
        :param password: password of the user (will be hashed)
        :param role: role of the user
        :return: created user model
        """
        # hashed_password = self._hash_password(password)
        user = UserModel(
            name=name,
            email=email,
            role=role,
            external_id=external_id,
            identity_provider=identity_provider,
            sso_metadata=sso_metadata,
        )
        self.session.add(user)
        await self.session.flush()
        return user


    # Alias for create_user to maintain API compatibility
    async def create_sso_user(
        self,
        external_id: str,
        email: str,
        name: str,
        role: UserRole,
        identity_provider: str,
        sso_metadata: Optional[dict] = None,
    ) -> UserModel:
        """Create user via SSO authentication."""
        return await self.create_user(
            name=name,
            email=email,
            external_id=external_id,
            role=role,
            identity_provider=identity_provider,
            sso_metadata=sso_metadata,
        )

    async def get_all_users(self, limit: int, offset: int) -> List[UserModel]:
        """
        Get all user models with limit/offset pagination.

        :param limit: limit of users
        :param offset: offset of users
        :return: stream of users
        """
        raw_users = await self.session.execute(
            select(UserModel).limit(limit).offset(offset),
        )
        return list(raw_users.scalars().fetchall())

    # async def authenticate_user(self, email: str, password: str) -> Optional[UserModel]:
    #     """
    #     Authenticate user by email and password.
    #
    #     :param email: email of the user
    #     :param password: password of the user
    #     :return: user model if authentication is successful, None otherwise
    #     """
    #     query = select(UserModel).where(UserModel.email == email)
    #     result = await self.session.execute(query)
    #     user = result.scalars().first()
    #
    #     if user is None:
    #         return None
    #
    #     if self._verify_password(password, user.password):
    #         return user
    #
    #     return None

    async def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
        """Get user by ID."""
        query = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def filter(
        self,
        id: Optional[int] = None,
        email: Optional[str] = None,
        name: Optional[str] = None,
        role: Optional[UserRole] = None,
    ) -> List[UserModel]:
        """
        Get specific user models.

        :param id: id of user instance
        :param email: email of user instance
        :param name: name of user instance
        :param role: role of user instance
        :return: user models
        """
        query = select(UserModel)
        if id:
            query = query.where(UserModel.id == id)
        if email:
            query = query.where(UserModel.email == email)
        if name:
            query = query.where(UserModel.name == name)
        if role:
            query = query.where(UserModel.role == role)
        rows = await self.session.execute(query)
        return list(rows.scalars().fetchall())

    async def get_user_by_external_id(self, external_id: str) -> Optional[UserModel]:
        """Get user by external ID (Windows username)."""
        query = select(UserModel).where(UserModel.external_id == external_id)
        result = await self.session.execute(query)
        return result.scalars().first()


