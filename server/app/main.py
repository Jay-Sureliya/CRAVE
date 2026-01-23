from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta, datetime
from jose import jwt, JWTError

# --- IMPORTS FROM FILE STRUCTURE ---
from .db.session import engine, Base, get_db
from .models.user import User
from .schemas.user import UserCreate

# --- CONFIG ---
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# Create Tables (In production, use Alembic instead)
Base.metadata.create_all(bind=engine)

# CORS (Allow React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HELPER FUNCTIONS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- ENDPOINTS ---

# 1. Register/Create Admin (Run this once via Postman/Swagger to create your admin)
@app.post("/register")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        full_name=user.full_name,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {new_user.username} created"}

# 2. Login (Updated for DB)
@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Find user in DB
    user = db.query(User).filter(User.username == form_data.username).first()
    
    # Check if user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    # Create Token
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

# 3. Protected Admin Route
# In backend/app/main.py

@app.get("/admin/dashboard")
def admin_dashboard(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        
        if role != "admin":
             raise HTTPException(status_code=403, detail="Not authorized")
        
        # --- ADD THIS STATS BLOCK BACK ---
        return {
            "message": f"Welcome Admin {username}",
            "database_status": "Connected to PostgreSQL",
            "stats": {
                "total_orders": 150,
                "active_drivers": 12,
                "revenue": "$5,400"
            }
        }
        # ---------------------------------

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")