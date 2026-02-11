import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Use a fixed key for development
    SECRET_KEY = os.getenv("SECRET_KEY", "super_secret_fixed_key_12345")
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 120

settings = Settings()