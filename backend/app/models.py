from sqlalchemy import BigInteger, String, Column, Text, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "User"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")

class Recipe(Base):
    __tablename__ = "Recipes"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    cooking_time = Column(Integer, nullable=True)
    servings = Column(Integer, nullable=True)
    meal_type = Column(String(20), nullable=True)
    source = Column(String(100), nullable=True)
    image_url = Column(Text, nullable=True)

    user = relationship("User", back_populates="recipes")
    ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
    )

class Ingredient(Base):
    __tablename__ = "Ingredient"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    recipe_links = relationship("RecipeIngredient", back_populates="ingredient")

class RecipeIngredient(Base):
    __tablename__ = "Recipe_ingredients"

    recipe_id = Column(BigInteger, ForeignKey("Recipes.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id = Column(BigInteger, ForeignKey("Ingredient.id", ondelete="CASCADE"), primary_key=True)
    amount = Column(Numeric(10, 2), nullable=True)
    unit = Column(String(20), nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_links")