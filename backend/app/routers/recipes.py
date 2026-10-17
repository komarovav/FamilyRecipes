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

@router.get("/ingredients/names", response_model=list[str])
async def list_ingredient_names(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Ingredient.name).order_by(Ingredient.name)
    )
    return list(result.scalars().all())

@router.get("", response_model=list[RecipeOut])
async def list_recipes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient)
        )
        .where(Recipe.user_id == current_user.id)
        .order_by(Recipe.id.desc())
    )
    recipes = result.scalars().all()

    return [
        RecipeOut(
            id=r.id,
            title=r.title,
            description=r.description,
            cooking_time=r.cooking_time,
            servings=r.servings,
            meal_type=r.meal_type,
            source=r.source,
            image_url=r.image_url,
            ingredients=[
                IngredientOut(
                    name=ri.ingredient.name,
                    amount=float(ri.amount) if ri.amount is not None else None,
                    unit=ri.unit,
                )
                for ri in r.ingredients
            ],
        )
        for r in recipes
    ]

@router.get("/{recipe_id}", response_model=RecipeOut)
async def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient)
        )
        .where(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    )
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

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

@router.put("/{recipe_id}", response_model=RecipeOut)
async def update_recipe(
    recipe_id: int,
    data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient)
        )
        .where(Recipe.id == recipe_id, Recipe.user_id == current_user.id)
    )
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    recipe.title = data.title
    recipe.description = data.description
    recipe.cooking_time = data.cooking_time
    recipe.servings = data.servings
    recipe.meal_type = data.meal_type
    recipe.source = data.source
    recipe.image_url = data.image_url

    for link in list(recipe.ingredients):
        await db.delete(link)
    await db.flush()

    for item in data.ingredients:
        name = item.name.strip()
        if not name:
            continue
        ing_result = await db.execute(
            select(Ingredient).where(Ingredient.name == name)
        )
        ingredient = ing_result.scalar_one_or_none()
        if not ingredient:
            ingredient = Ingredient(name=name)
            db.add(ingredient)
            await db.flush()

        db.add(
            RecipeIngredient(
                recipe_id=recipe.id,
                ingredient_id=ingredient.id,
                amount=item.amount,
                unit=item.unit,
            )
        )

    await db.commit()

    result = await db.execute(
        select(Recipe)
        .options(
            selectinload(Recipe.ingredients).selectinload(RecipeIngredient.ingredient)
        )
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


@router.delete("/{recipe_id}", status_code=204)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Recipe).where(
            Recipe.id == recipe_id, Recipe.user_id == current_user.id
        )
    )
    recipe = result.scalar_one_or_none()
    if not recipe:
        raise HTTPException(status_code=404, detail="Рецепт не найден")

    await db.delete(recipe)
    await db.commit()
    return None