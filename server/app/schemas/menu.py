from pydantic import BaseModel
from typing import Optional

# Base Schema
class MenuItemBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price: float
    discount_price: Optional[float] = None
    is_veg: bool = True
    is_available: bool = True

# Schema for creating (Image is handled separately via Form)
class MenuItemCreate(MenuItemBase):
    pass

# Schema for reading (Response)
class MenuItemResponse(MenuItemBase):
    id: int
    restaurant_id: int
    image: Optional[str] = None # Base64 string

    class Config:
        from_attributes = True # Use 'orm_mode = True' if using Pydantic v1