from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey # <--- Ensure Text is imported
from sqlalchemy.orm import relationship
from app.db.session import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False)
    
    price = Column(Float, nullable=False)
    discount_price = Column(Float, nullable=True)
    
    is_veg = Column(Boolean, default=True)
    
    # CHANGE THIS TO TEXT
    image = Column(Text, nullable=True) 
    
    is_available = Column(Boolean, default=True)

    restaurant = relationship("Restaurant", back_populates="menu_items")