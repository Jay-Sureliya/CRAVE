from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

# Base Schema (Shared Fields)
class MenuItemBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    price: float
    # Auto-map snake_case to camelCase for Frontend
    discount_price: Optional[float] = Field(None, serialization_alias="discountPrice")
    is_veg: bool = True
    is_available: bool = Field(True, serialization_alias="isAvailable")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# 1. LITE Schema (For Fast Lists - NO IMAGE)
class MenuItemLite(MenuItemBase):
    id: int
    restaurant_id: int
    # NO IMAGE FIELD HERE

# 2. FULL Schema (For Details/Updates - WITH IMAGE)
class MenuItemResponse(MenuItemLite):
    image: Optional[str] = None