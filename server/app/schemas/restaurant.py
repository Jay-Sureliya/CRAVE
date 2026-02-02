from pydantic import BaseModel

class RestaurantLogin(BaseModel):
    email: str
    password: str


class RestaurantResponse(BaseModel):
    id: int
    name: str
    # We only send necessary fields. NO PASSWORD.
    
    class Config:
        from_attributes = True # Allows FastAPI to read SQL data