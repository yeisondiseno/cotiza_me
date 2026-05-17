from dataclasses import dataclass
from uuid import uuid4

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.modules.auth.domain.entity import TokenPair
from app.modules.users.domain.entity import User
from app.modules.users.domain.port import IUserRepository


@dataclass
class RegisterUser:
    user_repo: IUserRepository

    async def execute(self, email: str, password: str, full_name: str) -> User:
        existing = await self.user_repo.find_by_email(email)
        if existing:
            raise ConflictError(f"Email '{email}' is already registered")

        from datetime import UTC, datetime
        now = datetime.now(UTC)
        user = User(
            id=uuid4(),
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            created_at=now,
            updated_at=now,
        )
        return await self.user_repo.save(user)


@dataclass
class LoginUser:
    user_repo: IUserRepository

    async def execute(self, email: str, password: str) -> TokenPair:
        user = await self.user_repo.find_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account is inactive")

        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )


@dataclass
class RefreshTokens:
    user_repo: IUserRepository

    async def execute(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token)
        except ValueError as exc:
            raise UnauthorizedError("Invalid refresh token") from exc

        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        from uuid import UUID
        user = await self.user_repo.find_by_id(UUID(payload["sub"]))
        if not user or not user.is_active:
            raise UnauthorizedError("User not found or inactive")

        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
        )
