from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    
    # --- FOREIGN KEYS ---
    user_id = Column(Integer, ForeignKey("users.id"))                 
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))     
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    
    # --- DATA ---
    status = Column(String, default="pending") 
    total_amount = Column(Float)
    payment_method = Column(String) 
    payment_status = Column(String, default="pending")
    delivery_address = Column(Text)
    
    rider_name = Column(String, nullable=True)
    rider_phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # --- RELATIONSHIPS (FIXED) ---
    items = relationship("OrderItem", back_populates="order")
    restaurant = relationship("Restaurant")
    
    # Explicitly tell SQLAlchemy which FK to use to avoid "Ambiguous Join" error
    user = relationship("User", foreign_keys=[user_id]) 
    rider = relationship("User", foreign_keys=[rider_id])

class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    
    name = Column(String)
    price = Column(Float)
    quantity = Column(Integer)
    addons = Column(String, default="[]") 

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")