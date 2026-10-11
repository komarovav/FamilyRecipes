from sqlalchemy import BigInteger, String, Column
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "User"

    id = Column(BigInteger, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    recipes = relationship("Recipe", back_populates="user", cascade="all, delete-orphan")