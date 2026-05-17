from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.users.application.use_cases import UpdateUserProfile
from app.modules.users.domain.entity import User
from app.modules.users.infrastructure.repository import UserRepository
from app.modules.users.presentation.dependencies import get_current_user
from app.modules.users.presentation.schemas import UpdateProfileRequest, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


@router.patch("/me", response_model=UserResponse)
async def update_me(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    repo = UserRepository(db)
    use_case = UpdateUserProfile(user_repo=repo)
    updated = await use_case.execute(user_id=current_user.id, full_name=body.full_name)
    return UserResponse(
        id=updated.id,
        email=updated.email,
        full_name=updated.full_name,
        is_active=updated.is_active,
        created_at=updated.created_at,
    )
