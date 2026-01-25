from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
