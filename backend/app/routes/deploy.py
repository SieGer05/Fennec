from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import AgentCredentialCreate, AgentCredential
from ..models import AgentCredential as AgentCredentialModel
from ..database import get_db
import paramiko

router = APIRouter(prefix="/deploy", tags=["Deploy"])

@router.post("/", response_model=AgentCredential)
def create_agent_credential(agent: AgentCredentialCreate, db: Session = Depends(get_db)):
    db_agent = AgentCredentialModel(
        nom=agent.nom,
        ip=agent.ip,
        port=agent.port,
        username=agent.username,
        password=agent.password,
        status=agent.status,
        os=agent.os,
        version=agent.version
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@router.get("/", response_model=list[AgentCredential])
def get_agent_credentials(db: Session = Depends(get_db)):
    return db.query(AgentCredentialModel).all()

@router.get("/status")
def get_agent_status(db: Session = Depends(get_db)):
    agents = db.query(AgentCredentialModel).all()

    counts = {
        "Active": 0,
        "Pending": 0,
        "Never Connected": 0,
        "Disconnected": 0
    }

    for agent in agents:
        if agent.status == "active":
            counts["Active"] += 1
        elif agent.status == "pending":
            counts["Pending"] += 1
        elif agent.status == "never_connected":
            counts["Never Connected"] += 1
        else:
            counts["Disconnected"] += 1

    result = [{"name": k, "value": v} for k, v in counts.items()]
    return result

@router.post("/refresh/{agent_id}")
def refresh_agent_status(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AgentCredentialModel).filter(AgentCredentialModel.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            hostname=agent.ip,
            port=agent.port,
            username=agent.username,
            password=agent.password,
            timeout=5  
        )

        _, stdout, _ = ssh.exec_command("id")
        result = stdout.read().decode().strip()

        if result:  
            agent.status = "active"
            agent.nom = "connected"
        else:
            agent.status = "pending"

        ssh.close()

    except Exception as e:
        print(f"SSH connection failed for agent {agent_id}: {e}")
        agent.status = "disconnected"

    db.commit()
    db.refresh(agent)

    return agent