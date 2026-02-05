import os
import smtplib
import base64
from typing import Optional, List  # <--- ADD THIS LINE HERE
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
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

# --- CORE EMAIL SENDER (With Image Support) ---
def _send_email_core(to_email, subject, body, image_base64=None):
    sender_email = os.getenv("MAIL_USERNAME")
    sender_password = os.getenv("MAIL_PASSWORD")

    if not sender_email or not sender_password:
        print("⚠️ Skipped Email: Missing Credentials in .env")
        return

    # 'related' allows inline images (CID)
    msg = MIMEMultipart("related")
    msg["From"] = f"Crave Support <{sender_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    # Attach HTML Body
    msg_html = MIMEText(body, "html")
    msg.attach(msg_html)

    # --- IMAGE EMBEDDING LOGIC ---
    if image_base64 and "base64," in image_base64:
        try:
            # 1. Clean string
            header, encoded = image_base64.split("base64,", 1)
            # 2. Decode
            img_data = base64.b64decode(encoded)
            # 3. Create MIMEImage
            img = MIMEImage(img_data)
            # 4. Add Content-ID
            img.add_header('Content-ID', '<profile_pic>')
            img.add_header('Content-Disposition', 'inline')
            msg.attach(img)
        except Exception as e:
            print(f"⚠️ Image embedding failed: {e}")

    # --- SENDING ---
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        print(f"✅ Email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email Failed: {e}")

# --- HELPER 1: WELCOME EMAIL ---
def send_login_email(to_email: str, username: str, password: str):
    subject = "Welcome to the Crave Family! 🍽️"
    
    body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Welcome to Crave! 🎉</h1>
                <p style="color: #fed7aa; margin: 5px 0 0; font-size: 16px;">Your application has been approved</p>
            </div>
            <div style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; line-height: 1.6;">Hello,</p>
                <p style="color: #555; font-size: 16px; line-height: 1.6;">You can now access your dashboard and start managing your restaurant.</p>
                
                <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0 0 10px; color: #ea580c; font-weight: bold; font-size: 12px; text-transform: uppercase;">Your Credentials</p>
                    <p style="margin: 5px 0; color: #333; font-size: 16px;"><strong>Username:</strong> {username}</p>
                    <p style="margin: 5px 0; color: #333; font-size: 16px;"><strong>Password:</strong> {password}</p>
                </div>

                <div style="text-align: center; margin-top: 35px;">
                    <a href="http://localhost:5173/login" style="background-color: #ea580c; color: white; padding: 14px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3);">Login to Dashboard</a>
                </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 Crave Delivery. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    _send_email_core(to_email, subject, body)

# --- HELPER 2: UPDATE EMAIL (With Picture & Password) ---
def send_update_email(to_email: str, name: str, username: str, address: str, password: str = None, profile_image: str = None):
    subject = "Profile Updated Successfully - CRAVE"
    
    # 1. Image Logic
    if profile_image and "base64," in profile_image:
        img_src = "cid:profile_pic"
        image_data_to_send = profile_image
    elif profile_image and "http" in profile_image:
        img_src = profile_image
        image_data_to_send = None
    else:
        img_src = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        image_data_to_send = None

    # 2. Password Display Logic
    if password and len(password) > 0:
        password_display = f'<span style="color: #d9534f; font-weight: bold;">{password}</span>'
    else:
        password_display = '<span style="color: #999;">(Unchanged)</span>'

    body = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 35px 20px; text-align: center;">
                <img src="{img_src}" alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #ffffff; object-fit: cover; box-shadow: 0 2px 8px rgba(0,0,0,0.2); display: block; margin: 0 auto 15px; background-color: #fff;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Profile Updated</h1>
                <p style="color: #94a3b8; margin: 5px 0 0; font-size: 14px;">Your account details have changed</p>
            </div>

            <div style="padding: 40px 30px;">
                <p style="color: #333; font-size: 16px; margin-bottom: 25px; text-align: center;">
                    Hello <strong>{name}</strong>,<br>
                    This is a confirmation that your profile details were successfully updated.
                </p>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 0; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
                    <tr>
                        <td style="padding: 16px 20px; color: #64748b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Username</td>
                        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; text-align: right; border-bottom: 1px solid #e2e8f0;">@{username}</td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px; color: #64748b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Email</td>
                        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; text-align: right; border-bottom: 1px solid #e2e8f0;">{to_email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px; color: #64748b; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Address</td>
                        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; text-align: right; border-bottom: 1px solid #e2e8f0;">{address}</td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 20px; color: #64748b; font-size: 14px; font-weight: 600;">Password</td>
                        <td style="padding: 16px 20px; color: #0f172a; font-weight: 500; text-align: right;">{password_display}</td>
                    </tr>
                </table>

                <div style="margin-top: 30px; text-align: center;">
                    <p style="color: #ef4444; font-size: 12px; margin: 0;">
                        ⚠️ If you did not make this change, please contact support immediately.
                    </p>
                </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 15px; text-align: center;">
                <p style="color: #cbd5e1; font-size: 12px; margin: 0;">Crave Delivery • Automated Notification</p>
            </div>
        </div>
    </body>
    </html>
    """
    _send_email_core(to_email, subject, body, image_data_to_send)

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

@router.post("/approve/{request_id}")
def approve_restaurant(
    request_id: int, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):
    req = db.query(RestaurantRequest).filter(RestaurantRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    if req.status == "approved":
        return {"message": "Already approved"}

    generated_username = req.email.split("@")[0] + "_owner"
    temp_password = "Pass" + str(req.id) + "word!" 
    hashed_pw = get_password_hash(temp_password)

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
        temp_password = "[Existing Password]"

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

    req.status = "approved"
    db.commit()

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