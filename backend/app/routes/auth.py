from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import UserLogin
from ..models import User
from ..utils.security import verify_password
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
   db_user = db.query(User).filter(User.username == user.username).first()
   if not db_user or not verify_password(user.password, db_user.password):
      raise HTTPException(status_code=401, detail="Invalid credentials")
   return {"message": "Login successful"}