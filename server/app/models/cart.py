from pydantic import BaseModel
from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

from sqlalchemy import Column, Integer, ForeignKey, String, Float, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from typing import Optional

class Cart(Base):
    __tablename__ = "carts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)
    
    # --- NEW COLUMNS ---
    # Store the calculated price (Base + Addons)
    price = Column(Float, default=0.0) 
    # Store the addon details (JSON string)
    addons = Column(Text, default="[]")

    # Relationships
    menu_item = relationship("MenuItem")
    user = relationship("User")

class CartAdd(BaseModel):
    menu_item_id: int
    quantity: int
    customization: Optional[str] = "[]" # Receive addons
    total_price: Optional[float] = 0.0  # Receive total price from frontend