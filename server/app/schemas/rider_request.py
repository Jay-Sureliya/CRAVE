from pydantic import BaseModel
from typing import Optional


class RiderRequestCreate(BaseModel):
    fullName: str
    email: str
    phone: str
    city: str
    vehicleType: str

    class Config:
        from_attributes = True

class RiderRequestResponse(BaseModel):
    id: int
    fullName: str
    email: str
    phone: str
    city: str
    vehicleType: str
    status: str

    class Config:
        from_attributes = True