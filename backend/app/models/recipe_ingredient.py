from sqlalchemy import BigInteger, String, Column, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class RecipeIngredient(Base):
    __tablename__ = "Recipe_ingredients"

    recipe_id = Column(
        BigInteger, ForeignKey("Recipes.id", ondelete="CASCADE"), primary_key=True
    )
    ingredient_id = Column(
        BigInteger, ForeignKey("Ingredient.id", ondelete="CASCADE"), primary_key=True
    )
    amount = Column(Numeric(10, 2), nullable=True)
    unit = Column(String(20), nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_links")