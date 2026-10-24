from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from ..models import Recipe, RecipeIngredient


class RecipeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _with_ingredients(self):
        return select(Recipe).options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient)
        )

    async def list_for_user(self, user_id: int) -> list[Recipe]:
        result = await self.db.execute(
            self._with_ingredients().where(Recipe.user_id == user_id)
        )
        return list(result.scalars().all())

    async def get_for_user(self, recipe_id: int, user_id: int) -> Recipe | None:
        result = await self.db.execute(
            self._with_ingredients().where(
                Recipe.id == recipe_id,
                Recipe.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, recipe: Recipe) -> Recipe:
        self.db.add(recipe)
        await self.db.flush()
        return recipe

    async def delete_ingredient_links(self, recipe_id: int) -> None:
        result = await self.db.execute(
            select(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id)
        )
        for link in result.scalars().all():
            await self.db.delete(link)
        await self.db.flush()

    async def add_ingredient_link(self, link: RecipeIngredient) -> None:
        self.db.add(link)

    async def commit(self) -> None:
        await self.db.commit()

    async def refresh_with_ingredients(self, recipe_id: int) -> Recipe:
        result = await self.db.execute(
            self._with_ingredients().where(Recipe.id == recipe_id)
        )
        return result.scalar_one()

    async def delete(self, recipe: Recipe) -> None:
        await self.db.delete(recipe)
        await self.db.commit()