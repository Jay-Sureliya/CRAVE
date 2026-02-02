from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.session import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    # We link this item to a specific restaurant
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))