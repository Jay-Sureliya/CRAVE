# from pydantic import BaseModel

# class RestaurantRequestCreate(BaseModel):
#     restaurantName: str
#     ownerName: str
#     email: str
#     phone: str
#     address: str

#     class Config:
#         from_attributes = True  # ✅ Pydantic v2 fix

# class RestaurantResponse(BaseModel):
#     id: int
#     name: str
#     is_active: bool
    
#     class Config:
#         from_attributes = True

from pydantic import BaseModel
from typing import Optional

class RestaurantRequestCreate(BaseModel):
    restaurantName: str
    ownerName: str
    email: str
    phone: str
    address: str

    class Config:
        from_attributes = True  # ✅ Pydantic v2

# ✅ FIXED: Added 'address' and 'profile_image'
class RestaurantResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    address: Optional[str] = None       # <--- Critical for Location Filter
    profile_image: Optional[str] = None # <--- Critical for UI Display
    
    class Config:
        from_attributes = True