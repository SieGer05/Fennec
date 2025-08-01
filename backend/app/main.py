from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine, SessionLocal
from fastapi import FastAPI
from .models import User
from .routes import auth, deploy

app = FastAPI()

app.add_middleware(
   CORSMiddleware,
   allow_origins=["http://localhost:5173"],  # React dev server
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

def init_admin():
   db = SessionLocal()
   if not db.query(User).filter(User.username == "admin").first():
      admin = User(username="admin", password="$2b$12$5xrx/YgB4y593kiBIZ.FNecYSmnqu9mwN.s/0zcvPJZUGCyWRKsmK")
      db.add(admin)
      db.commit()
   db.close()

init_admin()

app.include_router(auth.router)
app.include_router(deploy.router)