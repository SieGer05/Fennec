from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas import AgentCredentialCreate, AgentCredential
from ..models import AgentCredential as AgentCredentialModel
from ..database import get_db
import paramiko

router = APIRouter(prefix="/deploy", tags=["Deploy"])

@router.post("/", response_model=AgentCredential)
def create_agent_credential(agent: AgentCredentialCreate, db: Session = Depends(get_db)):
    clean_ip = agent.ip.replace(".", "")  
    generated_name = f"Agent-{clean_ip}"

    db_agent = AgentCredentialModel(
        nom=generated_name,  
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
            _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/static_info.txt")
            file_content = stdout.read().decode().strip()

            lines = file_content.splitlines()
            try:
                vpn_index = lines.index("VPN Actif") + 1
                version_index = lines.index("Version Logiciel") + 1
                os_index = lines.index("Système d exploitation") + 1
                last_conn_index = lines.index("Dernière connexion") + 1

                agent.vpn_actif = lines[vpn_index].strip()
                agent.version = lines[version_index].strip()
                agent.os = lines[os_index].strip()
                agent.last_connection = lines[last_conn_index].strip()

            except ValueError:
                print("Could not parse static_info.txt: missing expected labels")

        else:
            agent.status = "pending"

        ssh.close()

    except Exception as e:
        print(f"SSH connection failed for agent {agent_id}: {e}")
        agent.status = "disconnected"

    db.commit()
    db.refresh(agent)

    return agent

@router.get("/{agent_id}", response_model=AgentCredential)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AgentCredentialModel).filter(AgentCredentialModel.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent
