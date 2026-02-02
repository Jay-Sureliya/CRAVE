from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.menu import MenuItem
from app.schemas.menu import MenuItemCreate

router = APIRouter(prefix="/api/menu", tags=["Menu"])

# --- ADD MENU ITEM ---
@router.post("/add")
def add_menu_item(item: MenuItemCreate, db: Session = Depends(get_db)):
    new_item = MenuItem(
        name=item.name,
        price=item.price,
        restaurant_id=item.restaurant_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"message": "Item added successfully", "id": new_item.id}

# --- GET MENU FOR A RESTAURANT ---
@router.get("/{restaurant_id}")
def get_menu(restaurant_id: int, db: Session = Depends(get_db)):
    items = db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
    return items