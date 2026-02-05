from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import base64
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.menu import MenuItem
from app.models.user import Restaurant # Import Restaurant model
from app.schemas.menu import MenuItemResponse

# --- CONFIG ---
SECRET_KEY = "your_secret_key_here" 
ALGORITHM = "HS256"
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()

# --- DEPENDENCY: Get Logged-in Restaurant ---
def get_current_restaurant(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "restaurant":
            raise HTTPException(status_code=403, detail="Not authorized")
        
        res_id = payload.get("restaurant_id")
        if not res_id:
            raise HTTPException(status_code=404, detail="Restaurant ID not found in token")
        
        restaurant = db.query(Restaurant).filter(Restaurant.id == res_id).first()
        if not restaurant:
            raise HTTPException(status_code=404, detail="Restaurant not found")
        return restaurant
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid session")

# ======================= ROUTES =======================

# 1. GET Menu Items
@router.get("/api/menu")
def get_menu(
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == current_restaurant.id).all()
    return [
        {
            "id": i.id,
            "name": i.name,
            "category": i.category,
            "description": i.description,
            "price": i.price,
            "discountPrice": i.discount_price, # Send as camelCase for frontend
            "type": "veg" if i.is_veg else "non-veg",
            "isAvailable": i.is_available,
            "image": i.image
        }
        for i in items
    ]

# 2. ADD Menu Item
@router.post("/api/menu")
async def add_menu_item(
    name: str = Form(...),
    category: str = Form(...),
    description: str = Form(""),
    price: float = Form(...),
    # FIX: Accept "discountPrice" (camelCase) from frontend FormData
    discountPrice: Optional[float] = Form(None), 
    type: str = Form(...),
    isAvailable: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # FIX: Ensure we get the logged-in restaurant
    current_restaurant: Restaurant = Depends(get_current_restaurant) 
):
    # Handle Image
    image_data = None
    if image:
        contents = await image.read()
        encoded = base64.b64encode(contents).decode("utf-8")
        image_data = f"data:{image.content_type};base64,{encoded}"

    new_item = MenuItem(
        restaurant_id=current_restaurant.id, # <--- FORCED SAVE ID
        name=name,
        category=category,
        description=description,
        price=price,
        discount_price=discountPrice, # <--- Mapped from camelCase input
        is_veg=(type.lower() == "veg"),
        is_available=(isAvailable.lower() == "true"),
        image=image_data
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Item added", "id": new_item.id}

# 3. UPDATE Menu Item
@router.put("/api/menu/{item_id}")
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
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id, 
        MenuItem.restaurant_id == current_restaurant.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if name: item.name = name
    if category: item.category = category
    if description: item.description = description
    if price is not None: item.price = price
    
    # Save Discount Price
    if discountPrice is not None: 
        item.discount_price = discountPrice

    if type: item.is_veg = (type == "veg")
    if isAvailable is not None: item.is_available = (isAvailable.lower() == 'true')

    if image:
        contents = await image.read()
        encoded = base64.b64encode(contents).decode("utf-8")
        item.image = f"data:{image.content_type};base64,{encoded}"

    db.commit()
    return {"message": "Updated successfully"}

# 4. DELETE Menu Item
@router.delete("/api/menu/{item_id}")
def delete_menu_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id, 
        MenuItem.restaurant_id == current_restaurant.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

# 5. GET Categories
@router.get("/api/categories", response_model=List[str])
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