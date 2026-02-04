# import os
# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
# from sqlalchemy.orm import Session
# from passlib.context import CryptContext
# from app.db.session import get_db
# from app.models.restaurant_request import RestaurantRequest
# from app.models.user import User, Restaurant

# # --- CONFIGURATION ---
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# router = APIRouter(prefix="/admin", tags=["Admin"])

# # --- HELPER: PASSWORD HASHING ---
# def get_password_hash(password):
#     return pwd_context.hash(password)

# # --- HELPER: EMAIL (Safe Version) ---
# def send_login_email(to_email: str, username: str, password: str):
#     sender_email = os.getenv("MAIL_USERNAME")
#     sender_password = os.getenv("MAIL_PASSWORD")

#     if not sender_email or not sender_password:
#         print("⚠️ Skipped Email: Missing MAIL_USERNAME or MAIL_PASSWORD in .env")
#         return

#     subject = "Your Restaurant Application is Approved! - CRAVE"
#     body = f"""
#     <h2>Welcome to Crave! 🎉</h2>
#     <p>Your application has been approved.</p>
#     <p><strong>Username:</strong> {username}</p>
#     <p><strong>Password:</strong> {password}</p>
#     <p>Please log in and start adding your menu!</p>
#     """

#     msg = MIMEMultipart()
#     msg["From"] = sender_email
#     msg["To"] = to_email
#     msg["Subject"] = subject
#     msg.attach(MIMEText(body, "html"))

#     try:
#         server = smtplib.SMTP("smtp.gmail.com", 587)
#         server.starttls()
#         server.login(sender_email, sender_password)
#         server.sendmail(sender_email, to_email, msg.as_string())
#         server.quit()
#         print(f"✅ Email sent to {to_email}")
#     except Exception as e:
#         print(f"❌ Email Failed (Check Internet/Credentials): {e}")

# # --- ROUTES ---

# @router.get("/dashboard")
# def get_admin_stats(db: Session = Depends(get_db)):
#     # Simple stats for the dashboard
#     return {
#         "stats": {
#             "revenue": "₹0",
#             "total_orders": "0",
#             "active_drivers": "0",
#             "pending_requests": db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").count()
#         }
#     }

# @router.get("/requests")
# def get_pending_requests(db: Session = Depends(get_db)):
#     return db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").all()

# # --- THE FIXED APPROVE ENDPOINT ---
# @router.post("/approve/{request_id}")
# def approve_restaurant(
#     request_id: int, 
#     background_tasks: BackgroundTasks, 
#     db: Session = Depends(get_db)
# ):
#     # 1. Fetch the Request
#     req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
#     if not req:
#         raise HTTPException(status_code=404, detail="Request not found")

#     if req.status == "approved":
#         return {"message": "Already approved"}

#     # 2. Prepare Credentials
#     # Use the part before '@' as username, append '_owner'
#     generated_username = req.email.split("@")[0] + "_owner"
#     temp_password = "Pass" + str(req.id) + "word!" 
#     hashed_pw = get_password_hash(temp_password)

#     # 3. Create/Check USER (Idempotent)
#     existing_user = db.query(User).filter(User.email == req.email).first()
#     if not existing_user:
#         new_user = User(
#             username=generated_username,
#             full_name=req.owner_name,
#             email=req.email,
#             phone=req.phone,
#             hashed_password=hashed_pw,
#             role="restaurant",
#             profile_image="https://cdn-icons-png.flaticon.com/512/1996/1996055.png"
#         )
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
#         print(f"✅ Created User: {generated_username}")
#     else:
#         print(f"⚠️ User already exists: {existing_user.username}")
#         generated_username = existing_user.username # Use existing username for email
#         temp_password = "[Existing Password]"      # Don't overwrite password

#     # 4. Create/Check RESTAURANT (Idempotent - FIXES YOUR ERROR)
#     existing_restaurant = db.query(Restaurant).filter(Restaurant.email == req.email).first()
#     if not existing_restaurant:
#         new_restaurant = Restaurant(
#             name=req.restaurant_name,
#             email=req.email,
#             password=hashed_pw, # Stores password hash (optional redundancy)
#             is_active=True,
#             # map other fields if your model has them
#         )
#         db.add(new_restaurant)
#         db.commit()
#         print(f"✅ Created Restaurant Profile: {req.restaurant_name}")
#     else:
#         print(f"⚠️ Restaurant Profile already exists for {req.email}. Skipping creation.")

#     # 5. Finalize Request
#     req.status = "approved"
#     db.commit()

#     # 6. Send Email (only if we just created the user)
#     if not existing_user:
#         background_tasks.add_task(send_login_email, req.email, generated_username, temp_password)

#     return {"message": "Request approved successfully", "username": generated_username}


import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel

# --- INTERNAL IMPORTS ---
from app.db.session import get_db
from app.models.restaurant_request import RestaurantRequest
from app.models.user import User, Restaurant

# --- CONFIGURATION ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/admin", tags=["Admin"])

# ===========================
# 1. PYDANTIC SCHEMAS (MOVED TO TOP)
# ===========================

class AdminUserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None
    role: str
    phone: Optional[str] = None
    
    class Config:
        from_attributes = True

class AdminRequestResponse(BaseModel):
    id: int
    restaurant_name: str
    owner_name: str
    email: str
    phone: str
    address: str
    status: str
    
    class Config:
        from_attributes = True

# ===========================
# 2. HELPER FUNCTIONS
# ===========================

def get_password_hash(password):
    return pwd_context.hash(password)

def send_login_email(to_email: str, username: str, password: str):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ Skipped Email: Missing MAIL_USERNAME or MAIL_PASSWORD in .env")
        return

    subject = "Your Restaurant Application is Approved! - CRAVE"
    body = f"""
    <h2>Welcome to Crave! 🎉</h2>
    <p>Your application has been approved.</p>
    <p><strong>Username:</strong> {username}</p>
    <p><strong>Password:</strong> {password}</p>
    <p>Please log in and start adding your menu!</p>
    """

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email Failed (Check Internet/Credentials): {e}")

# ===========================
# 3. ROUTES
# ===========================

@router.get("/dashboard")
def get_admin_stats(db: Session = Depends(get_db)):
    return {
        "stats": {
            "revenue": "₹0",
            "total_orders": "0",
            "active_drivers": "0",
            "pending_requests": db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").count()
        }
    }

@router.get("/requests", response_model=List[AdminRequestResponse])
def get_pending_requests(db: Session = Depends(get_db)):
    return db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").all()

@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/approve/{request_id}")
def approve_restaurant(
    request_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    # 1. Fetch the Request
    req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.status == "approved":
        return {"message": "Already approved"}

    # 2. Prepare Credentials
    generated_username = req.email.split("@")[0] + "_owner"
    temp_password = "Pass" + str(req.id) + "word!" 
    hashed_pw = get_password_hash(temp_password)

    # 3. Create/Check USER (Idempotent)
    existing_user = db.query(User).filter(User.email == req.email).first()
    if not existing_user:
        new_user = User(
            username=generated_username,
            full_name=req.owner_name,
            email=req.email,
            phone=req.phone,
            hashed_password=hashed_pw,
            role="restaurant",
            profile_image="https://cdn-icons-png.flaticon.com/512/1996/1996055.png"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    else:
        generated_username = existing_user.username

    # 4. Create/Check RESTAURANT (Idempotent)
    existing_restaurant = db.query(Restaurant).filter(Restaurant.email == req.email).first()
    if not existing_restaurant:
        new_restaurant = Restaurant(
            name=req.restaurant_name,
            email=req.email,
            password=hashed_pw, 
            is_active=True,
        )
        db.add(new_restaurant)
        db.commit()

    # 5. Finalize Request
    req.status = "approved"
    db.commit()

    # 6. Send Email
    if not existing_user:
        background_tasks.add_task(send_login_email, req.email, generated_username, temp_password)

    return {"message": "Request approved successfully", "username": generated_username}

@router.post("/reject/{request_id}")
def reject_restaurant_request(request_id: int, db: Session = Depends(get_db)):
    req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "rejected"
    db.commit()
    return {"message": "Request rejected"}

@router.delete("/restaurants/{restaurant_id}")
def delete_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    rest = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not rest:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    user = db.query(User).filter(User.email == rest.email).first()
    
    db.delete(rest)
    if user:
        db.delete(user)
        
    db.commit()
    return {"message": "Restaurant deleted"}