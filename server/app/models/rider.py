from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.db.session import Base

class Rider(Base):
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Specific Rider Details
    vehicle_type = Column(String, default="bike") # bike, bicycle, car
    city = Column(String)
    is_active = Column(Boolean, default=True) # Is the rider currently working?
    is_available = Column(Boolean, default=True) # Is the rider available for a new order?
    
    # Future proofing: Live Location
    current_latitude = Column(Float, nullable=True)
    current_longitude = Column(Float, nullable=True)

    # Relationship back to User (for name, email, phone)
    user = relationship("User", back_populates="rider_profile")