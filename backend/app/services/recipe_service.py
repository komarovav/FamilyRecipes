from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..models import Recipe, RecipeIngredient, User
from ..repositories.recipe import RecipeRepository
from ..repositories.ingredient import IngredientRepository
from ..schemas import RecipeCreate
from ..services.storage_service import delete_image

class RecipeService:
    def __init__(self, db: AsyncSession):
        self.recipes = RecipeRepository(db)
        self.ingredients = IngredientRepository(db)

    async def list_mine(self, user: User) -> list[Recipe]:
        return await self.recipes.list_for_user(user.id)

    async def get_mine(self, recipe_id: int, user: User) -> Recipe:
        recipe = await self.recipes.get_for_user(recipe_id, user.id)
        if not recipe:
            raise HTTPException(status_code=404, detail="Рецепт не найден")
        return recipe

    async def create(self, data: RecipeCreate, user: User) -> Recipe:
        recipe = Recipe(
            user_id=user.id,
            title=data.title,
            description=data.description,
            cooking_time=data.cooking_time,
            servings=data.servings,
            meal_type=data.meal_type,
            source=data.source,
            image_url=data.image_url,
        )
        await self.recipes.create(recipe)
        await self._set_ingredients(recipe.id, data.ingredients)
        await self.recipes.commit()
        return await self.recipes.refresh_with_ingredients(recipe.id)

    async def update(self, recipe_id: int, data: RecipeCreate, user: User) -> Recipe:
        recipe = await self.get_mine(recipe_id, user)
        old_url = recipe.image_url
        new_url = data.image_url

        recipe.title = data.title
        recipe.description = data.description
        recipe.cooking_time = data.cooking_time
        recipe.servings = data.servings
        recipe.meal_type = data.meal_type
        recipe.source = data.source
        recipe.image_url = new_url

        await self.recipes.delete_ingredient_links(recipe.id)
        await self._set_ingredients(recipe.id, data.ingredients)
        await self.recipes.commit()

        if old_url and old_url != new_url:
            try:
                delete_image(old_url)
            except Exception:
                pass

        return await self.recipes.refresh_with_ingredients(recipe.id)

    async def delete(self, recipe_id: int, user: User) -> None:
        recipe = await self.get_mine(recipe_id, user)
        image_url = recipe.image_url
        await self.recipes.delete(recipe)
        try:
            delete_image(image_url)
        except Exception:
            pass

    async def ingredient_names(self) -> list[str]:
        return await self.ingredients.list_names()

    async def _set_ingredients(self, recipe_id: int, items) -> None:
        for ing in items:
            name = ing.name.strip()
            if not name:
                continue
            ingredient = await self.ingredients.get_or_create(name)
            link = RecipeIngredient(
                recipe_id=recipe_id,
                ingredient_id=ingredient.id,
                amount=ing.amount,
                unit=ing.unit,
            )
            await self.recipes.add_ingredient_link(link)