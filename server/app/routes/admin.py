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

<<<<<<< HEAD
# # --- HELPER: EMAIL (Safe Version) ---
# def send_login_email(to_email: str, username: str, password: str):
=======
# # --- CORE EMAIL SENDER (Reusable) ---
# def _send_email_core(to_email, subject, body):
>>>>>>> origin/Mihir
#     sender_email = os.getenv("MAIL_USERNAME")
#     sender_password = os.getenv("MAIL_PASSWORD")

#     if not sender_email or not sender_password:
<<<<<<< HEAD
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
=======
#         print("⚠️ Skipped Email: Missing Credentials in .env")
#         return

#     msg = MIMEMultipart()
#     msg["From"] = f"Crave Support <{sender_email}>"
>>>>>>> origin/Mihir
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
<<<<<<< HEAD
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

=======
#         print(f"❌ Email Failed: {e}")

# # --- HELPER 1: ATTRACTIVE WELCOME EMAIL ---
# def send_login_email(to_email: str, username: str, password: str):
#     subject = "Welcome to the Crave Family! 🍽️"
    
#     body = f"""
#     <!DOCTYPE html>
#     <html>
#     <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
#         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
#             <tr>
#                 <td align="center" style="background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%); padding: 30px 20px;">
#                     <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Welcome to CRAVE</h1>
#                     <p style="color: #fed7aa; margin: 10px 0 0 0; font-size: 16px;">Your journey starts here</p>
#                 </td>
#             </tr>

#             <tr>
#                 <td style="padding: 40px 30px;">
#                     <p style="color: #333333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
#                         Congratulations! Your restaurant application has been approved. We are excited to have you on board.
#                     </p>
                    
#                     <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
#                         <p style="margin: 0 0 10px 0; color: #ea580c; font-weight: bold; font-size: 12px; text-transform: uppercase;">Your Credentials</p>
#                         <p style="margin: 5px 0; font-size: 16px; color: #333;"><strong>Username:</strong> {username}</p>
#                         <p style="margin: 5px 0; font-size: 16px; color: #333;"><strong>Password:</strong> {password}</p>
#                     </div>

#                     <div style="text-align: center;">
#                         <a href="http://localhost:5173/login" style="background-color: #ea580c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.3);">Login to Dashboard</a>
#                     </div>
#                 </td>
#             </tr>

#             <tr>
#                 <td align="center" style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0;">
#                     <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 Crave Delivery. All rights reserved.</p>
#                 </td>
#             </tr>
#         </table>
#     </body>
#     </html>
#     """
#     _send_email_core(to_email, subject, body)

# # --- HELPER 2: ATTRACTIVE UPDATE EMAIL (WITH PROFILE IMAGE) ---
# def send_update_email(to_email: str, name: str, username: str, address: str, profile_image_url: str = None):
#     subject = "Your Profile Was Updated - CRAVE"
    
#     # Handle Image Display logic
#     # If no image provided, use a clean placeholder
#     image_html = ""
#     if profile_image_url:
#         # Use a generic image if localhost (since localhost images won't load in email)
#         if "localhost" in profile_image_url:
#              display_url = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
#              note = "(Your new local image was saved, but displayed here as placeholder for security)"
#         else:
#              display_url = profile_image_url
#              note = ""
             
#         image_html = f"""
#         <div style="text-align: center; margin-bottom: 25px;">
#             <img src="{display_url}" alt="Profile" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #fff7ed; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
#             <p style="font-size: 10px; color: #999; margin-top: 5px;">{note}</p>
#         </div>
#         """

#     body = f"""
#     <!DOCTYPE html>
#     <html>
#     <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
#         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
            
#             <tr>
#                 <td align="center" style="background: #1e293b; padding: 25px 20px;">
#                     <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Profile Updated</h2>
#                 </td>
#             </tr>

#             <tr>
#                 <td style="padding: 40px 30px;">
#                     {image_html}
                    
#                     <p style="color: #333; font-size: 16px; margin-bottom: 20px; text-align: center;">
#                         Hello <strong>{name}</strong>,<br>
#                         Your account details have been successfully updated.
#                     </p>
                    
#                     <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
#                         <tr>
#                             <td width="30%" style="color: #64748b; font-size: 14px; font-weight: 600;">Username</td>
#                             <td style="color: #0f172a; font-size: 14px;">@{username}</td>
#                         </tr>
#                         <tr>
#                             <td style="color: #64748b; font-size: 14px; font-weight: 600; border-top: 1px solid #e2e8f0;">Email</td>
#                             <td style="color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0;">{to_email}</td>
#                         </tr>
#                         <tr>
#                             <td style="color: #64748b; font-size: 14px; font-weight: 600; border-top: 1px solid #e2e8f0;">Address</td>
#                             <td style="color: #0f172a; font-size: 14px; border-top: 1px solid #e2e8f0;">{address}</td>
#                         </tr>
#                     </table>

#                     <p style="text-align: center; color: #94a3b8; font-size: 12px;">
#                         If you did not request this change, please contact support immediately.
#                     </p>
#                 </td>
#             </tr>
#         </table>
#     </body>
#     </html>
#     """
#     _send_email_core(to_email, subject, body)

# # ... (Routes below remain unchanged) ...
# # Copy the Routes (@router.get, @router.post) exactly as they were in your previous code.
>>>>>>> origin/Mihir

import os
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
<<<<<<< HEAD
from typing import List, Optional

=======
from email.mime.image import MIMEImage
>>>>>>> origin/Mihir
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

<<<<<<< HEAD
def send_login_email(to_email: str, username: str, password: str):
=======
# --- CORE EMAIL SENDER (With Image Support) ---
def _send_email_core(to_email, subject, body, image_base64=None):
>>>>>>> origin/Mihir
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

<<<<<<< HEAD
@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(db: Session = Depends(get_db)):
    return db.query(User).all()

=======
>>>>>>> origin/Mihir
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

<<<<<<< HEAD
    # 2. Prepare Credentials
=======
>>>>>>> origin/Mihir
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
<<<<<<< HEAD

    # 4. Create/Check RESTAURANT (Idempotent)
=======
        temp_password = "[Existing Password]"

>>>>>>> origin/Mihir
    existing_restaurant = db.query(Restaurant).filter(Restaurant.email == req.email).first()
    if not existing_restaurant:
        new_restaurant = Restaurant(
            name=req.restaurant_name,
            email=req.email,
<<<<<<< HEAD
            password=hashed_pw, 
=======
            password=hashed_pw,
>>>>>>> origin/Mihir
            is_active=True,
        )
        db.add(new_restaurant)
        db.commit()

    req.status = "approved"
    db.commit()

<<<<<<< HEAD
    # 6. Send Email
=======
>>>>>>> origin/Mihir
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