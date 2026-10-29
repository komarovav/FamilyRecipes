from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..repositories.user import UserRepository
from ..services.auth_service import hash_password, verify_password, create_access_token
from ..schemas import UserCreate, UserLogin
from ..services.storage_service import delete_user_images       


class UserService:
    def __init__(self, db: AsyncSession):
        self.users = UserRepository(db)

    async def register(self, data: UserCreate):
        existing = await self.users.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email уже зарегистрирован",
            )
        return await self.users.create(
            name=data.name,
            email=data.email,
            password_hash=hash_password(data.password),
        )

    async def login(self, data: UserLogin) -> dict:
        user = await self.users.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Неверный email или пароль",
            )
        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}

    async def delete_account(self, user) -> None:
        user_id = user.id
        await self.users.delete(user)
        try:
            delete_user_images(user_id)
        except Exception:
            pass