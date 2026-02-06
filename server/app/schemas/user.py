from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "customer"

class UserCreate(UserBase):
    password: str
    profile_image: Optional[str] = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None 
    password: Optional[str] = None 
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    user_id: int
    restaurant_id: Optional[int] = None 
    model_config = ConfigDict(from_attributes=True)

# --- RESTAURANT SCHEMAS ---
class RestaurantBase(BaseModel):
    name: str
    email: EmailStr
    is_active: bool = True
    address: Optional[str] = None

# FAST RESPONSE (No Image) - Use this for Lists
class RestaurantLite(RestaurantBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# FULL RESPONSE (With Image) - Use this for Details
class RestaurantResponse(RestaurantBase):
    id: int
    profile_image: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)