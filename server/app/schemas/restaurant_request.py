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
<<<<<<< HEAD
        from_attributes = True  # ✅ Pydantic v2 fix
=======
        from_attributes = True  # ✅ Pydantic v2

# ✅ FIXED: Added 'address' and 'profile_image'
class RestaurantResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    address: Optional[str] = None 
    profile_image: Optional[str] = None
    average_rating: float = 0.0
    rating_count: int = 0

    class Config:
        from_attributes = True
>>>>>>> Mihir
