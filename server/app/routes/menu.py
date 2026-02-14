from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Response
from fastapi.concurrency import run_in_threadpool 
from sqlalchemy.orm import Session, defer
from sqlalchemy import text
from typing import List, Optional
import base64
import io
import os 
from dotenv import load_dotenv 
from PIL import Image 
from jose import jwt, JWTError

from app.db.session import get_db
from app.models.menu import MenuItem
from app.models.user import Restaurant
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, ConfigDict, Field

# --- CONFIG ---
load_dotenv() 
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here") 
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

router = APIRouter()

# --- HELPER: Compress Image ---
def compress_image(image_file: UploadFile, max_size=(800, 800), quality=70) -> str:
    try:
        img = Image.open(image_file.file)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.thumbnail(max_size)
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG", quality=quality, optimize=True)
        buffer.seek(0)
        encoded = base64.b64encode(buffer.read()).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"
    except Exception as e:
        print(f"Error compressing image: {e}")
        return None

# --- DEPENDENCY ---
def get_current_restaurant(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "restaurant": raise HTTPException(403, "Not authorized")
        res_id = payload.get("restaurant_id")
        if not res_id: raise HTTPException(404, "Restaurant ID not found")
        restaurant = db.query(Restaurant).filter(Restaurant.id == res_id).first()
        if not restaurant: raise HTTPException(404, "Restaurant not found")
        return restaurant
    except JWTError:
        raise HTTPException(401, "Invalid session")

# ======================= SCHEMAS =======================
class MenuItemLite(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None
    price: float
    
    # CamelCase conversion
    discount_price: Optional[float] = Field(None, serialization_alias="discountPrice")
    is_veg: bool = True
    is_available: bool = Field(True, serialization_alias="isAvailable")
    
    # --- NEW: Include addons in the response ---
    addons: Optional[str] = "[]"
    
    # NO IMAGE (Speed Optimization)
    model_config = ConfigDict(from_attributes=True)

class MenuItemFull(MenuItemLite):
    # Full model including image for detail views
    image: Optional[str] = None

# ======================= ROUTES =======================

# 1. GET Public Menu (For Customer Frontend - No Token Needed)
@router.get("/api/public/menu/{restaurant_id}", response_model=List[MenuItemLite])
def get_public_menu(restaurant_id: int, db: Session = Depends(get_db)):
    return db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant_id
    ).options(defer(MenuItem.image)).all()

# 2. GET Single Item Details (Needed for FoodItemDetails page)
@router.get("/api/public/menu/item/{item_id}", response_model=MenuItemFull)
def get_single_menu_item(item_id: int, db: Session = Depends(get_db)):
    # Here we DO want the image, so we don't defer it
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# 3. GET Menu Item Image (Public - Lazy Load)
@router.get("/api/menu/image/{item_id}")
def get_menu_item_image(item_id: int, db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    
    if not item or not item.image:
        return Response(status_code=404)

    try:
        img_str = item.image
        if "base64," in img_str:
            _, img_str = img_str.split("base64,", 1)
        image_data = base64.b64decode(img_str)
        # Add Cache-Control for performance
        return Response(content=image_data, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=31536000"})
    except Exception:
        return Response(status_code=500)

# 4. GET My Menu (For Restaurant Dashboard - REQUIRES TOKEN)
@router.get("/api/menu", response_model=List[MenuItemLite])
def get_my_menu(
    db: Session = Depends(get_db),
    current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    return db.query(MenuItem).filter(MenuItem.restaurant_id == current_restaurant.id).options(defer(MenuItem.image)).all()

# 5. ADD Item
@router.post("/api/menu")
async def add_menu_item(
    name: str = Form(...), category: str = Form(...), description: str = Form(""),
    price: float = Form(...), discountPrice: Optional[float] = Form(None), 
    type: str = Form(...), isAvailable: str = Form(...), 
    addons: str = Form("[]"), # <--- ACCEPT ADDONS JSON STRING
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), current_restaurant: Restaurant = Depends(get_current_restaurant) 
):
    image_data = None
    if image:
        image_data = await run_in_threadpool(compress_image, image)

    new_item = MenuItem(
        restaurant_id=current_restaurant.id, 
        name=name, 
        category=category, 
        description=description,
        price=price, 
        discount_price=discountPrice, 
        is_veg=(type.lower() == "veg"),
        is_available=(isAvailable.lower() == "true"), 
        addons=addons, # <--- SAVE ADDONS
        image=image_data 
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Item added", "id": new_item.id}

# 6. UPDATE Item
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
    addons: Optional[str] = Form(None), # <--- ACCEPT ADDONS UPDATE
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), current_restaurant: Restaurant = Depends(get_current_restaurant)
):
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == current_restaurant.id).first()
    if not item: raise HTTPException(404, "Item not found")

    if name: item.name = name
    if category: item.category = category
    if description: item.description = description
    if price is not None: item.price = price
    if discountPrice is not None: item.discount_price = discountPrice
    if type: item.is_veg = (type == "veg")
    if isAvailable is not None: item.is_available = (isAvailable.lower() == 'true')
    if addons is not None: item.addons = addons # <--- UPDATE ADDONS
    if image: item.image = await run_in_threadpool(compress_image, image)

    db.commit()
    return {"message": "Updated successfully"}

# 7. DELETE Item
@router.delete("/api/menu/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), current_restaurant: Restaurant = Depends(get_current_restaurant)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id, MenuItem.restaurant_id == current_restaurant.id).first()
    if not item: raise HTTPException(404, "Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Deleted successfully"}

# 8. GET Categories (For Dashboard - REQUIRES TOKEN)
@router.get("/api/categories", response_model=List[str])
def get_categories(db: Session = Depends(get_db), current_restaurant: Restaurant = Depends(get_current_restaurant)):
    try:
        sql = text("SELECT DISTINCT category FROM menu_items WHERE restaurant_id = :rid AND category IS NOT NULL")
        result = db.execute(sql, {"rid": current_restaurant.id})
        return [row[0] for row in result]
    except: return []