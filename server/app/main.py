from typing import List
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
from app.models.user import User, Restaurant
from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.routes import restaurant
from app.models.restaurant_request import RestaurantRequest  # Make sure this file exists/is imported correctly
from app.schemas.restaurant_request import RestaurantRequestCreate , RestaurantResponse
from app.routes import admin
from app.routes import menu


load_dotenv()

# ---------------- CONFIGURATION ----------------
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Crave API")

# ---------------- MIDDLEWARE (CORS) ----------------
# Updated to handle specific origin and credentials for better browser compatibility
# ---------------- MIDDLEWARE (CORS) ----------------
# app/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # ✅ Explicit list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(restaurant.router)
app.include_router(menu.router)
app.include_router(admin.router)

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
    # 1. Check User
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 2. Get Restaurant ID
    restaurant_id = None
    if user.role == "restaurant":
        restaurant_record = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if restaurant_record:
            restaurant_id = restaurant_record.id

    # 3. Create Token
    payload = {
        "sub": user.username,
        "id": user.id,
        "role": user.role,
        "restaurant_id": restaurant_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    # 4. Return Response (THIS IS THE FIX)
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "user_id": user.id,
        "restaurant_id": restaurant_id  # <--- YOU WERE MISSING THIS LINE!
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

@app.post("/api/restaurant-request")
def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
    """
    Receives the restaurant application from the About Us page modal.
    """
    # 1. Check if a request with this email already exists to prevent spam
    existing_request = db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first()
    if existing_request:
        raise HTTPException(
            status_code=400, 
            detail="A request with this email already exists."
        )

    # 2. Create the new DB entry
    new_request = RestaurantRequest(
        restaurant_name=request.restaurantName,  # Mapping Pydantic (camelCase) to DB (snake_case)
        owner_name=request.ownerName,
        email=request.email,
        phone=request.phone,
        address=request.address,
        status="pending"
    )

    # 3. Save to Database
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {"message": "Application received successfully", "id": new_request.id}

# --- TEMPORARY RESET TOOL ---
@app.get("/api/debug/reset-user/{username}")
def reset_broken_user(username: str, db: Session = Depends(get_db)):
    # 1. Find the User
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"error": "User not found"}
    
    # 2. Reset the Restaurant Request so you can approve it again
    # (Assuming you have a RestaurantRequest model imported)
    try:
        req = db.query(RestaurantRequest).filter(RestaurantRequest.email == user.email).first()
        if req:
            req.status = "pending"
    except:
        pass # Ignore if request table doesn't exist or error occurs
    
    # 3. Delete the Broken User
    db.delete(user)
    db.commit()
    
    return {"message": f"User '{username}' deleted. Please Go to Admin Panel and Approve the request again."}


@app.get("/restaurants", response_model=List[RestaurantResponse])
def get_all_restaurants(db: Session = Depends(get_db)):
    """
    Fetch all active restaurants for the customer homepage.
    """
    # Get all restaurants where is_active is True
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    return restaurants

if __name__ == "__main__":
    import uvicorn
    # Make sure port 8000 matches your frontend api.js baseURL
    uvicorn.run(app, host="0.0.0.0", port=8000)