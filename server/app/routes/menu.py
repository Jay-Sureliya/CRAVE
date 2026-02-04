from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.menu import MenuItem
import base64

router = APIRouter(prefix="/api/menu", tags=["Menu"])

# --- ADD MENU ITEM (Base64 Version) ---
@router.post("/add")
async def add_menu_item(
    name: str = Form(...),
    description: str = Form(None),
    price: float = Form(...),
    discount_price: float = Form(None),
    is_veg: bool = Form(True),
    category: str = Form(...),
    restaurant_id: int = Form(...),
    image: UploadFile = File(None), 
    db: Session = Depends(get_db)
):
    image_data_url = None

    # 1. Convert Image to Base64 String
    if image:
        # Read the file bytes
        contents = await image.read()
        
        # Encode to Base64
        encoded_string = base64.b64encode(contents).decode("utf-8")
        
        # Create Data URL (e.g., "data:image/jpeg;base64,.....")
        # We assume jpeg/png; modern browsers handle this well.
        content_type = image.content_type or "image/jpeg"
        image_data_url = f"data:{content_type};base64,{encoded_string}"

    # 2. Save directly to Database
    new_item = MenuItem(
        name=name,
        description=description,
        price=price,
        discount_price=discount_price,
        is_veg=is_veg,
        category=category,
        restaurant_id=restaurant_id,
        image=image_data_url  # Now storing the actual image data string
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return {
        "message": "Item added successfully", 
        "id": new_item.id
    }

# --- GET MENU ---
@router.get("/{restaurant_id}")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return items