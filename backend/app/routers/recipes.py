from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..models import User, Recipe, Ingredient, RecipeIngredient
from ..schemas import RecipeCreate, RecipeOut, IngredientOut
from ..auth import get_current_user

router = APIRouter(prefix="/recipes", tags=["recipes"])

@router.post("", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = Recipe(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        cooking_time=data.cooking_time,
        servings=data.servings,
        meal_type=data.meal_type,
        source=data.source,
        image_url=data.image_url,
    )
    db.add(recipe)
    await db.flush()

    for ing in data.ingredients:
        result = await db.execute(
            select(Ingredient).where(Ingredient.name == ing.name.strip())
        )
        ingredient = result.scalar_one_or_none()

        if not ingredient:
            ingredient = Ingredient(name=ing.name.strip())
            db.add(ingredient)
            await db.flush()

        link = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ingredient.id,
            amount=ing.amount,
            unit=ing.unit,
        )
        db.add(link)

    await db.commit()

    result = await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient))
        .where(Recipe.id == recipe.id)
    )
    recipe = result.scalar_one()

    return RecipeOut(
        id=recipe.id,
        title=recipe.title,
        description=recipe.description,
        cooking_time=recipe.cooking_time,
        servings=recipe.servings,
        meal_type=recipe.meal_type,
        source=recipe.source,
        image_url=recipe.image_url,
        ingredients=[
            IngredientOut(
                name=ri.ingredient.name,
                amount=float(ri.amount) if ri.amount is not None else None,
                unit=ri.unit,
            )
            for ri in recipe.ingredients
        ],
    )