from sqlalchemy import Column, Integer, String
from app.db.session import Base

class RestaurantRequest(Base):
    __tablename__ = "restaurant_requests"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_name = Column(String, nullable=False)
    owner_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    status = Column(String, default="pending")
