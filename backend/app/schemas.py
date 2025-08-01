from pydantic import BaseModel

class UserLogin(BaseModel):
   username: str
   password: str

class AgentCredentialBase(BaseModel):
   nom: str = "not connected"
   ip: str
   port: int
   username: str = "fennec_user"
   password: str
   status: str = "pending"
   os: str = "Not connected"
   version: str = "not connected"

class AgentCredentialCreate(AgentCredentialBase):
   pass

class AgentCredential(AgentCredentialBase):
   id: int

   class Config:
      orm_mode = True
