from fastapi import APIRouter, Depends
from ..schemas import AgentCredentialCreate, AgentCredential
from ..services.agent_service import AgentService
from ..dependencies import get_agent_service

router = APIRouter(prefix="/deploy", tags=["Deploy"])

@router.post("/", response_model=AgentCredential)
def create_agent_credential(
    agent: AgentCredentialCreate, 
    agent_service: AgentService = Depends(get_agent_service)  
):
    return agent_service.create_agent(agent)

@router.get("/", response_model=list[AgentCredential])
def get_agent_credentials(agent_service: AgentService = Depends(get_agent_service)):  
    return agent_service.get_all_agents()

@router.get("/status")
def get_agent_status(agent_service: AgentService = Depends(get_agent_service)):  
    return agent_service.get_agent_status_counts()

@router.post("/refresh/{agent_id}")
def refresh_agent_status(
    agent_id: int, 
    agent_service: AgentService = Depends(get_agent_service)  
):
    return agent_service.refresh_agent_status(agent_id)

@router.get("/{agent_id}", response_model=AgentCredential)
def get_agent(agent_id: int, agent_service: AgentService = Depends(get_agent_service)):  
    return agent_service.get_agent_by_id(agent_id)

@router.get("/metrics/{agent_id}")
def get_agent_metrics(agent_id: int, agent_service: AgentService = Depends(get_agent_service)): 
    return agent_service.get_agent_metrics(agent_id)

@router.delete("/{agent_id}")
def delete_agent(agent_id: int, agent_service: AgentService = Depends(get_agent_service)):  
    return agent_service.delete_agent(agent_id)