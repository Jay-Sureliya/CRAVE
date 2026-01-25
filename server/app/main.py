from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.db.session import engine, Base, get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.routes import restaurant

# ---------------- CONFIG ----------------
SECRET_KEY = "mysecretkey"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ---------------- APP ----------------
app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(restaurant.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HELPERS ----------------
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def hash_password(password):
    return pwd_context.hash(password)

# ---------------- AUTH ----------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="User exists")

    new_user = User(
        username=user.username,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    return {"message": "User created"}

@app.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }

# ---------------- DEPENDENCIES ----------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def admin_only(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

def restaurant_only(user=Depends(get_current_user)):
    if user["role"] != "restaurant":
        raise HTTPException(status_code=403, detail="Restaurant only")

# ---------------- DASHBOARDS ----------------
@app.get("/admin/dashboard")
def admin_dashboard(dep=Depends(admin_only)):
    return {
        "total_orders": 120,
        "revenue": 5400,
        "active_restaurants": 18
    }

@app.get("/restaurant/dashboard")
def restaurant_dashboard(dep=Depends(restaurant_only)):
    return {
        "pending_orders": 6,
        "today_earnings": 950
    }
