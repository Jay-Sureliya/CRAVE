import sys
import os

# Setup path to import app modules
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User, Restaurant
from app.models.restaurant_request import RestaurantRequest

# --- CONFIGURATION ---
# ENTER THE EMAIL YOU ARE STRUGGLING WITH HERE:
TARGET_EMAIL = "m88167325@gmail.com" 
# ---------------------

def clean_database():
    db = SessionLocal()
    print(f"🧹 Cleaning up data for: {TARGET_EMAIL}")

    # 1. Delete the User (Login Account)
    user = db.query(User).filter(User.email == TARGET_EMAIL).first()
    if user:
        db.delete(user)
        print(f"   ✅ Deleted User account: {user.username}")
    else:
        print("   ⚠️ User account not found (clean).")

    # 2. Delete the Restaurant Profile (The 'Ghost' Data)
    restaurant = db.query(Restaurant).filter(Restaurant.email == TARGET_EMAIL).first()
    if restaurant:
        db.delete(restaurant)
        print(f"   ✅ Deleted Restaurant profile: {restaurant.name}")
    else:
        print("   ⚠️ Restaurant profile not found (clean).")

    # 3. Reset or Delete the Request
    # We delete it so you can submit a fresh request from the 'Join Us' page
    request = db.query(RestaurantRequest).filter(RestaurantRequest.email == TARGET_EMAIL).first()
    if request:
        db.delete(request)
        print(f"   ✅ Deleted Application Request for: {request.restaurant_name}")
    else:
        print("   ⚠️ No pending request found.")

    db.commit()
    db.close()
    print("\n✨ Database is clean! You can now register this restaurant from scratch.")

if __name__ == "__main__":
    clean_database()