from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

# ---------------- USER SCHEMAS ----------------
class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "customer"
    # Default image for new registrations
    profile_image: Optional[str] = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None 

    model_config = ConfigDict(from_attributes=True)
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    user_id: int
    
    # ✅ Keep this line as you had it:
    restaurant_id: Optional[int] = None 

    model_config = ConfigDict(from_attributes=True)


# ---------------- RESTAURANT SCHEMAS (NEW) ----------------
# Add these so your Restaurant data is correctly typed
class RestaurantBase(BaseModel):
    name: str
    email: EmailStr
    is_active: bool = True
    
    # ✅ ADDED THESE TO MATCH YOUR DATABASE:
    address: Optional[str] = None
    profile_image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RestaurantResponse(RestaurantBase):
    id: int