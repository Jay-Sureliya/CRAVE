# from fastapi import FastAPI, Depends, HTTPException
# from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext
# from datetime import datetime, timedelta
# from jose import jwt, JWTError
# import secrets # Used to generate random passwords
# import smtplib
# import os
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from dotenv import load_dotenv
# load_dotenv() 

# # --- IMPORTS FROM YOUR APP ---
# from app.db.session import engine, Base, get_db
# from app.models.user import User
# # Make sure you created this file in the previous step:
# from app.models.request import RestaurantRequest 
# from app.schemas.user import UserCreate
# # Make sure you created this file in the previous step:
# from app.schemas.request import RequestCreate 
# from app.routes import restaurant

# # ---------------- CONFIG ----------------
# SECRET_KEY = "mysecretkey"
# ALGORITHM = "HS256"
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# # ---------------- APP ----------------
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Base.metadata.create_all(bind=engine)

# app.include_router(restaurant.router)



# # ---------------- HELPERS ----------------
# def generate_username(name: str):
#     base = name.lower().replace(" ", "")
#     return f"{base}_{secrets.randbelow(1000)}"

# def verify_password(plain, hashed):
#     return pwd_context.verify(plain, hashed)

# def hash_password(password):
#     return pwd_context.hash(password)

# # ---------------- AUTH ----------------
# @app.post("/register")
# def register(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.username == user.username).first():
#         raise HTTPException(status_code=400, detail="User exists")

#     new_user = User(
#         username=user.username,
#         full_name=user.full_name,
#         hashed_password=hash_password(user.password),
#         role=user.role
#     )

#     db.add(new_user)
#     db.commit()
#     return {"message": "User created"}

# @app.post("/login")
# def login(
#     form_data: OAuth2PasswordRequestForm = Depends(),
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(User.username == form_data.username).first()

#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     payload = {
#         "sub": user.username,
#         "role": user.role,
#         "exp": datetime.utcnow() + timedelta(hours=2)
#     }

#     token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

#     print("USERNAME:", form_data.username)
#     print("PASSWORD:", form_data.password)
#     print("HASHED:", user.hashed_password)

#     return {
#         "access_token": token,
#         "token_type": "bearer",
#         "role": user.role
#     }

# # ---------------- DEPENDENCIES ----------------
# def get_current_user(token: str = Depends(oauth2_scheme)):
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")

# def admin_only(user=Depends(get_current_user)):
#     if user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Admin only")

# def restaurant_only(user=Depends(get_current_user)):
#     if user["role"] != "restaurant":
#         raise HTTPException(status_code=403, detail="Restaurant only")

# # ---------------- NEW: RESTAURANT REQUESTS ----------------

# # 1. PUBLIC: Submit a Request
# @app.post("/api/restaurant-request")
# def submit_request(request: RequestCreate, db: Session = Depends(get_db)):
#     db_request = RestaurantRequest(
#         restaurant_name=request.restaurantName,
#         owner_name=request.ownerName,
#         email=request.email,
#         phone=request.phone,
#         address=request.address,
#         status="pending"
#     )
#     db.add(db_request)
#     db.commit()
#     return {"message": "Application submitted successfully"}

# # 2. ADMIN: Get All Pending Requests
# @app.get("/admin/requests")
# def get_requests(db: Session = Depends(get_db), dep=Depends(admin_only)):
#     # Only fetch status='pending'
#     return db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").all()

# # 3. ADMIN: Approve Request
# # 3. ADMIN: Approve Request & Send REAL Email
# # 3. ADMIN: Approve Request & Send REAL Email
# @app.post("/admin/approve/{request_id}")
# def approve_request(request_id: int, db: Session = Depends(get_db), dep=Depends(admin_only)):
#     # A. Find the request
#     req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
#     if not req:
#         raise HTTPException(status_code=404, detail="Request not found")
    
#     # --- NEW: GENERATE SHORT USERNAME ---
#     # 1. Remove spaces from restaurant name and lowercase it (max 10 chars)
#     clean_name = req.restaurant_name.replace(" ", "").lower()[:10]
    
#     # 2. Add a random 2-digit number (e.g., "tastybites45")
#     # Using secrets.randbelow(90) + 10 ensures it's always 2 digits (10-99)
#     random_num = secrets.randbelow(90) + 10 
#     generated_username = f"{clean_name}{random_num}"

#     # B. Generate Random Password (8 chars)
#     temp_password = secrets.token_hex(4)

#     # C. Check if this specific username already exists
#     if db.query(User).filter(User.username == generated_username).first():
#         # If taken, try adding a 4-digit number instead
#         generated_username = f"{clean_name}{secrets.randbelow(9000) + 1000}"

#     # D. Create the User Account
#     new_user = User(
#         username=generated_username,  # <--- USING NEW SHORT NAME
#         full_name=req.owner_name,
#         hashed_password=hash_password(temp_password),
#         role="restaurant"
#     )
    
#     # E. Update Request Status
#     req.status = "approved"
    
#     db.add(new_user)
#     db.commit()

#     # --- F. SEND REAL EMAIL ---
#     SENDER_EMAIL = os.getenv("MAIL_USERNAME")
#     SENDER_PASSWORD = os.getenv("MAIL_PASSWORD")

#     try:
#         # Create Email Content
#         msg = MIMEMultipart()
#         msg['From'] = SENDER_EMAIL
#         msg['To'] = req.email
#         msg['Subject'] = "Welcome to Crave! - Login Credentials"

#         body = f"""
#         Hello {req.owner_name},

#         Congratulations! Your restaurant '{req.restaurant_name}' has been approved to join Crave.

#         Here are your login details:
#         --------------------------------
#         Username: {generated_username}  
#         Password: {temp_password}
#         --------------------------------

#         Please login and change your password immediately.

#         Welcome to the team!
#         - Crave Admin
#         """
#         msg.attach(MIMEText(body, 'plain'))

#         # Connect to Gmail Server
#         server = smtplib.SMTP('smtp.gmail.com', 587)
#         server.starttls()
#         server.login(SENDER_EMAIL, SENDER_PASSWORD)
#         server.sendmail(SENDER_EMAIL, req.email, msg.as_string())
#         server.quit()
        
#         print(f"Email sent successfully to {req.email}")
#         return {"message": f"Approved! Username: {generated_username}"}

#     except Exception as e:
#         print(f"Failed to send email: {e}")
#         return {"message": f"Approved, but email failed. Username: {generated_username}, Password: {temp_password}"}


# # ---------------- DASHBOARDS ----------------
# @app.get("/admin/dashboard")
# def admin_dashboard(dep=Depends(admin_only)):
#     return {
#         "total_orders": 120,
#         "revenue": 5400,
#         "active_restaurants": 18
#     }

# @app.get("/restaurant/dashboard")
# def restaurant_dashboard(dep=Depends(restaurant_only)):
#     return {
#         "pending_orders": 6,
#         "today_earnings": 950
#     }


from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import secrets
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

# ---------------- IMPORTS ----------------
from app.db.session import engine, Base, get_db
from app.models.user import User
from app.models.restaurant_request import RestaurantRequest
from app.schemas.user import UserCreate
from app.schemas.restaurant_request import RestaurantRequestCreate
from app.routes import restaurant

# ---------------- CONFIG ----------------
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ---------------- APP ----------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(restaurant.router)

# ---------------- HELPERS ----------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# ---------------- AUTH ----------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check username
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check email
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Customer registered successfully"}


@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

# ---------------- AUTH DEPENDENCIES ----------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

def restaurant_only(user=Depends(get_current_user)):
    if user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Restaurant only")

# ---------------- RESTAURANT REQUEST FLOW ----------------

# PUBLIC – Restaurant applies
@app.post("/api/restaurant-request")
def submit_request(
    request: RestaurantRequestCreate,
    db: Session = Depends(get_db)
):
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

    return {"message": "Restaurant request submitted"}

# ADMIN – View pending requests
@app.get("/admin/requests")
def get_pending_requests(
    db: Session = Depends(get_db),
    dep=Depends(admin_only)
):
    return db.query(RestaurantRequest)\
        .filter(RestaurantRequest.status == "pending")\
        .all()

# ADMIN – Approve restaurant
@app.post("/admin/approve/{request_id}")
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    dep=Depends(admin_only)
):
    req = db.query(RestaurantRequest)\
        .filter(RestaurantRequest.id == request_id)\
        .first()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    clean_name = req.restaurant_name.replace(" ", "").lower()[:10]
    random_num = secrets.randbelow(90) + 10
    username = f"{clean_name}{random_num}"
    password = secrets.token_hex(4)

    if db.query(User).filter(User.username == username).first():
        username = f"{clean_name}{secrets.randbelow(9000) + 1000}"

    restaurant_user = User(
        username=username,
        full_name=req.owner_name,
        hashed_password=hash_password(password),
        role="restaurant"
    )

    req.status = "approved"

    db.add(restaurant_user)
    db.commit()

    # SEND EMAIL
    sender = os.getenv("MAIL_USERNAME")
    sender_pass = os.getenv("MAIL_PASSWORD")

    try:
        msg = MIMEMultipart()
        msg["From"] = sender
        msg["To"] = req.email
        msg["Subject"] = "Crave Restaurant Approval"

        body = f"""
Hello {req.owner_name},

Your restaurant "{req.restaurant_name}" has been approved.

Login Credentials:
Username: {username}
Password: {password}

Please change password after login.

- Crave Team
"""
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, sender_pass)
        server.sendmail(sender, req.email, msg.as_string())
        server.quit()

    except Exception as e:
        print("Email failed:", e)

    return {"message": "Restaurant approved", "username": username}

# ---------------- DASHBOARDS ----------------
@app.get("/admin/dashboard")
def admin_dashboard(dep=Depends(admin_only)):
    return {
        "total_orders": 120,
        "revenue": 5400,
        "active_restaurants": 18
    }

@app.get("/restaurant/dashboard")
def restaurant_dashboard(dep=Depends(restaurant_only)):
    return {
        "pending_orders": 6,
        "today_earnings": 950
    }
