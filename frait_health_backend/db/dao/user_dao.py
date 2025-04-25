from typing import List, Optional, Dict, Any

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
        role: UserRole,
        external_id: Optional[str] = None,
        identity_provider: Optional[str] = None,
        username: Optional[str] = None,
        sso_metadata: Optional[Dict[str, Any]] = None,
    ) -> UserModel:
        """
        Add single user to session.

        :param name: name of the user
        :param email: email of the user
        :param role: role of the user
        :param external_id: external ID (e.g., Azure AD object ID)
        :param identity_provider: identity provider (e.g., "azure_ad")
        :param username: username of the user
        :param sso_metadata: additional SSO metadata
        :return: created user model
        """
        user = UserModel(
            name=name,
            email=email,
            role=role,
            external_id=external_id,
            identity_provider=identity_provider,
            username=username,
            sso_metadata=sso_metadata,
        )
        self.session.add(user)
        await self.session.flush()
        return user




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

    async def get_user_by_id(self, user_id: int) -> Optional[UserModel]:
        """
        Get user by ID.
        
        :param user_id: ID of the user
        :return: user model if found, None otherwise
        """
        query = select(UserModel).where(UserModel.id == user_id)
        result = await self.session.execute(query)
        return result.scalars().first()
        
    async def get_user_by_external_id(self, external_id: str, identity_provider: Optional[str] = None) -> Optional[UserModel]:
        """
        Get user by external ID and optionally identity provider.
        
        :param external_id: external ID (e.g., Azure AD object ID)
        :param identity_provider: identity provider (e.g., "azure_ad")
        :return: user model if found, None otherwise
        """
        query = select(UserModel).where(UserModel.external_id == external_id)
        if identity_provider:
            query = query.where(UserModel.identity_provider == identity_provider)
        result = await self.session.execute(query)
        return result.scalars().first()
        
    async def get_user_by_email(self, email: str) -> Optional[UserModel]:
        """
        Get user by email.
        
        :param email: email of the user
        :return: user model if found, None otherwise
        """
        query = select(UserModel).where(UserModel.email == email)
        result = await self.session.execute(query)
        return result.scalars().first()
        
    async def update_user_sso_metadata(self, user_id: int, sso_metadata: Dict[str, Any]) -> Optional[UserModel]:
        """
        Update user's SSO metadata.
        
        :param user_id: ID of the user
        :param sso_metadata: SSO metadata to update
        :return: updated user model if found, None otherwise
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return None
            
        user.sso_metadata = sso_metadata
        await self.session.flush()
        return user

    async def filter(
        self,
        id: Optional[int] = None,
        email: Optional[str] = None,
        name: Optional[str] = None,
        role: Optional[UserRole] = None,
        external_id: Optional[str] = None,
        identity_provider: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> List[UserModel]:
        """
        Get specific user models.

        :param id: id of user instance
        :param email: email of user instance
        :param name: name of user instance
        :param role: role of user instance
        :param external_id: external ID of user instance
        :param identity_provider: identity provider of user instance
        :param limit: limit the number of results
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
        if external_id:
            query = query.where(UserModel.external_id == external_id)
        if identity_provider:
            query = query.where(UserModel.identity_provider == identity_provider)
        if limit:
            query = query.limit(limit)
        rows = await self.session.execute(query)
        return list(rows.scalars().fetchall())






