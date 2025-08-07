from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from fastapi import FastAPI
from .models import User
from .routes import auth, deploy, audit
from .config import settings
from .services.ssh_manager import ssh_cache

app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=settings.cors_origins,  # React dev server
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def init_admin():
   db = SessionLocal()
   if not db.query(User).filter(User.username == settings.admin_username).first():
      admin = User(username=settings.admin_username, password=settings.admin_password_hash)
      db.add(admin)
      db.commit()
   db.close()

init_admin()

app.include_router(auth.router)
app.include_router(deploy.router)
app.include_router(audit.router)

@app.on_event("shutdown")
async def shutdown_event():
   """Clean up resources when application shuts down"""
   ssh_cache.cleanup() 
