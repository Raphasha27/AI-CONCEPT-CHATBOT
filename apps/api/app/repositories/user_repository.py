"""
User repository — CRUD operations.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import hash_password


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def create(self, email: str, full_name: str, password: str, role: str = "user") -> User:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            role=role,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[User]:
        result = await self.db.execute(
            select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
        )
        return list(result.scalars().all())

    async def count(self) -> int:
        from sqlalchemy import func
        result = await self.db.execute(select(func.count()).select_from(User))
        return result.scalar_one()

    async def deactivate(self, user_id: int) -> User | None:
        user = await self.get_by_id(user_id)
        if user:
            user.is_active = False
            await self.db.flush()
        return user
