from dataclasses import dataclass
from uuid import UUID

from app.core.exceptions import NotFoundError
from app.modules.users.domain.entity import User
from app.modules.users.domain.port import IUserRepository


@dataclass
class GetUserById:
    user_repo: IUserRepository

    async def execute(self, user_id: UUID) -> User:
        user = await self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        return user


@dataclass
class UpdateUserProfile:
    user_repo: IUserRepository

    async def execute(self, user_id: UUID, full_name: str) -> User:
        user = await self.user_repo.find_by_id(user_id)
        if not user:
            raise NotFoundError("User", user_id)
        user.full_name = full_name
        return await self.user_repo.update(user)
