from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "customer"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
