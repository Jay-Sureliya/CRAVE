from pydantic import BaseModel
from pyparsing import Optional

class RestaurantLogin(BaseModel):
    email: str
    password: str

class RestaurantResponse(BaseModel):
    id: int
    name: str
<<<<<<< HEAD
    email: str

=======
    is_active: bool
    address: Optional[str] = None 
    profile_image: Optional[str] = None
    average_rating: float = 0.0
    rating_count: int = 0

    class Config:
        from_attributes = True
>>>>>>> Mihir
