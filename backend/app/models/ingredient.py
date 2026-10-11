from sqlalchemy import BigInteger, String, Column
from sqlalchemy.orm import relationship
from ..database import Base


class Ingredient(Base):
    __tablename__ = "Ingredient"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    recipe_links = relationship("RecipeIngredient", back_populates="ingredient")