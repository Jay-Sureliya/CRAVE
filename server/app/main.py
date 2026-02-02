from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
from dotenv import load_dotenv

# --- INTERNAL IMPORTS ---
from app.db.session import engine, Base, get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.routes import restaurant

load_dotenv()

# ---------------- CONFIGURATION ----------------
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Crave API")

# ---------------- MIDDLEWARE (CORS) ----------------
# Updated to handle specific origin and credentials for better browser compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(restaurant.router)

# ---------------- HELPERS ----------------
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
    return pwd_context.hash(password)

# ---------------- AUTHENTICATION ----------------

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hash_password(user.password),
        role=user.role if user.role else "customer",
        profile_image=getattr(user, 'profile_image', "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Registration successful"}

@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(hours=2)
    payload = {
        "sub": user.username,
        "id": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + access_token_expires
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "user_id": user.id
    }

# ---------------- USER PROFILE MANAGEMENT (ID-BASED) ----------------

@app.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Fetch user data by Primary Key ID and ensure all fields exist for frontend."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Returning a full dictionary ensures profile_image is never 'undefined' in React
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "profile_image": user.profile_image if user.profile_image else "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    }

@app.put("/users/{user_id}")
def update_user_profile(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    # 1. Fetch current user
    db_user_query = db.query(User).filter(User.id == user_id)
    db_user = db_user_query.first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. CHECK IF USERNAME IS TAKEN BY SOMEONE ELSE
    if data.username and data.username != db_user.username:
        existing_user = db.query(User).filter(User.username == data.username).first()
        if existing_user:
            # This detail message MUST match the frontend check exactly
            raise HTTPException(status_code=400, detail="Username already taken")

    # 3. Proceed with update
    update_data = data.dict(exclude_unset=True)
    try:
        db_user_query.update(update_data, synchronize_session=False)
        db.commit()
        db.refresh(db_user)
        return {"message": "Success", "user": db_user}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database update failed")

# ---------------- DASHBOARD ACCESS ----------------

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")

@app.get("/admin/dashboard")
def admin_dashboard(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {"stats": "Admin Data"}

if __name__ == "__main__":
    import uvicorn
    # Make sure port 8000 matches your frontend api.js baseURL
    uvicorn.run(app, host="0.0.0.0", port=8000)