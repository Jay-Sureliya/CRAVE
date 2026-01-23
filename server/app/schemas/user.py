from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str = "customer" 

class UserResponse(BaseModel):
    username: str
    role: str
    
    class Config:
        from_attributes = True