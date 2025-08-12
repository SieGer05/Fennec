from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import AgentCredential as AgentCredentialModel
from ..schemas import AgentCredentialCreate, AgentCredential
from typing import List, Dict, Any
from contextlib import contextmanager
import paramiko
from paramiko.ssh_exception import NoValidConnectionsError, SSHException

class AgentService:
   def __init__(self, db: Session):
      self.db = db

   # -----------------------
   # CRUD METHODS
   # -----------------------
   def create_agent(self, agent: AgentCredentialCreate) -> AgentCredential:
      clean_ip = agent.ip.replace(".", "")
      generated_name = f"Agent-{clean_ip}"

      db_agent = AgentCredentialModel(
         nom=generated_name,
         ip=agent.ip,
         port=agent.port,
         username=agent.username,
         public_key=agent.public_key, 
         status=agent.status,
         os=agent.os,
         version=agent.version
      )
      
      self.db.add(db_agent)
      self.db.commit()
      self.db.refresh(db_agent)
      
      return db_agent

   def get_all_agents(self) -> List[AgentCredential]:
      return self.db.query(AgentCredentialModel).all()

   def get_agent_status_counts(self) -> List[Dict[str, Any]]:
      agents = self.db.query(AgentCredentialModel).all()
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
      
      return [{"name": k, "value": v} for k, v in counts.items()]

   def get_agent_by_id(self, agent_id: int) -> AgentCredential:
      return self._get_agent_or_404(agent_id)

   def delete_agent(self, agent_id: int) -> Dict[str, str]:
      agent = self._get_agent_or_404(agent_id)
      self.db.delete(agent)
      self.db.commit()
      
      return {"message": "Agent deleted successfully"}

   # -----------------------
   # STATUS & METRICS METHODS
   # -----------------------
   def refresh_agent_status(self, agent_id: int) -> AgentCredential:
      agent = self._get_agent_or_404(agent_id)
      try:
         with self._ssh_connect(agent) as ssh:
            _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/static_info.txt")
            lines = stdout.read().decode().strip().splitlines()

            info = {}
            for i in range(0, len(lines), 2):
               key = lines[i].strip().lower().replace(" ", "_")
               value = lines[i+1].strip() if i+1 < len(lines) else ""
               info[key] = value

            agent.os = info.get("système_d_exploitation", agent.os)
            agent.version = info.get("version_logiciel", agent.version)
            agent.vpn_status = info.get("vpn_actif", getattr(agent, 'vpn_status', 'non'))
            agent.last_connection = info.get("dernière_connexion", getattr(agent, 'last_connection', 'N/A'))

            agent.status = "active"

         self.db.commit()
         self.db.refresh(agent)
         
         return agent

      except (NoValidConnectionsError, SSHException):
         agent.status = "disconnected"
         self.db.commit()
         self.db.refresh(agent)
         
         return agent
      
      except Exception:
         agent.status = "disconnected"
         self.db.commit()
         self.db.refresh(agent)
         
         raise

   def get_agent_metrics(self, agent_id: int) -> Dict[str, str]:
      agent = self._get_agent_or_404(agent_id)
      
      try:
         with self._ssh_connect(agent) as ssh:
            return self._fetch_agent_metrics(ssh)
      
      except (NoValidConnectionsError, SSHException) as e:
         raise HTTPException(status_code=500, detail=f"Connection Error: {e}")
      
      except Exception as e:
         raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

   # -----------------------
   # HELPER METHODS
   # -----------------------
   def _get_agent_or_404(self, agent_id: int) -> AgentCredentialModel:
      agent = self.db.query(AgentCredentialModel).filter(AgentCredentialModel.id == agent_id).first()
      
      if not agent:
         raise HTTPException(status_code=404, detail="Agent not found")
      
      return agent

   @contextmanager
   def _ssh_connect(self, agent):
      """
      Connect to the SSH server using key authentication,
      relying on Paramiko default key loading and ssh-agent.
      """
      ssh = paramiko.SSHClient()
      ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
      
      try:
         ssh.connect(
               hostname=agent.ip,
               port=agent.port,
               username=agent.username,
               look_for_keys=True,   
               allow_agent=True,    
               timeout=5
         )
         yield ssh
      
      finally:
         ssh.close()

   def _fetch_agent_metrics(self, ssh) -> Dict[str, str]:
      _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/system_metrics.txt")
      output = stdout.read().decode().strip().splitlines()
      
      return {
         "cpu": output[1] if len(output) > 1 else "N/A",
         "memory": output[3] if len(output) > 3 else "N/A",
         "disk": output[5] if len(output) > 5 else "N/A",
         "uptime": output[7] if len(output) > 7 else "N/A"
      }

   def get_service_status(self, agent_id: int) -> List[Dict[str, str]]:
      agent = self._get_agent_or_404(agent_id)
      
      try:
         with self._ssh_connect(agent) as ssh:
            _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/service_status.txt")
            lines = stdout.read().decode().strip().splitlines()
            seen = set()
            services = []
            for line in reversed(lines):
               parts = line.split(maxsplit=1)
               if len(parts) == 2:
                  service, status = parts
                  if service not in seen:
                        seen.add(service)
                        services.append({"service": service, "status": status})
            services.reverse()
            return services
      
      except Exception as e:
         raise HTTPException(status_code=500, detail=f"Error fetching service status: {e}")

   def get_agent_credentials(self, agent_id: int) -> AgentCredentialModel:
      return self._get_agent_or_404(agent_id)