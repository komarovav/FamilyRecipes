from sqlalchemy import BigInteger, String, Column, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


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
        cascade="all, delete-orphan",)