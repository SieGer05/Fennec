from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.agent_service import AgentService
from ..services.ssh_manager import ssh_cache
from ..services.ssh_audit import SSHAudit
from ..services.apache2_audit import Apache2Audit
from ..services.mariadb_audit import MariaDBAudit

from ..schemas import AuditRequest
from ..services.ai_analyzer import analyze_security_audit

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/agents/{agent_id}/services")
def fetch_service_status(agent_id: int, db: Session = Depends(get_db)):
    service = AgentService(db)
    return service.get_service_status(agent_id)

@router.get("/agents/{agent_id}/ssh-configuration") 
def audit_ssh_configuration(agent_id: int, db: Session = Depends(get_db)):
    agent_service = AgentService(db)
    agent = agent_service.get_agent_credentials(agent_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        with ssh_cache.get_connection(agent) as ssh:
            _, stdout, stderr = ssh.exec_command("sudo sshd -T")
            config_content = stdout.read().decode("utf-8").strip()
            error = stderr.read().decode("utf-8").strip()
            
            if error:
                raise Exception(f"sshd -T error: {error}")
                
            auditor = SSHAudit()
            results = auditor.audit_config(config_content)
            return results
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"SSH audit failed: {str(e)}"
        )

@router.get("/agents/{agent_id}/apache2-configuration")
def audit_apache2_configuration(agent_id: int, db: Session = Depends(get_db)):
    agent_service = AgentService(db)
    agent = agent_service.get_agent_credentials(agent_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        with ssh_cache.get_connection(agent) as ssh:
            auditor = Apache2Audit()
            results = auditor.audit_config(ssh)
            return results
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Apache2 audit failed: {str(e)}"
        )

@router.get("/agents/{agent_id}/mariadb-configuration")
def audit_mariadb_configuration(agent_id: int, db: Session = Depends(get_db)):
    agent_service = AgentService(db)
    agent = agent_service.get_agent_credentials(agent_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        with ssh_cache.get_connection(agent) as ssh:
            cat_command = "cat /etc/mysql/mariadb.conf.d/50-server.cnf"
            
            _, stdout, stderr = ssh.exec_command(cat_command)
            config_content = stdout.read().decode("utf-8").strip()
            error = stderr.read().decode("utf-8").strip()
            
            if error:
                raise Exception(f"Error reading config file: {error}")
                
            auditor = MariaDBAudit()
            results = auditor.audit_config(config_content)
            return results
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"MariaDB audit failed: {str(e)}"
        )

from ..services.webmin_audit import WebminAudit

@router.get("/agents/{agent_id}/webmin-configuration")
def audit_webmin_configuration(agent_id: int, db: Session = Depends(get_db)):
    agent_service = AgentService(db)
    agent = agent_service.get_agent_credentials(agent_id)
    
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        with ssh_cache.get_connection(agent) as ssh:
            auditor = WebminAudit()
            results = auditor.audit_config(ssh)
            return results
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Webmin audit failed: {str(e)}"
        )

@router.post("/analyze-audit")
def analyze_audit_results(request: AuditRequest, db: Session = Depends(get_db)):
    """
    Analyze security audit findings using AI
    """
    try:
        if not request.audits:
            raise HTTPException(status_code=400, detail="No audit data provided")
        
        analysis_result = analyze_security_audit(request.audits)
        
        response_data = {"analysis": analysis_result}
        return response_data
        
    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"AI analysis failed: {str(e)}"
        )