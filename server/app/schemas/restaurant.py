from pydantic import BaseModel

class RestaurantLogin(BaseModel):
    email: str
    password: str

class RestaurantResponse(BaseModel):
    id: int
    name: str
    email: str

