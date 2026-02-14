# from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
# from sqlalchemy.orm import relationship
# from app.db.session import Base

# class Rider(Base):
#     __tablename__ = "riders"

#     id = Column(Integer, primary_key=True, index=True)
#     user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
#     # Specific Rider Details
#     vehicle_type = Column(String, default="bike") # bike, bicycle, car
#     city = Column(String)
#     is_active = Column(Boolean, default=True) # Is the rider currently working?
#     is_available = Column(Boolean, default=True) # Is the rider available for a new order?
    
#     # Future proofing: Live Location
#     current_latitude = Column(Float, nullable=True)
#     current_longitude = Column(Float, nullable=True)

#     # Relationship back to User (for name, email, phone)
#     user = relationship("User", back_populates="rider_profile")


from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Rider Details
    vehicle_type = Column(String, nullable=True)
    city = Column(String, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)      # Admin approval
    is_available = Column(Boolean, default=False)  # Online/Offline Status
    
    # Location
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)

    # Stats (The new columns you added)
    total_earnings = Column(Float, default=0.0)
    total_trips = Column(Integer, default=0)

    # Relationships
    # This links back to the User model, but does NOT define it here
    user = relationship("User", back_populates="rider")