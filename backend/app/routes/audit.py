from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.agent_service import AgentService

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/agents/{agent_id}/services")
def fetch_service_status(agent_id: int, db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.get_service_status(agent_id)