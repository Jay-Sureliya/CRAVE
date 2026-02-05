from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text 
from sqlalchemy.orm import Session, defer, load_only
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
import base64 
from dotenv import load_dotenv
from pydantic import BaseModel # <--- ADDED THIS IMPORT

# --- INTERNAL IMPORTS ---
from app.db.session import engine, Base, get_db

# 1. Import Models
from app.models.user import User, Restaurant, Favorite
from app.models.menu import MenuItem 

from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.routes import restaurant
from app.models.restaurant_request import RestaurantRequest  
from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse
from app.routes import admin
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

# ---------------- HELPERS ----------------
def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def hash_password(password): return pwd_context.hash(password)

# ---------------- PYDANTIC MODELS (LOCALLY DEFINED FOR SAFETY) ----------------
# We define this here to ensure the update payload matches exactly what Frontend sends
class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    password: Optional[str] = None # Optional password change

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

@app.get("/api/categories", response_model=List[str])
def get_categories(
    db: Session = Depends(get_db), 
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    try:
        sql = text("SELECT DISTINCT category FROM menu_items WHERE restaurant_id = :rid AND category IS NOT NULL")
        result = db.execute(sql, {"rid": current_restaurant.id})
        return [row[0] for row in result]
    except Exception:
        return []

@app.get("/api/menu")
def get_my_menu_items(
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == current_restaurant.id).all()
    return format_items(items)

@app.get("/api/menu/{restaurant_id}")
def get_restaurant_menu(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return format_items(items)

@app.post("/api/menu")
async def create_menu_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    discountPrice: Optional[float] = Form(None), 
    type: str = Form(...),
    isAvailable: str = Form(...), 
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant) 
):
    is_available_bool = isAvailable.lower() == 'true'
    image_data = None
    if image:
        contents = await image.read()
        encoded = base64.b64encode(contents).decode("utf-8")
        image_data = f"data:{image.content_type};base64,{encoded}"

    new_item = MenuItem(
        name=name,
        category=category,
        description=description,
        price=price,
        discount_price=discountPrice,
        is_veg=(type == "veg"),
        is_available=is_available_bool,
        image=image_data,
        restaurant_id=current_restaurant.id
    )
    db.add(new_item)
    db.commit()
    return {"message": "Item created", "id": new_item.id}

@app.put("/api/menu/{item_id}")
async def update_menu_item(
    item_id: int,
    name: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    discountPrice: Optional[float] = Form(None),
    type: Optional[str] = Form(None),
    isAvailable: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == current_restaurant.id).first()
    if not item: raise HTTPException(status_code=404, detail="Item not found")

    if name: item.name = name
    if category: item.category = category
    if description: item.description = description
    if price is not None: item.price = price
    if discountPrice is not None: item.discount_price = discountPrice
    if type: item.is_veg = (type == "veg")
    if isAvailable is not None: item.is_available = (isAvailable.lower() == 'true')

    if image:
        contents = await image.read()
        encoded = base64.b64encode(contents).decode("utf-8")
        item.image = f"data:{image.content_type};base64,{encoded}"

    db.commit()
    return {"message": "Item updated"}

@app.delete("/api/menu/{item_id}")
def delete_menu_item(
    item_id: int, 
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == current_restaurant.id).first()
    if not item: raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

# ---------------- RESTAURANT & USER ROUTES ----------------

@app.get("/restaurants")
def get_all_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).filter(Restaurant.is_active == True).all()

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
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "profile_image": user.profile_image
    }

# *** THIS IS THE MISSING ENDPOINT THAT FIXES THE 405 ERROR ***
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
    name: str = Form(...), email: str = Form(...), address: str = Form(...),
    password: Optional[str] = Form(None), profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), res: Restaurant = Depends(get_current_restaurant)
):
    full_res = db.query(Restaurant).filter(Restaurant.id == res.id).first()
    user = db.query(User).filter(User.email == full_res.email).first()
    
    full_res.name = name
    full_res.email = email
    full_res.address = address
    if user: user.email = email
    
    if password:
        hashed = hash_password(password)
        full_res.password = hashed
        if user: user.hashed_password = hashed

    if profile_image:
        c = await profile_image.read()
        full_res.profile_image = f"data:{profile_image.content_type};base64,{base64.b64encode(c).decode('utf-8')}"

    db.commit()
    bg_tasks.add_task(send_update_email, email, name, user.username if user else "Partner", address, password, full_res.profile_image)
    return {"message": "Updated"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)