from pydantic import BaseModel
from typing import Optional


class IngredientInput(BaseModel):
    name: str
    amount: Optional[float] = None
    unit: Optional[str] = None


class IngredientOut(BaseModel):
    name: str
    amount: Optional[float] = None
    unit: Optional[str] = None


class RecipeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None
    meal_type: Optional[str] = None
    source: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: list[IngredientInput] = []


class RecipeOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None
    meal_type: Optional[str] = None
    source: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: list[IngredientOut] = []

    class Config:
        from_attributes = True