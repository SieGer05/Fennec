from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from .services.agent_service import AgentService

def get_agent_service(db: Session = Depends(get_db)) -> AgentService:
    return AgentService(db)