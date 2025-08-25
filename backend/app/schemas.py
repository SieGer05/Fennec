from pydantic import BaseModel
from typing import List, Any

class UserLogin(BaseModel):
   username: str
   password: str

class AgentCredentialBase(BaseModel):
   nom: str = "not connected"
   ip: str
   port: int
   username: str = "fennec_user"
   public_key: str  
   status: str = "pending"
   os: str = "Not connected"
   version: str = "not connected"
   vpn_actif: str = "non"
   last_connection: str = "N/A"

class AgentCredentialCreate(AgentCredentialBase):
   pass

class AgentCredential(AgentCredentialBase):
   id: int

   class Config:
      from_attributes = True

class AuditRequest(BaseModel):
   audits: List[Any]