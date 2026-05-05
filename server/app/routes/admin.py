import os
import smtplib
import base64
from typing import Optional, List
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from pydantic import BaseModel

# --- INTERNAL IMPORTS ---
from app.db.session import get_db
from app.models.restaurant_request import RestaurantRequest
from app.models.rider_request import RiderRequest 
from app.models.user import User, Restaurant
from app.models.rider import Rider
from app.models.order import Order  # Ensure this model exists for stats

# --- CONFIGURATION ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/admin", tags=["Admin"])

# ===========================
# 1. PYDANTIC SCHEMAS
# ===========================

class AdminUserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    email: Optional[str] = None
    role: str
    phone: Optional[str] = None
    # Dashboard Fields
    rating: Optional[float] = 0.0
    total_earnings: Optional[float] = 0.0
    total_trips: Optional[int] = 0
    total_spent: Optional[float] = 0.0
    
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

class AdminRiderResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    city: str
    vehicle_type: str
    status: str
    class Config:
        from_attributes = True

# ===========================
# 2. HELPER FUNCTIONS
# ===========================

def get_password_hash(password):
    return pwd_context.hash(password)

# --- CORE EMAIL ENGINE ---
def _send_email_core(to_email, subject, body, image_base64=None):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ Skipped Email: Missing Credentials in .env")
        return

    msg = MIMEMultipart("related")
    msg["From"] = f"Crave Support <{sender_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg_html = MIMEText(body, "html")
    msg.attach(msg_html)

    if image_base64 and "base64," in image_base64:
        try:
            header, encoded = image_base64.split("base64,", 1)
            img_data = base64.b64decode(encoded)
            img = MIMEImage(img_data)
            img.add_header('Content-ID', '<profile_pic>')
            img.add_header('Content-Disposition', 'inline')
            msg.attach(img)
        except Exception: pass

    # FIX: Secure SSL connection on Port 465 to bypass Render's firewall
    try:
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email Failed: {e}")

# --- SPECIFIC EMAIL TEMPLATES ---

def send_login_email(to_email: str, username: str, password: str):
    subject = "Welcome to the Crave Family! 🍽️"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #ea580c;">Welcome to Crave! 🎉</h2>
        <p>Your Restaurant application has been approved.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
        </div>
        <p><a href="http://localhost:5173/login">Login here</a></p>
    </body>
    </html>
    """
    _send_email_core(to_email, subject, body)

def send_rider_welcome_email(to_email: str, username: str, password: str):
    subject = "Welcome to the Crave Fleet! 🚴‍♂️"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2563eb;">You're Hired! 🚴‍♂️</h2>
        <p>Your application to become a rider has been approved.</p>
        <div style="background: #eff6ff; padding: 15px; border-radius: 8px;">
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Password:</strong> {password}</p>
        </div>
        <p><a href="http://localhost:5173/login">Login to start earning</a></p>
    </body>
    </html>
    """
    _send_email_core(to_email, subject, body)

# --- CRITICAL FIX: The missing function app/main.py is looking for ---
def send_update_email(to_email, name, username, address, password=None, profile_image=None):
    """Placeholder for profile update notifications required by main.py."""
    subject = "Crave Profile Updated 📝"
    body = f"Hello {name}, your profile details have been updated successfully."
    _send_email_core(to_email, subject, body)

# ===========================
# 3. ROUTES
# ===========================

@router.get("/dashboard")
def get_admin_stats(db: Session = Depends(get_db)):
    return {
        "stats": {
            "revenue": "₹0",
            "total_orders": "0",
            "active_drivers": db.query(User).filter(User.role == "driver").count(),
            "pending_requests": db.query(RestaurantRequest).filter(RestaurantRequest.status == "pending").count()
        }
    }

@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    response_data = []
    
    for u in users:
        user_data = {
            "id": u.id, "username": u.username, "email": u.email,
            "role": u.role, "phone": u.phone,
            "total_earnings": 0.0, "total_trips": 0, "rating": 0.0, "total_spent": 0.0
        }
        
        # Calculate Customer Stats
        if u.role == "customer":
            spent = db.query(func.sum(Order.total_amount)).filter(
                Order.user_id == u.id, Order.status == "delivered"
            ).scalar()
            user_data["total_spent"] = float(spent) if spent else 0.0
                
        # Calculate Rider Stats
        elif u.role in ["rider", "driver"] and getattr(u, "rider", None):
            user_data["total_earnings"] = getattr(u.rider, "total_earnings", 0.0) or 0.0
            user_data["total_trips"] = getattr(u.rider, "total_trips", 0) or 0
            
            t_rating = getattr(u.rider, "total_rating", 0.0) or 0.0
            r_count = getattr(u.rider, "rating_count", 0) or 0
            if r_count > 0:
                user_data["rating"] = round(t_rating / r_count, 1)
                
        response_data.append(user_data)
    return response_data

# --- APPROVAL & REJECTION LOGIC ---

@router.post("/approve/{request_id}")
def approve_restaurant(request_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
    if not req: raise HTTPException(status_code=404, detail="Request not found")
    if req.status == "approved": return {"message": "Already approved"}

    generated_username = req.email.split("@")[0] + "_owner"
    temp_password = f"Pass{req.id}word!" 
    hashed_pw = get_password_hash(temp_password)

    existing_user = db.query(User).filter(User.email == req.email).first()
    if not existing_user:
        new_user = User(
            username=generated_username, full_name=req.owner_name, email=req.email,
            phone=req.phone, hashed_password=hashed_pw, role="restaurant",
            profile_image="https://cdn-icons-png.flaticon.com/512/1996/1996055.png"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        background_tasks.add_task(send_login_email, req.email, generated_username, temp_password)
    else:
        generated_username = existing_user.username

    if not db.query(Restaurant).filter(Restaurant.email == req.email).first():
        db.add(Restaurant(name=req.restaurant_name, email=req.email, password=hashed_pw, is_active=True, address=req.address))
    
    req.status = "approved"
    db.commit()
    return {"message": "Restaurant approved", "username": generated_username}

@router.post("/rider-approve/{request_id}")
def approve_rider(request_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    req = db.query(RiderRequest).filter(RiderRequest.id == request_id).first()
    if not req: raise HTTPException(status_code=404, detail="Request not found")
    
    generated_username = f"{req.email.split('@')[0]}_rider"
    temp_password = f"Ride{req.id}Now!"
    hashed_pw = get_password_hash(temp_password)

    existing_user = db.query(User).filter(User.email == req.email).first()
    if not existing_user:
        new_user = User(username=generated_username, full_name=req.full_name, email=req.email, phone=req.phone, hashed_password=hashed_pw, role="driver")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user_id = new_user.id
    else:
        user_id = existing_user.id
        existing_user.role = "driver"
        db.commit()

    if not db.query(Rider).filter(Rider.user_id == user_id).first():
        db.add(Rider(user_id=user_id, vehicle_type=req.vehicle_type, city=req.city, is_active=True, is_available=True))
    
    req.status = "approved"
    db.commit()
    background_tasks.add_task(send_rider_welcome_email, req.email, generated_username, temp_password)
    return {"message": "Rider approved"}