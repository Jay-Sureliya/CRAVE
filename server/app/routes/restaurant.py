from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import Restaurant
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/restaurant", tags=["Restaurant"])

@router.post("/login")
def restaurant_login(email: str, password: str, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.email == email).first()

    if not restaurant or not pwd_context.verify(password, restaurant.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": restaurant.email,
        "role": "restaurant",
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "restaurant"
    }
