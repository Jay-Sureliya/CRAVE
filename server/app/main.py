from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func # <--- ADDED func
from sqlalchemy.orm import Session, defer, load_only
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
import base64 
from dotenv import load_dotenv
from pydantic import BaseModel 

# --- INTERNAL IMPORTS ---
from app.db.session import engine, Base, get_db

# 1. Import Models
from app.models.user import User, Restaurant, Favorite
from app.models.menu import MenuItem 
from app.models.restaurant_request import RestaurantRequest
from app.models.rider_request import RiderRequest
from app.schemas.rider_request import RiderRequestCreate

from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse

# 2. Import Routes
from app.routes import restaurant
from app.routes import admin
from app.routes import menu

# --- EMAIL IMPORT ---
from app.routes.admin import send_update_email

load_dotenv()

# ---------------- CONFIGURATION ----------------
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Crave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(restaurant.router)
app.include_router(admin.router)
app.include_router(menu.router) 

# ---------------- HELPERS ----------------
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def hash_password(password): return pwd_context.hash(password)

# ---------------- PYDANTIC MODELS ----------------
class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    password: Optional[str] = None 

# ==============================================================================
#  AUTH DEPENDENCIES
# ==============================================================================

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid session")

def get_current_restaurant(
    user: dict = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if user["role"] != "restaurant": 
        raise HTTPException(403, "Not a restaurant")
    
    res = db.query(Restaurant).filter(Restaurant.id == user.get("restaurant_id")).options(
        load_only(Restaurant.id, Restaurant.email, Restaurant.is_active)
    ).first()
    
    if not res: 
        raise HTTPException(404, "Restaurant not found")
    return res

# ==============================================================================
#  FAVORITES API
# ==============================================================================

@app.get("/api/favorites")
def get_user_favorites(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favs = db.query(Favorite.menu_item_id).filter(Favorite.user_id == current_user["id"]).all()
    return [f[0] for f in favs]

@app.post("/api/favorites/{item_id}")
def toggle_favorite(
    item_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user["id"]
    existing_fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.menu_item_id == item_id).first()

    if existing_fav:
        db.delete(existing_fav)
        db.commit()
        return {"status": "removed", "item_id": item_id}
    else:
        new_fav = Favorite(user_id=user_id, menu_item_id=item_id)
        db.add(new_fav)
        db.commit()
        return {"status": "added", "item_id": item_id}

# ==============================================================================
#  MENU API ENDPOINTS
# ==============================================================================

def format_items(items):
    return [
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "description": item.description,
            "price": item.price,
            "discountPrice": item.discount_price,
            "type": "veg" if item.is_veg else "non-veg",
            "is_veg": item.is_veg,
            "isAvailable": item.is_available,
            "image": item.image 
        }
        for item in items
    ]

# ---------------- RESTAURANT REGISTRATION LOGIC (UPDATED) ----------------

@app.post("/api/restaurant-request")
def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
    # 1. Check if a request already exists
    if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first():
        raise HTTPException(status_code=400, detail="Application with this email already exists.")

    # 2. Check if the restaurant is already active
    if db.query(Restaurant).filter(Restaurant.email == request.email).first():
        raise HTTPException(status_code=400, detail="Restaurant is already active.")

    # 3. Create the Request with 'pending' status
    new_request = RestaurantRequest(
        restaurant_name=request.restaurantName,
        owner_name=request.ownerName,
        email=request.email,
        phone=request.phone,
        address=request.address,
        status="pending"  # <--- CHANGED FROM "approved" TO "pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # 4. Return success message (User/Restaurant is NOT created yet)
    return {
        "message": "Application submitted successfully! Please wait for Admin approval.", 
        "id": new_request.id
    }

# ==============================================================================
#  RESTAURANT LIST API (OPTIMIZED & DYNAMIC)
# ==============================================================================

# 1. GET ALL RESTAURANTS (Text Only + Dynamic Cuisine)
@app.get("/restaurants")
def get_all_restaurants(db: Session = Depends(get_db)):
    # REMOVE defer(Restaurant.profile_image) to include the data in the response
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    
    response_data = []
    for r in restaurants:
        # Dynamic Cuisine Logic (keep your existing logic)
        cats = db.query(MenuItem.category)\
                 .filter(MenuItem.restaurant_id == r.id)\
                 .distinct()\
                 .limit(2)\
                 .all()
        
        cuisine_str = " • ".join([c[0] for c in cats if c[0]]) if cats else "Multi-Cuisine" 

        response_data.append({
            "id": r.id,
            "name": r.name,
            "address": r.address,
            "rating": "4.5",
            "is_active": r.is_active,
            "profile_image": r.profile_image, # Fetching directly from Restaurant table
            "cuisine": cuisine_str 
        })
    return response_data

# 2. GET RESTAURANT IMAGE (Lazy Load)
@app.get("/api/restaurant/image/{restaurant_id}")
def get_restaurant_image(restaurant_id: int, db: Session = Depends(get_db)):
    res = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    
    if not res or not res.profile_image:
        return Response(status_code=404)

    try:
        img_str = res.profile_image
        if "base64," in img_str:
            _, img_str = img_str.split("base64,", 1)
        
        image_data = base64.b64decode(img_str)
        
        # Cache for 1 year so it loads instantly next time
        return Response(
            content=image_data, 
            media_type="image/jpeg",
            headers={"Cache-Control": "public, max-age=31536000, immutable"}
        )
    except Exception:
        return Response(status_code=500)

@app.get("/restaurants/{restaurant_id}")
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant: raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# --- USER PROFILE ROUTES ---

@app.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # --- FIX: Sync Restaurant Image ---
    profile_image = user.profile_image
    if user.role == "restaurant":
        res_data = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if res_data:
            profile_image = res_data.profile_image

    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "profile_image": profile_image # Now returns the actual restaurant logo
    }

@app.put("/users/{user_id}")
def update_user_profile(user_id: int, data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update Fields
    if data.username: user.username = data.username
    if data.full_name: user.full_name = data.full_name
    if data.email: user.email = data.email
    if data.phone: user.phone = data.phone
    if data.profile_image: user.profile_image = data.profile_image
    
    # Handle Password Change
    if data.password:
        user.hashed_password = hash_password(data.password)

    db.commit()
    db.refresh(user)
    return {"message": "Profile updated successfully"}

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(400, "Username taken")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "Email registered")
    
    new_user = User(
        username=user.username, full_name=user.full_name, email=user.email,
        phone=user.phone, hashed_password=hash_password(user.password),
        role=user.role if user.role else "customer"
    )
    db.add(new_user)
    db.commit()
    return {"message": "Registration successful"}

@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).options(defer(User.profile_image)).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    restaurant_id = None
    if user.role == "restaurant":
        res = db.query(Restaurant).filter(Restaurant.email == user.email).options(load_only(Restaurant.id)).first()
        if res: restaurant_id = res.id

    token = jwt.encode({
        "sub": user.username, "id": user.id, "role": user.role,
        "restaurant_id": restaurant_id, "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token, "token_type": "bearer", "role": user.role, 
            "username": user.username, "user_id": user.id, "restaurant_id": restaurant_id}

@app.get("/api/restaurant/me")
def get_my_profile(res: Restaurant = Depends(get_current_restaurant), db: Session = Depends(get_db)):
    full_res = db.query(Restaurant).filter(Restaurant.id == res.id).first()
    user = db.query(User).filter(User.email == full_res.email).first()
    return {
        "id": full_res.id, "name": full_res.name, "email": full_res.email, "address": full_res.address,
        "is_active": full_res.is_active, "profile_image": full_res.profile_image,
        "username": user.username if user else None
    }

@app.put("/api/restaurant/update")
async def update_restaurant_profile(
    bg_tasks: BackgroundTasks, 
    name: str = Form(...), 
    email: str = Form(...), 
    address: str = Form(...),
    password: Optional[str] = Form(None), 
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    res: Restaurant = Depends(get_current_restaurant)
):
    # 1. Fetch the restaurant record and the corresponding user record
    full_res = db.query(Restaurant).filter(Restaurant.id == res.id).first()
    # Find the user based on the restaurant's email to sync data
    user = db.query(User).filter(User.email == full_res.email).first()
    
    # 2. Update basic information in both tables
    full_res.name = name
    full_res.email = email
    full_res.address = address
    if user: 
        user.email = email
        user.full_name = name # Syncing name for consistency

    # 3. Handle Password Updates
    if password:
        hashed = hash_password(password)
        full_res.password = hashed
        if user: 
            user.hashed_password = hashed

    # 4. CRITICAL FIX: Update profile image in BOTH tables
    if profile_image:
        content = await profile_image.read()
        # Encode image to Base64
        encoded_image = f"data:{profile_image.content_type};base64,{base64.b64encode(content).decode('utf-8')}"
        
        # Update Restaurant table (affects Restaurant List)
        full_res.profile_image = encoded_image
        
        # Update User table (affects Navbar/User Profile)
        if user:
            user.profile_image = encoded_image

    # 5. Commit changes to the database
    db.commit()
    
    # Background task for email remains the same
    bg_tasks.add_task(
        send_update_email, 
        email, 
        name, 
        user.username if user else "Partner", 
        address, 
        password, 
        full_res.profile_image
    )
    
    return {"message": "Restaurant profile and User account updated successfully"}

# ---------------- RIDER REGISTRATION LOGIC ----------------
@app.post("/api/rider-request")
def submit_rider_request(request: RiderRequestCreate, db: Session = Depends(get_db)):
    if db.query(RiderRequest).filter(RiderRequest.email == request.email).first():
        raise HTTPException(status_code=400, detail="Application with this email already exists.")

    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_request = RiderRequest(
        full_name=request.fullName,
        email=request.email,
        phone=request.phone,
        city=request.city,
        vehicle_type=request.vehicleType,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return {"message": "Rider Application Received!", "id": new_request.id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)