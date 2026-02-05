from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    # Ensure "restaurants.id" matches the table name in your Restaurant model
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    
    is_veg = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    
    # Stores Base64 string
    image = Column(Text, nullable=True) 

    # Relationship back to Restaurant
    restaurant = relationship("Restaurant", back_populates="menu_items")