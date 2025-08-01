from sqlalchemy import Column, Integer, String
from .database import Base

class User(Base):
   __tablename__ = "users"

   id = Column(Integer, primary_key=True, index=True)
   username = Column(String, unique=True, index=True)
   password = Column(String) 

class AgentCredential(Base):
   __tablename__ = "agent_credentials"

   id = Column(Integer, primary_key=True, index=True)
   nom = Column(String, default="Not connected")  
   ip = Column(String, nullable=False)
   port = Column(Integer, nullable=False)
   username = Column(String, default="fennec_user")  
   password = Column(String, nullable=False) 
   status = Column(String, default="pending") 
   os = Column(String, default="Not connected")
   version = Column(String, default="Not connected")
   vpn_actif = Column(String, default="non")     
   last_connection = Column(String, default="N/A")
