from pydantic import BaseModel

class RestaurantRequestCreate(BaseModel):
    restaurantName: str
    ownerName: str
    email: str
    phone: str
    address: str

    class Config:
        from_attributes = True  # ✅ Pydantic v2 fix

class RestaurantResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    
    class Config:
        from_attributes = True