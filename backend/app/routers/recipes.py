from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import File, UploadFile, HTTPException, status
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..schemas import RecipeCreate, RecipeOut, IngredientOut
from ..services.recipe_service import RecipeService
from ..services.storage_service import upload_image

router = APIRouter(prefix="/recipes", tags=["recipes"])


def to_out(recipe) -> RecipeOut:
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

@router.post("/upload-image")
async def upload_recipe_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    data = await file.read()
    content_type = file.content_type or ""
    try:
        url = upload_image(data, content_type, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось загрузить файл в хранилище",
        )
    return {"image_url": url}

@router.get("/ingredients/names")
async def ingredient_names(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RecipeService(db).ingredient_names()


@router.get("", response_model=list[RecipeOut])
async def list_recipes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipes = await RecipeService(db).list_mine(current_user)
    return [to_out(r) for r in recipes]


@router.post("", response_model=RecipeOut, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = await RecipeService(db).create(data, current_user)
    return to_out(recipe)


@router.get("/{recipe_id}", response_model=RecipeOut)
async def get_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = await RecipeService(db).get_mine(recipe_id, current_user)
    return to_out(recipe)


@router.put("/{recipe_id}", response_model=RecipeOut)
async def update_recipe(
    recipe_id: int,
    data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    recipe = await RecipeService(db).update(recipe_id, data, current_user)
    return to_out(recipe)


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await RecipeService(db).delete(recipe_id, current_user)
    return None