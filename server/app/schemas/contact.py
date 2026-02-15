from pydantic import BaseModel, EmailStr

# Base schema (shared properties)
class ContactSchema(BaseModel):
    name: str
    email: EmailStr
    message: str

    class Config:
        # This tells Pydantic to read data even if it's not a dict, but an ORM model
        from_attributes = True