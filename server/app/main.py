# from typing import List, Optional
# from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
# from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session, defer, load_only
# from passlib.context import CryptContext
# from datetime import datetime, timedelta, timezone
# from jose import jwt, JWTError
# import os
# import base64 
# from dotenv import load_dotenv # <--- Make sure this is here
# from pydantic import BaseModel 

# # 1. LOAD ENVIRONMENT FIRST
# load_dotenv() 

# # 2. INTERNAL DB & MODEL IMPORTS
# from app.db.session import engine, Base, get_db
# from app.models.user import User, Restaurant, Favorite
# from app.models.menu import MenuItem 
# from app.models.cart import Cart 
# from app.models.order import Order, OrderItem
# from app.models.restaurant_request import RestaurantRequest
# from app.models.rider_request import RiderRequest
# from app.models.rider import Rider
# from sqlalchemy import func

# # 3. SCHEMAS (MOVE THESE UP HERE - FIXES YOUR ERROR)
# from app.schemas.rider_request import RiderRequestCreate
# from app.schemas.user import UserCreate, UserUpdate, TokenResponse
# from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse

# # 4. ROUTES & EMAIL
# from app.routes.admin import send_update_email
# from app.routes import restaurant, admin, menu

# # ... (Keep your app initialization and Pydantic models here)

# load_dotenv()

# SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
# ALGORITHM = "HS256"
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# app = FastAPI(title="Crave API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Initialize Database Tables
# Base.metadata.create_all(bind=engine)

# app.include_router(restaurant.router)
# app.include_router(admin.router)
# app.include_router(menu.router)

# # ---------------- HELPERS ----------------
# def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
# def hash_password(password): return pwd_context.hash(password)

# # ---------------- PYDANTIC MODELS ----------------
# class UserProfileUpdate(BaseModel):
#     username: Optional[str] = None
#     full_name: Optional[str] = None
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     profile_image: Optional[str] = None
#     password: Optional[str] = None 

# class CartAdd(BaseModel): 
#     menu_item_id: int
#     quantity: int
#     customization: Optional[str] = "[]"
#     total_price: Optional[float] = 0.0

# class OrderCreate(BaseModel):
#     address: str
#     payment_method: str 

# class OrderStatusUpdate(BaseModel):
#     status: str 

# # ==============================================================================
# #  AUTH DEPENDENCIES
# # ==============================================================================

# def get_current_user(token: str = Depends(oauth2_scheme)):
#     try:
#         return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#     except JWTError:
#         raise HTTPException(401, "Invalid session")

# def get_current_restaurant(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     if user["role"] != "restaurant": 
#         raise HTTPException(403, "Not a restaurant")
#     res = db.query(Restaurant).filter(Restaurant.id == user.get("restaurant_id")).first()
#     if not res: raise HTTPException(404, "Restaurant not found")
#     return res

# # ==============================================================================
# #  ORDER MANAGEMENT SYSTEM (USER -> RESTAURANT -> RIDER)
# # ==============================================================================

# @app.post("/api/orders/place")
# def place_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     user_id = current_user["id"]
#     cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()
#     if not cart_items: raise HTTPException(400, "Cart is empty")

#     total = 0
#     order_items_data = []
#     restaurant_id = cart_items[0].menu_item.restaurant_id 

#     for item in cart_items:
#         price = item.menu_item.discount_price if (item.menu_item.discount_price and item.menu_item.discount_price > 0) else item.menu_item.price
#         total += price * item.quantity
#         order_items_data.append({
#             "menu_item_id": item.menu_item_id,
#             "name": item.menu_item.name,
#             "price": price,
#             "quantity": item.quantity,
#             "addons": item.addons
#         })

#     tax = round(total * 0.05, 2)
#     grand_total = total + tax

#     new_order = Order(
#         user_id=user_id,
#         restaurant_id=restaurant_id,
#         status="pending",
#         total_amount=grand_total,
#         payment_method=order_data.payment_method,
#         delivery_address=order_data.address,
#         payment_status="paid" if order_data.payment_method == "RAZORPAY" else "pending"
#     )
#     db.add(new_order)
#     db.flush() # Secure the ID before adding items

#     for item in order_items_data:
#         db.add(OrderItem(order_id=new_order.id, **item))
    
#     db.query(Cart).filter(Cart.user_id == user_id).delete()
#     db.commit()

#     return {"message": "Order placed", "order_id": new_order.id, "total": grand_total}

# @app.get("/api/orders/track")
# def track_active_order(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     # Crucial: Ensures we find the active order and join the restaurant details correctly
#     order = db.query(Order).filter(
#         Order.user_id == current_user["id"],
#         Order.status.notin_(["delivered", "cancelled"])
#     ).order_by(Order.created_at.desc()).first()
    
#     if not order: return {"active": False}
    
#     return {
#         "active": True,
#         "id": order.id,
#         "status": order.status,
#         "total": order.total_amount,
#         "restaurant_name": order.restaurant.name if order.restaurant else "Restaurant",
#         "rider_name": order.rider_name,
#         "rider_phone": order.rider_phone
#     }
# # In main.py

# @app.get("/api/restaurant/orders")
# def get_restaurant_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     if current_user["role"] != "restaurant": 
#         raise HTTPException(403, "Access denied")
    
#     # Fetch orders for this restaurant
#     orders = db.query(Order).filter(
#         Order.restaurant_id == current_user["restaurant_id"]
#     ).order_by(Order.created_at.desc()).all()

#     response_data = []
#     for o in orders:
#         response_data.append({
#             "id": o.id,
#             "status": o.status,
#             "total_amount": o.total_amount,
#             "created_at": o.created_at,
#             "rider_name": o.rider_name,
            
#             # 1. Customer Name (Handle if guest)
#             "customer_name": o.user.full_name if o.user else "Guest Customer",
            
#             # 2. Delivery Address (Direct from Order table)
#             "delivery_address": o.delivery_address, 
            
#             # 3. Items (Without Images)
#             "items": [
#                 {
#                     "name": item.name, 
#                     "quantity": item.quantity,
#                     "addons": item.addons
#                 } 
#                 for item in o.items
#             ]
#         })

#     return response_data

# @app.put("/api/orders/{order_id}/status")
# def update_order_status(order_id: int, update: OrderStatusUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if not order: raise HTTPException(404)
#     order.status = update.status 
#     db.commit()
#     return {"message": "Status updated", "status": order.status}

# @app.get("/api/rider/orders/available")
# def get_rider_available_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     orders = db.query(Order).filter(Order.status.in_(["accepted", "preparing", "ready"]), Order.rider_id == None).all()
#     return [{
#         "id": o.id, "restaurant_name": o.restaurant.name if o.restaurant else "Unknown",
#         "restaurant_address": o.restaurant.address if o.restaurant else "",
#         "delivery_address": o.delivery_address, "total": o.total_amount, "status": o.status
#     } for o in orders]

# @app.post("/api/rider/orders/{order_id}/accept")
# def rider_accept_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if not order: raise HTTPException(404)
#     if order.rider_id: raise HTTPException(400, "Order already taken")
#     user = db.query(User).filter(User.id == current_user["id"]).first()
#     order.rider_id = user.id
#     order.rider_name = user.full_name
#     order.rider_phone = user.phone
#     db.commit()
#     return {"message": "Order Accepted", "rider_name": user.full_name}

# @app.post("/api/rider/orders/{order_id}/pickup")
# def rider_pickup_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if order.rider_id != current_user["id"]: raise HTTPException(403, "Not your order")
#     order.status = "out_for_delivery"
#     db.commit()
#     return {"message": "Out for Delivery"}

# @app.post("/api/rider/orders/{order_id}/complete")
# def rider_complete_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id).first()
#     if order.rider_id != current_user["id"]: raise HTTPException(403, "Not your order")
#     order.status = "delivered"
#     order.payment_status = "paid"
#     db.commit()
#     return {"message": "Order Delivered"}

# # ==============================================================================
# #  EXISTING ROUTES (Favorites, Cart, Profile, etc.)
# # ==============================================================================

# @app.get("/api/favorites/list") 
# def get_favorites_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     fav_items = db.query(MenuItem).join(Favorite, Favorite.menu_item_id == MenuItem.id).filter(Favorite.user_id == current_user["id"]).all()
#     return format_items(fav_items)

# @app.get("/api/favorites")
# def get_user_favorites(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     favs = db.query(Favorite.menu_item_id).filter(Favorite.user_id == current_user["id"]).all()
#     return [f[0] for f in favs]

# @app.post("/api/favorites/{item_id}")
# def toggle_favorite(item_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     user_id = current_user["id"]
#     existing_fav = db.query(Favorite).filter(Favorite.user_id == user_id, Favorite.menu_item_id == item_id).first()
#     if existing_fav:
#         db.delete(existing_fav)
#         db.commit()
#         return {"status": "removed", "item_id": item_id}
#     else:
#         new_fav = Favorite(user_id=user_id, menu_item_id=item_id)
#         db.add(new_fav)
#         db.commit()
#         return {"status": "added", "item_id": item_id}

# @app.get("/api/cart")
# def get_user_cart(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     cart_items = db.query(Cart).filter(Cart.user_id == current_user["id"]).all()
#     return [{
#         "id": item.menu_item.id, "name": item.menu_item.name,
#         "price": item.price if item.price > 0 else item.menu_item.price,
#         "discount_price": item.menu_item.discount_price, "image": item.menu_item.image,
#         "description": item.menu_item.description, "quantity": item.quantity,
#         "cart_id": item.id, "addons": item.addons 
#     } for item in cart_items if item.menu_item]

# @app.post("/api/cart")
# def update_cart_item(data: CartAdd, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     user_id = current_user["id"]
#     unit_price = 0
#     if data.total_price and data.quantity > 0: unit_price = data.total_price / data.quantity
#     cart_item = db.query(Cart).filter(Cart.user_id == user_id, Cart.menu_item_id == data.menu_item_id).first()
#     if cart_item:
#         new_qty = cart_item.quantity + data.quantity
#         if new_qty > 0:
#             cart_item.quantity = new_qty
#             if unit_price > 0: cart_item.price = unit_price
#             if data.customization: cart_item.addons = data.customization
#         else: db.delete(cart_item)
#     elif data.quantity > 0:
#         new_item = Cart(user_id=user_id, menu_item_id=data.menu_item_id, quantity=data.quantity, price=unit_price, addons=data.customization)
#         db.add(new_item)
#     db.commit()
#     return {"message": "Cart updated"}

# def format_items(items):
#     return [{
#         "id": item.id, "name": item.name, "category": item.category,
#         "description": item.description, "price": item.price,
#         "discountPrice": item.discount_price, "type": "veg" if item.is_veg else "non-veg",
#         "is_veg": item.is_veg, "isAvailable": item.is_available, "image": item.image 
#     } for item in items]

# @app.post("/api/restaurant-request")
# def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
#     if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first(): raise HTTPException(status_code=400, detail="Application with this email already exists.")
#     if db.query(Restaurant).filter(Restaurant.email == request.email).first(): raise HTTPException(status_code=400, detail="Restaurant is already active.")
#     new_request = RestaurantRequest(restaurant_name=request.restaurantName, owner_name=request.ownerName, email=request.email, phone=request.phone, address=request.address, status="pending")
#     db.add(new_request)
#     db.commit()
#     return {"message": "Application submitted successfully!", "id": new_request.id}

# @app.get("/restaurants")
# def get_all_restaurants(db: Session = Depends(get_db)):
#     restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).all()
#     response_data = []
#     for r in restaurants:
#         cats = db.query(MenuItem.category).filter(MenuItem.restaurant_id == r.id).distinct().limit(2).all()
#         cuisine_str = " • ".join([c[0] for c in cats if c[0]]) if cats else "Multi-Cuisine" 
#         response_data.append({
#             "id": r.id, "name": r.name, "address": r.address, "rating": "4.5",
#             "is_active": r.is_active, "profile_image": r.profile_image, "cuisine": cuisine_str 
#         })
#     return response_data

# @app.get("/api/restaurant/image/{restaurant_id}")
# def get_restaurant_image(restaurant_id: int, db: Session = Depends(get_db)):
#     res = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
#     if not res or not res.profile_image: return Response(status_code=404)
#     try:
#         img_str = res.profile_image
#         if "base64," in img_str: _, img_str = img_str.split("base64,", 1)
#         return Response(content=base64.b64decode(img_str), media_type="image/jpeg", headers={"Cache-Control": "public, max-age=31536000"})
#     except: return Response(status_code=500)

# @app.get("/restaurants/{restaurant_id}")
# def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
#     restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
#     if not restaurant: raise HTTPException(status_code=404, detail="Restaurant not found")
#     return restaurant

# @app.get("/users/{user_id}")
# def get_user_profile(user_id: int, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user: raise HTTPException(status_code=404, detail="User not found")
#     profile_image = user.profile_image
#     if user.role == "restaurant":
#         res_data = db.query(Restaurant).filter(Restaurant.email == user.email).first()
#         if res_data: profile_image = res_data.profile_image
#     return {"id": user.id, "username": user.username, "full_name": user.full_name, "email": user.email, "phone": user.phone, "role": user.role, "profile_image": profile_image}

# @app.put("/users/{user_id}")
# def update_user_profile(user_id: int, data: UserProfileUpdate, db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user: raise HTTPException(status_code=404, detail="User not found")
#     if data.username: user.username = data.username
#     if data.full_name: user.full_name = data.full_name
#     if data.email: user.email = data.email
#     if data.phone: user.phone = data.phone
#     if data.profile_image: user.profile_image = data.profile_image
#     if data.password: user.hashed_password = hash_password(data.password)
#     db.commit()
#     return {"message": "Profile updated successfully"}

# @app.post("/register")
# def register(user: UserCreate, db: Session = Depends(get_db)):
#     if db.query(User).filter(User.username == user.username).first(): raise HTTPException(400, "Username taken")
#     if db.query(User).filter(User.email == user.email).first(): raise HTTPException(400, "Email registered")
#     new_user = User(username=user.username, full_name=user.full_name, email=user.email, phone=user.phone, hashed_password=hash_password(user.password), role=user.role if user.role else "customer")
#     db.add(new_user)
#     db.commit()
#     return {"message": "Registration successful"}

# @app.post("/login", response_model=TokenResponse)
# def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.username == form_data.username).options(defer(User.profile_image)).first()
#     if not user or not verify_password(form_data.password, user.hashed_password): raise HTTPException(401, "Invalid credentials")
#     restaurant_id = None
#     if user.role == "restaurant":
#         res = db.query(Restaurant).filter(Restaurant.email == user.email).first()
#         if res: restaurant_id = res.id
#     token = jwt.encode({"sub": user.username, "id": user.id, "role": user.role, "restaurant_id": restaurant_id, "exp": datetime.now(timezone.utc) + timedelta(hours=2)}, SECRET_KEY, algorithm=ALGORITHM)
#     return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username, "user_id": user.id, "restaurant_id": restaurant_id}

# @app.get("/api/restaurant/me")
# def get_my_profile(res: Restaurant = Depends(get_current_restaurant), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.email == res.email).first()
#     return {"id": res.id, "name": res.name, "email": res.email, "address": res.address, "is_active": res.is_active, "profile_image": res.profile_image, "username": user.username if user else None}

# @app.put("/api/restaurant/update")
# async def update_restaurant_profile(bg_tasks: BackgroundTasks, name: str = Form(...), email: str = Form(...), address: str = Form(...), username: str = Form(...), password: Optional[str] = Form(None), profile_image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), res: Restaurant = Depends(get_current_restaurant)):
#     user = db.query(User).filter(User.email == res.email).first()
#     res.name, res.email, res.address = name, email, address
#     if user: user.email, user.full_name, user.username = email, name, username 
#     if password and password.strip():
#         hashed = hash_password(password)
#         if user: user.hashed_password = hashed
#         res.password = hashed
#     if profile_image:
#         content = await profile_image.read()
#         encoded = f"data:{profile_image.content_type};base64,{base64.b64encode(content).decode('utf-8')}"
#         res.profile_image = encoded
#         if user: user.profile_image = encoded
#     db.commit()
#     bg_tasks.add_task(send_update_email, email, name, username, address, password, res.profile_image)
#     return {"message": "Profile updated", "profile_image": res.profile_image}

# @app.post("/api/rider-request")
# def submit_rider_request(request: RiderRequestCreate, db: Session = Depends(get_db)):
#     new_request = RiderRequest(full_name=request.fullName, email=request.email, phone=request.phone, city=request.city, vehicle_type=request.vehicleType, status="pending")
#     db.add(new_request)
#     db.commit()
#     return {"message": "Rider Application Received!"}

# @app.get("/api/orders/track")
# def track_active_order(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(
#         Order.user_id == current_user["id"],
#         Order.status.notin_(["delivered", "cancelled"])
#     ).order_by(Order.created_at.desc()).first()
    
#     if not order: return {"active": False}
    
#     # In a real app, these would come from your 'restaurants' and 'users' tables
#     return {
#         "active": True,
#         "id": order.id,
#         "status": order.status,
#         "restaurant_name": order.restaurant.name if order.restaurant else "Restaurant",
#         "restaurant_location": {"lat": 22.3039, "lng": 70.8022}, # Example: Rajkot center
#         "user_location": {"lat": 22.2980, "lng": 70.7950},
#         "rider_location": {"lat": 22.3010, "lng": 70.7990}, # Simulated rider position
#         "items": [{"name": i.name, "qty": i.quantity} for i in order.items]
#     }

# @app.post("/api/orders/{order_id}/cancel")
# def cancel_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user["id"]).first()
    
#     if not order:
#         raise HTTPException(status_code=404, detail="Order not found")
    
#     # Logic: Can only cancel if restaurant hasn't started yet
#     if order.status != "pending":
#         raise HTTPException(status_code=400, detail="Cannot cancel order once it is accepted or prepared.")

#     order.status = "cancelled"
#     db.commit()
#     return {"message": "Order cancelled successfully"}

# @app.get("/api/orders/customer/{user_id}")
# def get_customer_orders(user_id: int, db: Session = Depends(get_db)):
#     # 1. Fetch all active orders for this user
#     orders = db.query(Order).filter(
#         Order.user_id == user_id,
#         Order.status.notin_(["delivered", "cancelled"])
#     ).order_by(Order.created_at.desc()).all()
    
#     # 2. Format the data so the Frontend React code can read 'location.lat'
#     response_data = []
#     for o in orders:
#         response_data.append({
#             "_id": o.id,  # Frontend expects _id or id
#             "id": o.id,
#             "status": o.status,
#             "total": o.total_amount,
#             "restaurant_name": o.restaurant.name if o.restaurant else "Unknown Restaurant",
            
#             # --- IMPORTANT: This provides the GPS coordinates your React code needs ---
#             "location": {
#                 "lat": 22.3039, # Defaulting to Rajkot coordinates for now
#                 "lng": 70.8022
#             }
#         })
        
#     return response_data

# # --- ENSURE THESE IMPORTS ARE PRESENT ---
# from app.models.rider import Rider  # <--- Make sure you import your Rider model
# from sqlalchemy import func

# # ==========================================
# #  RIDER DASHBOARD API
# # ==========================================

# @app.get("/api/rider/stats")
# def get_rider_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     # 1. Find the Rider profile linked to this User
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
#     if not rider:
#         # If no rider profile exists, return defaults (or handle error)
#         return {
#             "is_online": False,
#             "total_earnings": 0.0,
#             "total_trips": 0,
#             "active_order": None
#         }

#     # 2. Check for ANY active order for this rider
#     active_order = db.query(Order).filter(
#         Order.rider_id == current_user["id"], # Order table uses user_id usually, check your foreign key
#         Order.status.in_(["accepted", "out_for_delivery"])
#     ).first()

#     # 3. Format Active Order
#     active_order_data = None
#     if active_order:
#         active_order_data = {
#             "id": active_order.id,
#             "status": active_order.status,
#             "total": active_order.total_amount,
#             "restaurant_name": active_order.restaurant.name if active_order.restaurant else "Unknown",
#             "restaurant_address": active_order.restaurant.address if active_order.restaurant else "",
#             "delivery_address": active_order.delivery_address
#         }

#     return {
#         "is_online": rider.is_available, # Uses the 'is_available' column
#         "total_earnings": round(rider.total_earnings, 2),
#         "total_trips": rider.total_trips,
#         "active_order": active_order_data
#     }

# @app.post("/api/rider/status")
# def toggle_rider_status(status_data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
#     if not rider: raise HTTPException(404, "Rider profile not found")
    
#     # Update the is_available column
#     rider.is_available = status_data.get("is_online", False)
#     db.commit()
#     return {"is_online": rider.is_available}

# @app.get("/api/rider/orders/available")
# def get_available_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
#     # Safety Check: If offline or busy, return empty list
#     if not rider or not rider.is_available:
#         return []
    
#     # Check if they are already busy
#     busy = db.query(Order).filter(Order.rider_id == current_user["id"], Order.status.in_(["accepted", "out_for_delivery"])).first()
#     if busy: return []

#     # Fetch READY orders that have NO RIDER assigned
#     orders = db.query(Order).filter(
#         Order.status == "ready",
#         Order.rider_id == None
#     ).all()

#     return [{
#         "id": o.id,
#         "total": o.total_amount,
#         "restaurant_name": o.restaurant.name if o.restaurant else "Unknown",
#         "restaurant_address": o.restaurant.address if o.restaurant else "Location",
#         "delivery_address": o.delivery_address,
#         "created_at": o.created_at
#     } for o in orders]

# @app.post("/api/rider/orders/{order_id}/accept")
# def accept_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
#     order = db.query(Order).filter(Order.id == order_id).first()

#     if not order: raise HTTPException(404, "Order not found")
#     if order.rider_id: raise HTTPException(400, "Order already taken")

#     # Assign to User ID (Since Order table usually links to Users, not Riders table directly)
#     order.rider_id = current_user["id"] 
#     order.rider_name = current_user.get("full_name", "Rider") # Or fetch from User table
#     order.status = "accepted"
    
#     db.commit()
#     return {"message": "Order Accepted"}

# @app.post("/api/rider/orders/{order_id}/pickup")
# def pickup_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     order = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user["id"]).first()
#     if not order: raise HTTPException(404, "Order not found")
    
#     order.status = "out_for_delivery"
#     db.commit()
#     return {"message": "Order Picked Up"}

# @app.post("/api/rider/orders/{order_id}/complete")
# def complete_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     # 1. Get the Rider Profile
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
#     # 2. Get the Order
#     order = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user["id"]).first()
    
#     if not order: raise HTTPException(404, "Order not found")
#     if order.status == "delivered": return {"message": "Already delivered"}

#     # 3. Update Order
#     order.status = "delivered"
#     order.payment_status = "paid"

#     # 4. --- EARNINGS LOGIC (10%) ---
#     commission = order.total_amount * 0.10
    
#     # Update Rider Stats in DB
#     rider.total_earnings = (rider.total_earnings or 0) + commission
#     rider.total_trips = (rider.total_trips or 0) + 1

#     db.commit()
    
#     return {
#         "message": "Order Completed", 
#         "earned": commission, 
#         "total_earnings": rider.total_earnings
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)


from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, defer, load_only
from sqlalchemy import func 
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import os
import base64 
from dotenv import load_dotenv 
from pydantic import BaseModel 
import razorpay

# 1. LOAD ENVIRONMENT FIRST
load_dotenv() 

# 2. INTERNAL DB & MODEL IMPORTS
from app.db.session import engine, Base, get_db
from app.models.user import User, Restaurant, Favorite
from app.models.menu import MenuItem 
from app.models.cart import Cart 
from app.models.order import Order, OrderItem
from app.models.restaurant_request import RestaurantRequest
from app.models.rider_request import RiderRequest
from app.models.rider import Rider # <--- MOVED TO TOP TO FIX CRASH

# 3. SCHEMAS
from app.schemas.rider_request import RiderRequestCreate
from app.schemas.user import UserCreate, UserUpdate, TokenResponse
from app.schemas.restaurant_request import RestaurantRequestCreate, RestaurantResponse
from app.schemas.rider_request import RiderProfileUpdate
from app.schemas.user import PaymentVerification

# 4. ROUTES & EMAIL
from app.routes.admin import send_update_email
from app.routes import restaurant, admin, menu

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(title="Crave API")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database Tables
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

class CartAdd(BaseModel): 
    menu_item_id: int
    quantity: int
    customization: Optional[str] = "[]"
    total_price: Optional[float] = 0.0

class OrderCreate(BaseModel):
    address: str
    payment_method: str 

class OrderStatusUpdate(BaseModel):
    status: str 

# ==============================================================================
#  AUTH DEPENDENCIES
# ==============================================================================

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(401, "Invalid session")

def get_current_restaurant(user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if user["role"] != "restaurant": 
        raise HTTPException(403, "Not a restaurant")
    res = db.query(Restaurant).filter(Restaurant.id == user.get("restaurant_id")).first()
    if not res: raise HTTPException(404, "Restaurant not found")
    return res

# ==============================================================================
#  ORDER MANAGEMENT SYSTEM (USER -> RESTAURANT -> RIDER)
# ==============================================================================

razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"), 
    os.getenv("RAZORPAY_KEY_SECRET")
))

# @app.post("/api/orders/place")
# def place_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     user_id = current_user["id"]
#     cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()
#     if not cart_items: raise HTTPException(400, "Cart is empty")

#     total = 0
#     order_items_data = []
#     restaurant_id = cart_items[0].menu_item.restaurant_id 

#     for item in cart_items:
#         price = item.menu_item.discount_price if (item.menu_item.discount_price and item.menu_item.discount_price > 0) else item.menu_item.price
#         total += price * item.quantity
#         order_items_data.append({
#             "menu_item_id": item.menu_item_id,
#             "name": item.menu_item.name,
#             "price": price,
#             "quantity": item.quantity,
#             "addons": item.addons
#         })

#     tax = round(total * 0.05, 2)
#     grand_total = total + tax

#     new_order = Order(
#         user_id=user_id,
#         restaurant_id=restaurant_id,
#         status="pending",
#         total_amount=grand_total,
#         payment_method=order_data.payment_method,
#         delivery_address=order_data.address,
#         payment_status="paid" if order_data.payment_method == "RAZORPAY" else "pending"
#     )
#     db.add(new_order)
#     db.flush() # Secure the ID before adding items

#     for item in order_items_data:
#         db.add(OrderItem(order_id=new_order.id, **item))
    
#     db.query(Cart).filter(Cart.user_id == user_id).delete()
#     db.commit()

#     return {"message": "Order placed", "order_id": new_order.id, "total": grand_total}

# --- IMPORTS ---
import razorpay # <--- NEW IMPORT

# --- CONFIGURATION ---
# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(
    os.getenv("RAZORPAY_KEY_ID"), 
    os.getenv("RAZORPAY_KEY_SECRET")
))

# --- Pydantic Schema for Verification ---
class PaymentVerification(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str

# --- UPDATED ORDER PLACEMENT ROUTE ---
# --- UPDATE ORDER PLACEMENT ---
@app.post("/api/orders/place")
def place_order(order_data: OrderCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    cart_items = db.query(Cart).filter(Cart.user_id == user_id).all()
    if not cart_items: raise HTTPException(400, "Cart is empty")

    # 1. Calculate Totals (Same as before)
    total = 0
    restaurant_id = cart_items[0].menu_item.restaurant_id 
    order_items_data = []

    for item in cart_items:
        price = item.menu_item.discount_price if (item.menu_item.discount_price and item.menu_item.discount_price > 0) else item.menu_item.price
        total += price * item.quantity
        order_items_data.append({
            "menu_item_id": item.menu_item_id,
            "name": item.menu_item.name,
            "price": price,
            "quantity": item.quantity,
            "addons": item.addons
        })

    tax = round(total * 0.05, 2)
    grand_total = total + tax

    # 2. DETERMINE STATUS
    # If Razorpay -> "payment_pending" (Hidden from Rider/Restaurant)
    # If COD -> "pending" (Visible immediately)
    initial_status = "payment_pending" if order_data.payment_method == "RAZORPAY" else "pending"

    new_order = Order(
        user_id=user_id,
        restaurant_id=restaurant_id,
        status=initial_status, # <--- CHANGED
        total_amount=grand_total,
        payment_method=order_data.payment_method,
        delivery_address=order_data.address, # Address is SAVED here
        payment_status="pending"
    )
    db.add(new_order)
    db.flush()

    for item in order_items_data:
        db.add(OrderItem(order_id=new_order.id, **item))
    
    # 3. RAZORPAY LOGIC
    razorpay_order_data = None
    if order_data.payment_method == "RAZORPAY":
        amount_in_paise = int(grand_total * 100)
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": f"order_{new_order.id}",
                "payment_capture": 1
            })
            razorpay_order_data = {
                "id": razorpay_order['id'],
                "amount": razorpay_order['amount'],
                "key": os.getenv("RAZORPAY_KEY_ID")
            }
            # Save the Razorpay Order ID to our DB for verification later
            # (Optional but recommended: add a column 'razorpay_order_id' to your Order table)
            # new_order.razorpay_order_id = razorpay_order['id'] 
        except Exception as e:
            print(f"Razorpay Error: {e}")
            raise HTTPException(status_code=500, detail="Payment Gateway Error")
    else:
        # If COD, clear cart immediately. 
        # For Razorpay, we clear cart ONLY after success (in verify route)
        db.query(Cart).filter(Cart.user_id == user_id).delete()

    db.commit()

    return {
        "message": "Order placed", 
        "order_id": new_order.id, 
        "total": grand_total,
        "razorpay_order_id": razorpay_order_data['id'] if razorpay_order_data else None,
        "razorpay_key_id": razorpay_order_data['key'] if razorpay_order_data else None,
        "razorpay_amount": razorpay_order_data['amount'] if razorpay_order_data else None,
        "currency": "INR"
    }

# --- UPDATE VERIFICATION (Activate Order & Clear Cart) ---
@app.post("/api/payments/verify")
def verify_payment(data: PaymentVerification, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # 1. Verify Signature
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': data.razorpay_order_id,
            'razorpay_payment_id': data.razorpay_payment_id,
            'razorpay_signature': data.razorpay_signature
        })

        # 2. Find the Order
        # Ideally, fetch by razorpay_order_id if you saved it. 
        # If not, we find the latest 'payment_pending' order for this user.
        order = db.query(Order).filter(
            Order.user_id == current_user["id"],
            Order.status == "payment_pending"
        ).order_by(Order.created_at.desc()).first()

        if not order:
            raise HTTPException(404, "Order not found or already processed")

        # 3. ACTIVATE ORDER
        order.status = "pending" # Now it becomes visible to Restaurant/Rider
        order.payment_status = "paid"
        
        # 4. CLEAR CART (Only now!)
        db.query(Cart).filter(Cart.user_id == current_user["id"]).delete()
        
        db.commit()
        return {"status": "success", "message": "Payment verified and Order Placed"}

    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment Verification Failed")

        
# --- TRACKING (GPS Version) ---
@app.get("/api/orders/track")
def track_active_order(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.user_id == current_user["id"],
        Order.status.notin_(["delivered", "cancelled"])
    ).order_by(Order.created_at.desc()).first()
    
    if not order: return {"active": False}
    
    return {
        "active": True,
        "id": order.id,
        "status": order.status,
        "total": order.total_amount,
        "restaurant_name": order.restaurant.name if order.restaurant else "Restaurant",
        "restaurant_location": {"lat": 22.3039, "lng": 70.8022}, 
        "user_location": {"lat": 22.2980, "lng": 70.7950},
        "rider_location": {"lat": 22.3010, "lng": 70.7990},
        "items": [{"name": i.name, "qty": i.quantity} for i in order.items]
    }

# --- CUSTOMER ORDER HISTORY ---
@app.get("/api/orders/customer/{user_id}")
def get_customer_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(
        Order.user_id == user_id,
        Order.status.notin_(["delivered", "cancelled"])
    ).order_by(Order.created_at.desc()).all()
    
    response_data = []
    for o in orders:
        response_data.append({
            "_id": o.id,
            "id": o.id,
            "status": o.status,
            "total": o.total_amount,
            "restaurant_name": o.restaurant.name if o.restaurant else "Unknown Restaurant",
            "location": { "lat": 22.3039, "lng": 70.8022 }
        })
    return response_data

# --- RESTAURANT ORDERS (With Full Details) ---
@app.get("/api/restaurant/orders")
def get_restaurant_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user["role"] != "restaurant": 
        raise HTTPException(403, "Access denied")
    
    orders = db.query(Order).filter(
        Order.restaurant_id == current_user["restaurant_id"]
    ).order_by(Order.created_at.desc()).all()

    response_data = []
    for o in orders:
        response_data.append({
            "id": o.id,
            "status": o.status,
            "total_amount": o.total_amount,
            "created_at": o.created_at,
            "rider_name": o.rider_name,
            "customer_name": o.user.full_name if o.user else "Guest Customer",
            "delivery_address": o.delivery_address, 
            "items": [
                { "name": item.name, "quantity": item.quantity, "addons": item.addons } 
                for item in o.items
            ]
        })
    return response_data

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, update: OrderStatusUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order: raise HTTPException(404)
    order.status = update.status 
    db.commit()
    return {"message": "Status updated", "status": order.status}

@app.post("/api/orders/{order_id}/cancel")
def cancel_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user["id"]).first()
    if not order: raise HTTPException(404, "Order not found")
    if order.status != "pending": raise HTTPException(400, "Cannot cancel order")
    order.status = "cancelled"
    db.commit()
    return {"message": "Order cancelled successfully"}


# ==============================================================================
#  RIDER DASHBOARD API (Corrected & Consolidated)
# ==============================================================================

# In main.py, replace the 'get_rider_stats' function with this:

# @app.get("/api/rider/stats")
# def get_rider_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     # 1. Fetch User Data (Added this to get Name/Email for UI)
#     user = db.query(User).filter(User.id == current_user["id"]).first()
    
#     rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
#     # 2. Auto-create Rider Profile if missing (Your existing logic)
#     if not rider:
#         rider = Rider(
#             user_id=user.id,
#             is_active=True,
#             is_available=False, 
#             total_earnings=0.0,
#             total_trips=0
#         )
#         db.add(rider)
#         db.commit()
#         db.refresh(rider)

#     # 3. Check for active orders (Your existing logic)
#     active_order = db.query(Order).filter(
#         Order.rider_id == current_user["id"], 
#         Order.status.in_(["accepted", "ready", "out_for_delivery"])
#     ).order_by(Order.created_at.desc()).first()

#     # 4. Format Active Order
#     active_order_data = None
#     if active_order:
#         active_order_data = {
#             "id": active_order.id,
#             "status": active_order.status,
#             "total": active_order.total_amount,
#             "restaurant_name": active_order.restaurant.name if active_order.restaurant else "Unknown",
#             "restaurant_address": active_order.restaurant.address if active_order.restaurant else "",
#             "delivery_address": active_order.delivery_address
#         }

#     # 5. Return Data (Added 'name' and 'email' here)
#     return {
#         "name": user.full_name,          # <--- NEW: Sends name to frontend
#         "email": user.email,             # <--- NEW: Sends email to frontend
#         "is_online": rider.is_available,
#         "total_earnings": round(rider.total_earnings or 0.0, 2),
#         "total_trips": rider.total_trips or 0,
#         "active_order": active_order_data
#     }

@app.get("/api/rider/stats")
def get_rider_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Fetch User Data
    user = db.query(User).filter(User.id == current_user["id"]).first()
    
    rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
    # 2. Auto-create Rider Profile if missing
    if not rider:
        rider = Rider(
            user_id=user.id,
            is_active=True,
            is_available=False, 
            total_earnings=0.0,
            total_trips=0
        )
        db.add(rider)
        db.commit()
        db.refresh(rider)

    # 3. Check for active orders
    active_order = db.query(Order).filter(
        Order.rider_id == current_user["id"], 
        Order.status.in_(["accepted", "ready", "out_for_delivery"])
    ).order_by(Order.created_at.desc()).first()

    # 4. Format Active Order
    active_order_data = None
    if active_order:
        active_order_data = {
            "id": active_order.id,
            "status": active_order.status,
            "total": active_order.total_amount,
            "restaurant_name": active_order.restaurant.name if active_order.restaurant else "Unknown",
            "restaurant_address": active_order.restaurant.address if active_order.restaurant else "",
            "delivery_address": active_order.delivery_address
        }

    # 5. Return Data (Added username and phone)
    return {
        "username": user.username,       # <--- NEW: Required for the edit form
        "name": user.full_name,          
        "email": user.email,             
        "phone": user.phone,             # <--- NEW: Required for the edit form
        "is_online": rider.is_available,
        "total_earnings": round(rider.total_earnings or 0.0, 2),
        "total_trips": rider.total_trips or 0,
        "active_order": active_order_data
    }


# @app.put("/api/rider/profile")
# def update_rider_profile(data: RiderProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
#     user = db.query(User).filter(User.id == current_user["id"]).first()
    
#     if not user: 
#         raise HTTPException(status_code=404, detail="User not found")
    
#     # Check if email is being changed to one that already exists (excluding self)
#     if data.email != user.email:
#         existing_email = db.query(User).filter(User.email == data.email, User.id != user.id).first()
#         if existing_email:
#             raise HTTPException(status_code=400, detail="Email already in use")

#     user.full_name = data.full_name
#     user.email = data.email
#     if data.phone:
#         user.phone = data.phone
    
#     db.commit()
    
#     return {
#         "message": "Profile updated successfully", 
#         "name": user.full_name, 
#         "email": user.email,
#         "phone": user.phone
#     }

@app.put("/api/rider/profile")
def update_rider_profile(data: RiderProfileUpdate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. FETCH USER
    user = db.query(User).filter(User.id == current_user["id"]).first()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. VALIDATE USERNAME (New Logic)
    # If the username is changing, check if the new one is already taken by someone else
    if data.username != user.username:
        existing_username = db.query(User).filter(User.username == data.username, User.id != user.id).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")

    # 3. VALIDATE EMAIL
    if data.email != user.email:
        existing_email = db.query(User).filter(User.email == data.email, User.id != user.id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")

    # 4. UPDATE USER TABLE
    user.username = data.username  # <--- Update Username here
    user.full_name = data.full_name
    user.email = data.email
    if data.phone:
        user.phone = data.phone

    # 5. UPDATE RIDER TABLE (Syncing data if columns exist)
    rider = db.query(Rider).filter(Rider.user_id == user.id).first()
    if rider:
        # These checks prevent crashes if your Rider table doesn't have these specific columns
        if hasattr(rider, 'full_name'): 
            rider.full_name = data.full_name
        if hasattr(rider, 'phone'): 
            rider.phone = data.phone
        if hasattr(rider, 'email'): 
            rider.email = data.email

    db.commit()
    
    return {
        "message": "Profile updated successfully", 
        "username": user.username,   # <--- Return new username to Frontend
        "name": user.full_name, 
        "email": user.email,
        "phone": user.phone
    }

@app.post("/api/rider/status")
def toggle_rider_status(status_data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    if not rider: raise HTTPException(404, "Rider profile not found")
    rider.is_available = status_data.get("is_online", False)
    db.commit()
    return {"is_online": rider.is_available}

# In your main.py, find the get_available_orders function and update the filter:

@app.get("/api/rider/orders/available")
def get_available_orders(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    
    if not rider or not rider.is_available: 
        return []
    
    # Check if rider is currently busy
    busy = db.query(Order).filter(
        Order.rider_id == current_user["id"], 
        Order.status.in_(["accepted", "ready", "out_for_delivery"])
    ).first()
    
    if busy: 
        return []

    # --- UPDATED FILTER ---
    # We now include "accepted" so riders see orders as soon as the restaurant hits Accept
    orders = db.query(Order).filter(
        Order.status.in_(["accepted", "preparing", "ready"]), 
        Order.rider_id == None
    ).all()

    return [{
        "id": o.id,
        "total": o.total_amount,
        "status": o.status,
        "restaurant_name": o.restaurant.name if o.restaurant else "Unknown",
        "restaurant_address": o.restaurant.address if o.restaurant else "Location",
        "delivery_address": o.delivery_address,
        "created_at": o.created_at
    } for o in orders]

    
@app.post("/api/rider/orders/{order_id}/accept")
def accept_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order: raise HTTPException(404, "Order not found")
    if order.rider_id: raise HTTPException(400, "Order already taken")

    order.rider_id = current_user["id"] 
    order.rider_name = current_user.get("full_name", "Rider") 
    order.status = "accepted"
    
    db.commit()
    return {"message": "Order Accepted"}

@app.post("/api/rider/orders/{order_id}/pickup")
def pickup_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user["id"]).first()
    if not order: raise HTTPException(404, "Order not found")
    order.status = "out_for_delivery"
    db.commit()
    return {"message": "Order Picked Up"}

@app.post("/api/rider/orders/{order_id}/complete")
def complete_order(order_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    rider = db.query(Rider).filter(Rider.user_id == current_user["id"]).first()
    order = db.query(Order).filter(Order.id == order_id, Order.rider_id == current_user["id"]).first()
    
    if not order: raise HTTPException(404, "Order not found")
    if order.status == "delivered": return {"message": "Already delivered"}

    order.status = "delivered"
    order.payment_status = "paid"

    # --- EARNINGS LOGIC (10%) ---
    commission = order.total_amount * 0.10
    rider.total_earnings = (rider.total_earnings or 0) + commission
    rider.total_trips = (rider.total_trips or 0) + 1

    db.commit()
    return { "message": "Order Completed", "earned": commission, "total_earnings": rider.total_earnings }


# ==============================================================================
#  EXISTING ROUTES (Favorites, Cart, Profile, etc.)
# ==============================================================================

@app.get("/api/favorites/list") 
def get_favorites_list(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    fav_items = db.query(MenuItem).join(Favorite, Favorite.menu_item_id == MenuItem.id).filter(Favorite.user_id == current_user["id"]).all()
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

@app.get("/api/cart")
def get_user_cart(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_items = db.query(Cart).filter(Cart.user_id == current_user["id"]).all()
    return [{
        "id": item.menu_item.id, "name": item.menu_item.name,
        "price": item.price if item.price > 0 else item.menu_item.price,
        "discount_price": item.menu_item.discount_price, "image": item.menu_item.image,
        "description": item.menu_item.description, "quantity": item.quantity,
        "cart_id": item.id, "addons": item.addons 
    } for item in cart_items if item.menu_item]

@app.post("/api/cart")
def update_cart_item(data: CartAdd, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user["id"]
    unit_price = 0
    if data.total_price and data.quantity > 0: unit_price = data.total_price / data.quantity
    cart_item = db.query(Cart).filter(Cart.user_id == user_id, Cart.menu_item_id == data.menu_item_id).first()
    if cart_item:
        new_qty = cart_item.quantity + data.quantity
        if new_qty > 0:
            cart_item.quantity = new_qty
            if unit_price > 0: cart_item.price = unit_price
            if data.customization: cart_item.addons = data.customization
        else: db.delete(cart_item)
    elif data.quantity > 0:
        new_item = Cart(user_id=user_id, menu_item_id=data.menu_item_id, quantity=data.quantity, price=unit_price, addons=data.customization)
        db.add(new_item)
    db.commit()
    return {"message": "Cart updated"}

def format_items(items):
    return [{
        "id": item.id, "name": item.name, "category": item.category,
        "description": item.description, "price": item.price,
        "discountPrice": item.discount_price, "type": "veg" if item.is_veg else "non-veg",
        "is_veg": item.is_veg, "isAvailable": item.is_available, "image": item.image 
    } for item in items]

@app.post("/api/restaurant-request")
def submit_restaurant_request(request: RestaurantRequestCreate, db: Session = Depends(get_db)):
    if db.query(RestaurantRequest).filter(RestaurantRequest.email == request.email).first(): raise HTTPException(status_code=400, detail="Application with this email already exists.")
    if db.query(Restaurant).filter(Restaurant.email == request.email).first(): raise HTTPException(status_code=400, detail="Restaurant is already active.")
    new_request = RestaurantRequest(restaurant_name=request.restaurantName, owner_name=request.ownerName, email=request.email, phone=request.phone, address=request.address, status="pending")
    db.add(new_request)
    db.commit()
    return {"message": "Application submitted successfully!", "id": new_request.id}

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
        return Response(content=base64.b64decode(img_str), media_type="image/jpeg", headers={"Cache-Control": "public, max-age=31536000"})
    except: return Response(status_code=500)

@app.get("/restaurants/{restaurant_id}")
def get_restaurant_detail(restaurant_id: int, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant: raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant

@app.get("/users/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    profile_image = user.profile_image
    if user.role == "restaurant":
        res_data = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if res_data: profile_image = res_data.profile_image
    return {"id": user.id, "username": user.username, "full_name": user.full_name, "email": user.email, "phone": user.phone, "role": user.role, "profile_image": profile_image}

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
    new_user = User(username=user.username, full_name=user.full_name, email=user.email, phone=user.phone, hashed_password=hash_password(user.password), role=user.role if user.role else "customer")
    db.add(new_user)
    db.commit()
    return {"message": "Registration successful"}

@app.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).options(defer(User.profile_image)).first()
    if not user or not verify_password(form_data.password, user.hashed_password): raise HTTPException(401, "Invalid credentials")
    restaurant_id = None
    if user.role == "restaurant":
        res = db.query(Restaurant).filter(Restaurant.email == user.email).first()
        if res: restaurant_id = res.id
    token = jwt.encode({"sub": user.username, "id": user.id, "role": user.role, "restaurant_id": restaurant_id, "exp": datetime.now(timezone.utc) + timedelta(hours=2)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer", "role": user.role, "username": user.username, "user_id": user.id, "restaurant_id": restaurant_id}

@app.get("/api/restaurant/me")
def get_my_profile(res: Restaurant = Depends(get_current_restaurant), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == res.email).first()
    return {"id": res.id, "name": res.name, "email": res.email, "address": res.address, "is_active": res.is_active, "profile_image": res.profile_image, "username": user.username if user else None}

@app.put("/api/restaurant/update")
async def update_restaurant_profile(bg_tasks: BackgroundTasks, name: str = Form(...), email: str = Form(...), address: str = Form(...), username: str = Form(...), password: Optional[str] = Form(None), profile_image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), res: Restaurant = Depends(get_current_restaurant)):
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
    new_request = RiderRequest(full_name=request.fullName, email=request.email, phone=request.phone, city=request.city, vehicle_type=request.vehicleType, status="pending")
    db.add(new_request)
    db.commit()
    return {"message": "Rider Application Received!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)