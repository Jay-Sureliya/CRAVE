from sqlalchemy import Column, Integer, String
from app.db.session import Base

class RiderRequest(Base):
    __tablename__ = "rider_requests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    city = Column(String, nullable=False)
    vehicle_type = Column(String, default="bike")
    status = Column(String, default="pending")