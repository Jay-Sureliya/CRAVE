# # from sqlalchemy import Column, Integer, String, Boolean, Text
# # from app.db.session import Base

# # class User(Base):
# #     __tablename__ = "users"

# #     id = Column(Integer, primary_key=True, index=True)
# #     username = Column(String, unique=True, index=True)
# #     full_name = Column(String)
# #     email = Column(String, unique=True, index=True)
# #     phone = Column(String)
# #     hashed_password = Column(String)
# #     role = Column(String, default="customer")
    
# #     # Updated: Added profile_image with Text type for Base64 support
# #     # server_default ensures the database handles the default value on refresh
# #     profile_image = Column(
# #         Text, 
# #         default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
# #         server_default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
# #     )

# # class Restaurant(Base):
# #     __tablename__ = "restaurants"

# #     id = Column(Integer, primary_key=True, index=True)
# #     name = Column(String)
# #     email = Column(String, unique=True, index=True)
# #     password = Column(String)
# #     is_active = Column(Boolean, default=True)

# from sqlalchemy import Column, Integer, String, Boolean, Text
# from sqlalchemy.orm import relationship  # <--- NEW IMPORT
# from app.db.session import Base

# class User(Base):
#     __tablename__ = "users"

#     id = Column(Integer, primary_key=True, index=True)
#     username = Column(String, unique=True, index=True)
#     full_name = Column(String)
#     email = Column(String, unique=True, index=True)
#     phone = Column(String)
#     hashed_password = Column(String)
#     role = Column(String, default="customer")
    
#     profile_image = Column(
#         Text, 
#         default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
#         server_default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
#     )

# class Restaurant(Base):
#     __tablename__ = "restaurants"

#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String)
#     email = Column(String, unique=True, index=True)
#     password = Column(String)
#     is_active = Column(Boolean, default=True)

#     # --- NEW RELATIONSHIP ---
#     # This allows you to do: restaurant.menu_items
#     menu_items = relationship("MenuItem", back_populates="restaurant")


from sqlalchemy import Column, Integer, String, Boolean, Text
from sqlalchemy.orm import relationship 
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="customer")

    rider_profile = relationship("Rider", back_populates="user", uselist=False)
    
    profile_image = Column(
        Text, 
        default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
        server_default="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    )

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    is_active = Column(Boolean, default=True)
    
    # --- ADDED THESE COLUMNS ---
    address = Column(Text, nullable=True)
    profile_image = Column(String, nullable=True) 

    # Relationship to Menu Items
    menu_items = relationship("MenuItem", back_populates="restaurant")