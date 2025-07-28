from fastapi import FastAPI
from .database import Base, engine, SessionLocal
from .models import User
from .utils.security import hash_password
from .routes import auth

app = FastAPI()

Base.metadata.create_all(bind=engine)

def init_admin():
   db = SessionLocal()
   if not db.query(User).filter(User.username == "admin").first():
      admin = User(username="admin", password=hash_password("admin"))
      db.add(admin)
      db.commit()
   db.close()

init_admin()

app.include_router(auth.router)