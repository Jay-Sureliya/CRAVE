from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, load_only # <--- NEW: For optimization
from app.db.session import get_db
from app.models.user import Restaurant
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone # <--- Updated for timezone support
from pydantic import BaseModel, EmailStr

# --- CONFIG ---
# Ensure these match your main.py config exactly
SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/restaurant", tags=["Restaurant"])

# --- SCHEMA ---
# Using a Pydantic model is cleaner than query parameters for JSON bodies
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/login")
def restaurant_login(
    login_data: LoginRequest, # Expects JSON body: {"email": "...", "password": "..."}
    db: Session = Depends(get_db)
):
    # OPTIMIZATION: Use 'load_only'
    # We only fetch ID, Email, and Password. 
    # This prevents downloading the huge 'profile_image' Base64 string during login.
    restaurant = db.query(Restaurant).filter(Restaurant.email == login_data.email).options(
        load_only(Restaurant.id, Restaurant.email, Restaurant.password)
    ).first()

    if not restaurant or not pwd_context.verify(login_data.password, restaurant.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # CRITICAL FIX: Added 'restaurant_id' to payload
    # Your 'get_current_restaurant' dependency in menu.py requires this field!
    payload = {
        "sub": restaurant.email,
        "restaurant_id": restaurant.id, # <--- REQUIRED for menu routes
        "role": "restaurant",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "restaurant",
        "restaurant_id": restaurant.id # Helpful for frontend to have immediately
    }