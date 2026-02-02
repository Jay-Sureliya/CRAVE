from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Get the Database URL from .env
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# --- UPDATE THIS SECTION ---
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    # Add this line to automatically reconnect if the connection drops
    pool_pre_ping=True  
)
# ---------------------------

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()