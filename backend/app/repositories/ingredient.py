from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Ingredient


class IngredientRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_name(self, name: str) -> Ingredient | None:
        result = await self.db.execute(
            select(Ingredient).where(Ingredient.name == name)
        )
        return result.scalar_one_or_none()

    async def create(self, name: str) -> Ingredient:
        ingredient = Ingredient(name=name)
        self.db.add(ingredient)
        await self.db.flush()
        return ingredient

    async def get_or_create(self, name: str) -> Ingredient:
        found = await self.get_by_name(name)
        if found:
            return found
        return await self.create(name)

    async def list_names(self) -> list[str]:
        result = await self.db.execute(select(Ingredient.name).order_by(Ingredient.name))
        return list(result.scalars().all())