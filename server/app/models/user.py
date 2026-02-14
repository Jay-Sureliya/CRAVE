from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship 
from app.db.session import Base

# 1. USER
# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True)
#     full_name = Column(String)
#     email = Column(String, unique=True, index=True)
#     phone = Column(String)
#     hashed_password = Column(String)
#     role = Column(String, default="customer")

#     rider_profile = relationship("Rider", back_populates="user", uselist=False)
    
#     profile_image = Column(
#         Text, 
#         default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
#         server_default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
#     )

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="customer")
    
    # --- NEW COLUMN FOR ADDRESS ---
    # This stores the full readable text: "Area, Rajkot, Gujarat, 360005"
    address = Column(Text, nullable=True) 

    rider = relationship("Rider", back_populates="user", uselist=False)
    
    profile_image = Column(
        Text, 
        default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    )


# 2. RESTAURANT
class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_active = Column(Boolean, default=True)
    
    address = Column(Text, nullable=True)
    profile_image = Column(Text, nullable=True) 

    # Relationship to Menu Items
    menu_items = relationship("MenuItem", back_populates="restaurant")

# 3. FAVORITES (NEW TABLE)
class Favorite(Base):
    __tablename__ = "favorites"

    # Composite Primary Key prevents duplicate likes
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), primary_key=True)

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime