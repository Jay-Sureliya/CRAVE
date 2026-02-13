import httpx
import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func
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
from app.models.cart import Cart  # <--- ADDED IMPORT

# 2. Import Schemas
from app.schemas.rider_request import RiderRequestCreate
from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse

# 3. Import Routes
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
    allow_origins=["http://localhost:5173","http://127.0.0.1:5173", "http://localhost:8000"], 
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
class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

class UserProfileUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    password: Optional[str] = None 

class CartAdd(BaseModel): # <--- ADDED MODEL
    menu_item_id: int
    quantity: int
    customization: Optional[str] = "[]" # Receive addons
    total_price: Optional[float] = 0.0

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
#  FAVORITES API (ORDERED TO FIX 405 ERROR)
# ==============================================================================

@app.get("/api/favorites/list") # <--- ADDED LIST ROUTE FIRST
def get_favorites_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    fav_items = db.query(MenuItem).join(
        Favorite, Favorite.menu_item_id == MenuItem.id
    ).filter(
        Favorite.user_id == current_user["id"]
    ).all()
    return format_items(fav_items)

@app.get("/api/favorites")
def get_user_favorites(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    favs = db.query(Favorite.menu_item_id).filter(Favorite.user_id == current_user["id"]).all()
    return [f[0] for f in favs]

@app.post("/api/favorites/{item_id}")
def toggle_favorite(item_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
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
#  CART API ROUTES (FIXES 404 ERROR)
# ==============================================================================

@app.get("/api/cart")
def get_user_cart(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_items = db.query(Cart).filter(Cart.user_id == current_user["id"]).all()
    
    return [
        {
            "id": item.menu_item.id,
            "name": item.menu_item.name,
            # RETURN THE SAVED CART PRICE, NOT THE MENU PRICE
            "price": item.price if item.price > 0 else item.menu_item.price,
            "image": item.menu_item.image,
            "description": item.menu_item.description,
            "quantity": item.quantity,
            "cart_id": item.id,
            "addons": item.addons # Return addons so frontend can display "Cheese: +10"
        }
        for item in cart_items if item.menu_item
    ]

@app.post("/api/cart")
def update_cart_item(data: CartAdd, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    
    # Calculate Unit Price (Total / Qty)
    unit_price = 0
    if data.total_price and data.quantity > 0:
        unit_price = data.total_price / data.quantity

    cart_item = db.query(Cart).filter(
        Cart.user_id == user_id, 
        Cart.menu_item_id == data.menu_item_id
    ).first()

    if cart_item:
        # Update existing item
        new_qty = cart_item.quantity + data.quantity
        if new_qty > 0:
            cart_item.quantity = new_qty
            # Update price/addons if new ones are sent
            if unit_price > 0: cart_item.price = unit_price
            if data.customization: cart_item.addons = data.customization
        else:
            db.delete(cart_item)
    elif data.quantity > 0:
        # Create new item with custom price
        new_item = Cart(
            user_id=user_id, 
            menu_item_id=data.menu_item_id, 
            quantity=data.quantity,
            price=unit_price, # Save the custom price (130)
            addons=data.customization # Save the addons
        )
        db.add(new_item)
    
    db.commit()
    return {"message": "Cart updated"}

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

# ---------------- RESTAURANT REGISTRATION LOGIC ----------------

@app.post("/api/restaurant-request")
def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
    if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first():
        raise HTTPException(status_code=400, detail="Application with this email already exists.")
    if db.query(Restaurant).filter(Restaurant.email == request.email).first():
        raise HTTPException(status_code=400, detail="Restaurant is already active.")

    new_request = RestaurantRequest(
        restaurant_name=request.restaurantName,
        owner_name=request.ownerName,
        email=request.email,
        phone=request.phone,
        address=request.address,
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return {"message": "Application submitted successfully!", "id": new_request.id}

# ---------------- RESTAURANT LIST API ----------------

@app.get("/restaurants")
def get_all_restaurants(db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
    response_data = []
    for r in restaurants:
        cats = db.query(MenuItem.category).filter(MenuItem.restaurant_id == r.id).distinct().limit(2).all()
        cuisine_str = " • ".join([c[0] for c in cats if c[0]]) if cats else "Multi-Cuisine" 
        response_data.append({
            "id": r.id, "name": r.name, "address": r.address, "rating": "4.5",
            "is_active": r.is_active, "profile_image": r.profile_image, "cuisine": cuisine_str 
        })
    return response_data

@app.get("/api/restaurant/image/{restaurant_id}")
def get_restaurant_image(restaurant_id: int, db: Session = Depends(get_db)):
    res = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not res or not res.profile_image: return Response(status_code=404)
    try:
        img_str = res.profile_image
        if "base64," in img_str: _, img_str = img_str.split("base64,", 1)
        return Response(content=base64.b64decode(img_str), media_type="image/jpeg", 
                        headers={"Cache-Control": "public, max-age=31536000"})
    except: return Response(status_code=500)

@app.get("/restaurants/{restaurant_id}")
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant: raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

# --- USER PROFILE ROUTES ---

@app.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    profile_image = user.profile_image
    if user.role == "restaurant":
        res_data = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if res_data: profile_image = res_data.profile_image
    return {
        "id": user.id, "username": user.username, "full_name": user.full_name,
        "email": user.email, "phone": user.phone, "role": user.role, "profile_image": profile_image
    }

@app.put("/users/{user_id}")
def update_user_profile(user_id: int, data: UserProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if data.username: user.username = data.username
    if data.full_name: user.full_name = data.full_name
    if data.email: user.email = data.email
    if data.phone: user.phone = data.phone
    if data.profile_image: user.profile_image = data.profile_image
    if data.password: user.hashed_password = hash_password(data.password)
    db.commit()
    return {"message": "Profile updated successfully"}

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first(): raise HTTPException(400, "Username taken")
    if db.query(User).filter(User.email == user.email).first(): raise HTTPException(400, "Email registered")
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
        res = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if res: restaurant_id = res.id
    token = jwt.encode({
        "sub": user.username, "id": user.id, "role": user.role,
        "restaurant_id": restaurant_id, "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": user.role, 
            "username": user.username, "user_id": user.id, "restaurant_id": restaurant_id}

@app.get("/api/restaurant/me")
def get_my_profile(res: Restaurant = Depends(get_current_restaurant), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == res.email).first()
    return {
        "id": res.id, "name": res.name, "email": res.email, "address": res.address,
        "is_active": res.is_active, "profile_image": res.profile_image,
        "username": user.username if user else None
    }


class GoogleAuthRequest(BaseModel):
    token: str

@app.post("/auth/google")
async def google_login(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    # 1. Verify the token by calling Google's API
    google_user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {auth_data.token}"}

    async with httpx.AsyncClient() as client:
        response = await client.get(google_user_info_url, headers=headers)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google Token")

    # 2. Get User Data from Google
    google_data = response.json()
    email = google_data.get("email")
    
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    # 3. Check if User Exists in your Database
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # --- SCENARIO A: NEW USER (REGISTER THEM) ---
        # Basic username generation (you might want to make this more robust later)
        base_username = email.split("@")[0]
        
        # Check if username exists, if so, append random numbers or handle it
        # For now, we assume it's unique or let the DB throw an error
        
        new_user = User(
            username=base_username, 
            email=email,
            full_name=google_data.get("name", "Unknown"),
            role="customer", 
            hashed_password=hash_password("GOOGLE_LOGIN_NO_PASSWORD"), # Use your hash_password helper
            phone="" # Optional: Empty phone for now
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    
    # --- SCENARIO B: EXISTING USER (LOG THEM IN) ---
    
    # 4. Create your App's JWT Token
    # FIX: We use jwt.encode directly here, just like in your /login endpoint
    access_token_expires = datetime.now(timezone.utc) + timedelta(hours=2)
    
    access_token = jwt.encode({
        "sub": user.username, 
        "id": user.id, 
        "role": user.role,
        "restaurant_id": None, # Google users are usually customers
        "exp": access_token_expires
    }, SECRET_KEY, algorithm=ALGORITHM)

    # 5. Return the Token Response
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "restaurant_id": None
    }


# --- FORGOT PASSWORD UTILS ---
fake_otp_db = {}  # Temporary storage for OTPs

def send_otp_email_smtp(to_email: str, otp: str):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ Skipped Email: Missing Credentials in .env")
        return

    subject = "Crave Password Reset 🔐"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #ea580c;">Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; width: fit-content;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">Your OTP Code: <span style="color: #ea580c;">{otp}</span></p>
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg["From"] = f"Crave Support <{sender_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ OTP Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email Failed: {e}")
    
# ==============================================================================
#  FORGOT PASSWORD ROUTES
# ==============================================================================

@app.post("/auth/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Check if user exists
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    # 2. Generate 6-digit OTP
    otp = "".join(random.choices(string.digits, k=6))
    
    # 3. Save OTP to Mock DB (Expires in 10 mins)
    fake_otp_db[request.email] = {
        "otp": otp,
        "expires": datetime.now(timezone.utc) + timedelta(minutes=10)
    }

    # 4. Send Email using Background Task (Non-blocking)
    background_tasks.add_task(send_otp_email_smtp, request.email, otp)

    return {"message": "OTP sent to your email"}


@app.post("/auth/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    email = request.email
    input_otp = request.otp
    new_password = request.new_password

    # 1. Retrieve OTP Record
    record = fake_otp_db.get(email)

    # 2. Validate OTP
    if not record:
        raise HTTPException(status_code=400, detail="No reset request found.")
    
    if record["otp"] != input_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    
    if datetime.now(timezone.utc) > record["expires"]:
        del fake_otp_db[email]
        raise HTTPException(status_code=400, detail="OTP code has expired.")

    # 3. Hash the new password
    hashed_pwd = hash_password(new_password)

    # 4. Update User Table
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.hashed_password = hashed_pwd

    # 5. Update Restaurant Table (if exists) to keep passwords in sync
    restaurant = db.query(Restaurant).filter(Restaurant.email == email).first()
    if restaurant:
        restaurant.password = hashed_pwd

    db.commit()

    # 6. Clean up OTP
    del fake_otp_db[email]

    return {"message": "Password reset successfully"}


@app.put("/api/restaurant/update")
async def update_restaurant_profile(
    bg_tasks: BackgroundTasks, name: str = Form(...), email: str = Form(...), 
    address: str = Form(...), username: str = Form(...), password: Optional[str] = Form(None), 
    profile_image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), 
    res: Restaurant = Depends(get_current_restaurant)
):
    user = db.query(User).filter(User.email == res.email).first()
    res.name, res.email, res.address = name, email, address
    if user: user.email, user.full_name, user.username = email, name, username 
    if password and password.strip():
        hashed = hash_password(password)
        if user: user.hashed_password = hashed
        res.password = hashed
    if profile_image:
        content = await profile_image.read()
        encoded = f"data:{profile_image.content_type};base64,{base64.b64encode(content).decode('utf-8')}"
        res.profile_image = encoded
        if user: user.profile_image = encoded
    db.commit()
    bg_tasks.add_task(send_update_email, email, name, username, address, password, res.profile_image)
    return {"message": "Profile updated", "profile_image": res.profile_image}

@app.post("/api/rider-request")
def submit_rider_request(request: RiderRequestCreate, db: Session = Depends(get_db)):
    new_request = RiderRequest(
        full_name=request.fullName, email=request.email, phone=request.phone,
        city=request.city, vehicle_type=request.vehicleType, status="pending"
    )
    db.add(new_request)
    db.commit()
    return {"message": "Rider Application Received!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)