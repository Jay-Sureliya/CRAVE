from pydantic import BaseModel
from typing import Optional

# Base schema with shared fields
class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    category: str
    is_veg: bool = True

# Schema for creating an item (matches your DB structure)
class MenuItemCreate(MenuItemBase):
    restaurant_id: int

# Schema for reading an item (returned to frontend)
class MenuItemResponse(MenuItemBase):
    id: int
    restaurant_id: int
    image: Optional[str] = None  # Contains the URL like "/uploads/xyz.jpg"

    class Config:
        # Allows Pydantic to read data from SQLAlchemy models
        from_attributes = True 
        # Note: If using an older version of Pydantic, use 'orm_mode = True' instead