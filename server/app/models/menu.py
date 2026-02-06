from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship, deferred # <--- IMPORTANT: deferred
from app.db.session import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)
    
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    
    # --- OPTIMIZATION ---
    # We use 'deferred' so the huge Base64 string is NOT loaded
    # when we just want to list the menu items.
    image = deferred(Column(Text, nullable=True))

    restaurant = relationship("Restaurant", back_populates="menu_items")