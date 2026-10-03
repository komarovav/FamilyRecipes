from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class IngredientCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    amount: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=20)

class RecipeCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None
    meal_type: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field(None, max_length=100)
    image_url: Optional[str] = None
    ingredients: List[IngredientCreate] = []

class IngredientOut(BaseModel):
    name: str
    amount: Optional[float] = None
    unit: Optional[str] = None

    class Config:
        from_attributes = True

class RecipeOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None
    meal_type: Optional[str] = None
    source: Optional[str] = None
    image_url: Optional[str] = None
    ingredients: List[IngredientOut] = []

    class Config:
        from_attributes = True