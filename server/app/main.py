# from typing import List, Optional
# from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
# from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles  
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext
# from datetime import datetime, timedelta, timezone
# from jose import jwt, JWTError
# import os
# import shutil 
# from dotenv import load_dotenv

# # --- INTERNAL IMPORTS ---
# from app.db.session import engine, Base, get_db
# from app.models.user import User, Restaurant
# from app.schemas.user import UserCreate, UserUpdate, TokenResponse
# from app.routes import restaurant
# from app.models.restaurant_request import RestaurantRequest  
# from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse
# from app.routes import admin
# from app.routes import menu

# # --- IMPORT EMAIL FUNCTION ---
# from app.routes.admin import send_update_email

# load_dotenv()

# # ---------------- CONFIGURATION ----------------
# SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
# ALGORITHM = "HS256"
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# app = FastAPI(title="Crave API")

# # ---------------- MIDDLEWARE (CORS) ----------------
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ---------------- STATIC FILES (IMAGES) ----------------
# if not os.path.exists("uploads"):
#     os.makedirs("uploads")

# app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# # ---------------- ROUTERS ----------------
# Base.metadata.create_all(bind=engine)
# app.include_router(restaurant.router)
# app.include_router(menu.router)
# app.include_router(admin.router)

# # ---------------- HELPERS ----------------
# def verify_password(plain, hashed):
#     return pwd_context.verify(plain, hashed)

# def hash_password(password):
#     return pwd_context.hash(password)

# # ---------------- AUTHENTICATION ----------------

# @app.post("/register")
# def register(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.username == user.username).first():
#         raise HTTPException(status_code=400, detail="Username already taken")
    
#     if db.query(User).filter(User.email == user.email).first():
#         raise HTTPException(status_code=400, detail="Email already registered")

#     new_user = User(
#         username=user.username,
#         full_name=user.full_name,
#         email=user.email,
#         phone=user.phone,
#         hashed_password=hash_password(user.password),
#         role=user.role if user.role else "customer",
#         profile_image=getattr(user, 'profile_image', "https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
#     )
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return {"message": "Registration successful"}

# @app.post("/login", response_model=TokenResponse)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == form_data.username).first()
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     restaurant_id = None
#     if user.role == "restaurant":
#         restaurant_record = db.query(Restaurant).filter(Restaurant.email == user.email).first()
#         if restaurant_record:
#             restaurant_id = restaurant_record.id

#     payload = {
#         "sub": user.username,
#         "id": user.id,
#         "role": user.role,
#         "restaurant_id": restaurant_id,
#         "exp": datetime.now(timezone.utc) + timedelta(hours=2)
#     }
#     token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "role": user.role,
#         "username": user.username,
#         "user_id": user.id,
#         "restaurant_id": restaurant_id
#     }

# # ---------------- AUTH DEPENDENCIES ----------------

# def get_current_user(token: str = Depends(oauth2_scheme)):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid session")

# def get_current_restaurant(
#     current_user: dict = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     if current_user["role"] != "restaurant":
#         raise HTTPException(status_code=403, detail="Not authorized as a restaurant")
    
#     res_id = current_user.get("restaurant_id")
#     if not res_id:
#         raise HTTPException(status_code=404, detail="Restaurant ID not found in token")

#     restaurant = db.query(Restaurant).filter(Restaurant.id == res_id).first()
#     if not restaurant:
#         raise HTTPException(status_code=404, detail="Restaurant not found")
    
#     return restaurant

# @app.get("/admin/dashboard")
# def admin_dashboard(current_user=Depends(get_current_user)):
#     if current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Unauthorized")
#     return {"stats": "Admin Data"}

# # ---------------- RESTAURANT PROFILE & IMAGE UPLOAD ----------------

# @app.get("/api/restaurant/me")
# def get_my_restaurant_profile(
#     current_restaurant: Restaurant = Depends(get_current_restaurant),
#     db: Session = Depends(get_db)
# ):
#     linked_user = db.query(User).filter(User.email == current_restaurant.email).first()
    
#     return {
#         "id": current_restaurant.id,
#         "name": current_restaurant.name,
#         "email": current_restaurant.email,
#         "address": current_restaurant.address,
#         "is_active": current_restaurant.is_active,
#         "profile_image": current_restaurant.profile_image,
#         "username": linked_user.username if linked_user else None
#     }

# # --- UPDATE PROFILE ENDPOINT (WITH BACKGROUND EMAIL) ---
# @app.put("/api/restaurant/update")
# def update_restaurant_profile_endpoint(
#     background_tasks: BackgroundTasks, 
#     username: Optional[str] = Form(None),
#     name: str = Form(...),
#     email: str = Form(...),
#     address: str = Form(...),
#     password: Optional[str] = Form(None),
#     profile_image: Optional[UploadFile] = File(None),
#     db: Session = Depends(get_db),
#     current_restaurant: Restaurant = Depends(get_current_restaurant)
# ):
#     # 1. Find Linked User Account BEFORE changing email
#     linked_user = db.query(User).filter(User.email == current_restaurant.email).first()

#     # 2. Update Restaurant Table
#     current_restaurant.name = name
#     current_restaurant.email = email
#     current_restaurant.address = address
    
#     # 3. Update User Table (Sync Credentials)
#     if linked_user:
#         linked_user.email = email 
        
#         if username and username != linked_user.username:
#              if db.query(User).filter(User.username == username).first():
#                  raise HTTPException(status_code=400, detail="Username already taken")
#              linked_user.username = username

#         if password and len(password) > 0:
#             new_hashed = hash_password(password)
#             current_restaurant.password = new_hashed
#             linked_user.hashed_password = new_hashed

#     # 4. Handle Image Upload
#     if profile_image:
#         file_extension = profile_image.filename.split(".")[-1]
#         filename = f"res_{current_restaurant.id}_profile.{file_extension}"
#         file_path = f"uploads/{filename}"
#         with open(file_path, "wb") as buffer:
#             shutil.copyfileobj(profile_image.file, buffer)
#         current_restaurant.profile_image = f"http://localhost:8000/uploads/{filename}"

#     db.commit()
#     db.refresh(current_restaurant)
    
#     # --- 5. SEND EMAIL IN BACKGROUND ---
#     final_username = linked_user.username if linked_user else "Restaurant Partner"
    
#     # Get the image URL (if it exists) to send in email
#     current_image_url = current_restaurant.profile_image

#     background_tasks.add_task(
#         send_update_email, 
#         email,             # New Email
#         name,              # Name
#         final_username,    # Username
#         address,           # Address
#         current_image_url  # <--- PASS IMAGE URL HERE
#     )

#     return {
#         "id": current_restaurant.id,
#         "name": current_restaurant.name,
#         "email": current_restaurant.email,
#         "address": current_restaurant.address,
#         "profile_image": current_restaurant.profile_image,
#         "username": final_username
#     }

# # ---------------- RESTAURANT REGISTRATION LOGIC ----------------

# @app.post("/api/restaurant-request")
# def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
#     if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first():
#         raise HTTPException(status_code=400, detail="A request with this email already exists.")

#     if db.query(Restaurant).filter(Restaurant.email == request.email).first():
#         raise HTTPException(status_code=400, detail="This restaurant is already active.")

#     new_request = RestaurantRequest(
#         restaurant_name=request.restaurantName,
#         owner_name=request.ownerName,
#         email=request.email,
#         phone=request.phone,
#         address=request.address,
#         status="approved"
#     )
#     db.add(new_request)

#     hashed_default_pass = hash_password("123456") 
    
#     new_restaurant = Restaurant(
#         name=request.restaurantName,
#         email=request.email,
#         password=hashed_default_pass,
#         address=request.address,
#         is_active=True 
#     )
#     db.add(new_restaurant)
#     db.commit()
#     db.refresh(new_restaurant)

#     return {"message": "Restaurant Application Auto-Approved!", "id": new_restaurant.id}

# @app.get("/restaurants")
# def get_all_restaurants(db: Session = Depends(get_db)):
#     return db.query(Restaurant).filter(Restaurant.is_active == True).all()

# # --- UTILS ---
# @app.get("/users/{user_id}")
# def get_user_profile(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user

# @app.put("/users/{user_id}")
# def update_user_profile(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
#     db_user_query = db.query(User).filter(User.id == user_id)
#     db_user = db_user_query.first()
#     if not db_user:
#         raise HTTPException(status_code=404, detail="User not found")
#     update_data = data.dict(exclude_unset=True)
#     db_user_query.update(update_data, synchronize_session=False)
#     db.commit()
#     db.refresh(db_user)
#     return {"message": "Success", "user": db_user}

# @app.get("/api/debug/reset-user/{username}")
# def reset_broken_user(username: str, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == username).first()
#     if not user: return {"error": "User not found"}
#     try:
#         req = db.query(RestaurantRequest).filter(RestaurantRequest.email == user.email).first()
#         if req: req.status = "pending"
#     except: pass 
#     db.delete(user)
#     db.commit()
#     return {"message": f"User '{username}' reset."}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
import base64 
from dotenv import load_dotenv

# --- INTERNAL IMPORTS ---
from app.db.session import engine, Base, get_db
from app.models.user import User, Restaurant
from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.routes import restaurant
from app.models.restaurant_request import RestaurantRequest  
from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse
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

# ---------------- MIDDLEWARE (CORS) ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROUTERS ----------------
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
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    restaurant_id = None
    if user.role == "restaurant":
        restaurant_record = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if restaurant_record:
            restaurant_id = restaurant_record.id

    payload = {
        "sub": user.username,
        "id": user.id,
        "role": user.role,
        "restaurant_id": restaurant_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username,
        "user_id": user.id,
        "restaurant_id": restaurant_id
    }

# ---------------- AUTH DEPENDENCIES ----------------

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")

def get_current_restaurant(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Not authorized as a restaurant")
    
    res_id = current_user.get("restaurant_id")
    if not res_id:
        raise HTTPException(status_code=404, detail="Restaurant ID not found in token")

    restaurant = db.query(Restaurant).filter(Restaurant.id == res_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    return restaurant

@app.get("/admin/dashboard")
def admin_dashboard(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {"stats": "Admin Data"}

# ---------------- RESTAURANT PROFILE & IMAGE UPLOAD ----------------

@app.get("/api/restaurant/me")
def get_my_restaurant_profile(
    current_restaurant: Restaurant = Depends(get_current_restaurant),
    db: Session = Depends(get_db)
):
    linked_user = db.query(User).filter(User.email == current_restaurant.email).first()
    
    return {
        "id": current_restaurant.id,
        "name": current_restaurant.name,
        "email": current_restaurant.email,
        "address": current_restaurant.address,
        "is_active": current_restaurant.is_active,
        "profile_image": current_restaurant.profile_image,
        "username": linked_user.username if linked_user else None
    }

# --- UPDATE PROFILE (FIXED INDENTATION) ---
@app.put("/api/restaurant/update")
async def update_restaurant_profile_endpoint(
    background_tasks: BackgroundTasks, 
    username: Optional[str] = Form(None),
    name: str = Form(...),
    email: str = Form(...),
    address: str = Form(...),
    password: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    # 1. Sync User Account
    linked_user = db.query(User).filter(User.email == current_restaurant.email).first()

    # 2. Update Basic Info
    current_restaurant.name = name
    current_restaurant.email = email
    current_restaurant.address = address
    
    # 3. Update User Info
    if linked_user:
        linked_user.email = email 
        
        if username and username != linked_user.username:
             if db.query(User).filter(User.username == username).first():
                 raise HTTPException(status_code=400, detail="Username already taken")
             linked_user.username = username

        if password and len(password) > 0:
            new_hashed = hash_password(password)
            current_restaurant.password = new_hashed
            linked_user.hashed_password = new_hashed

    # 4. Handle Image (CONVERT TO BASE64 & SAVE TO DB)
    if profile_image:
        contents = await profile_image.read()
        encoded_image = base64.b64encode(contents).decode("utf-8")
        content_type = profile_image.content_type
        db_image_string = f"data:{content_type};base64,{encoded_image}"
        current_restaurant.profile_image = db_image_string

    db.commit()
    db.refresh(current_restaurant)
    
    # 5. Send Email (INDENTED CORRECTLY NOW)
    final_username = linked_user.username if linked_user else "Restaurant Partner"
    
    background_tasks.add_task(
        send_update_email, 
        email, 
        name, 
        final_username, 
        address, 
        password,
        current_restaurant.profile_image
    )

    return {
        "id": current_restaurant.id,
        "name": current_restaurant.name,
        "email": current_restaurant.email,
        "address": current_restaurant.address,
        "profile_image": current_restaurant.profile_image,
        "username": final_username
    }

# ---------------- RESTAURANT REGISTRATION LOGIC ----------------

@app.post("/api/restaurant-request")
def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
    if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already exists.")

    if db.query(Restaurant).filter(Restaurant.email == request.email).first():
        raise HTTPException(status_code=400, detail="Restaurant already active.")

    new_request = RestaurantRequest(
        restaurant_name=request.restaurantName,
        owner_name=request.ownerName,
        email=request.email,
        phone=request.phone,
        address=request.address,
        status="approved"
    )
    db.add(new_request)

    hashed_default_pass = hash_password("123456") 
    
    new_restaurant = Restaurant(
        name=request.restaurantName,
        email=request.email,
        password=hashed_default_pass,
        address=request.address,
        is_active=True 
    )
    db.add(new_restaurant)
    db.commit()
    db.refresh(new_restaurant)

    return {"message": "Auto-Approved!", "id": new_restaurant.id}

@app.get("/restaurants")
def get_all_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).filter(Restaurant.is_active == True).all()

# Add this to your backend (main.py or restaurant.py)
@app.get("/restaurants/{restaurant_id}")
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant
    
# --- UTILS ---
@app.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}")
def update_user_profile(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    db_user_query = db.query(User).filter(User.id == user_id)
    db_user = db_user_query.first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    update_data = data.dict(exclude_unset=True)
    db_user_query.update(update_data, synchronize_session=False)
    db.commit()
    db.refresh(db_user)
    return {"message": "Success", "user": db_user}

@app.get("/api/debug/reset-user/{username}")
def reset_broken_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user: return {"error": "User not found"}
    try:
        req = db.query(RestaurantRequest).filter(RestaurantRequest.email == user.email).first()
        if req: req.status = "pending"
    except: pass 
    db.delete(user)
    db.commit()
    return {"message": f"User '{username}' reset."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)