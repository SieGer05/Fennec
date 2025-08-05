from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import AgentCredential as AgentCredentialModel
from ..schemas import AgentCredentialCreate, AgentCredential
import paramiko
from typing import List, Dict, Any

class AgentService:
   def __init__(self, db: Session):
      self.db = db

   def create_agent(self, agent: AgentCredentialCreate) -> AgentCredential:
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

   def refresh_agent_status(self, agent_id: int) -> AgentCredential:
      agent = self._get_agent_or_404(agent_id)
      
      try:
         with self._ssh_connect(agent) as ssh:
            self._update_agent_status_via_ssh(ssh, agent)
      except Exception as e:
         print(f"SSH connection failed for agent {agent_id}: {e}")
         agent.status = "disconnected"

      self.db.commit()
      self.db.refresh(agent)
      return agent

   def get_agent_by_id(self, agent_id: int) -> AgentCredential:
      return self._get_agent_or_404(agent_id)

   def get_agent_metrics(self, agent_id: int) -> Dict[str, str]:
      agent = self._get_agent_or_404(agent_id)
      
      try:
         with self._ssh_connect(agent) as ssh:
            return self._fetch_agent_metrics(ssh)
      except Exception as e:
         raise HTTPException(status_code=500, detail=f"SSH Error: {e}")

   def delete_agent(self, agent_id: int) -> Dict[str, str]:
      agent = self._get_agent_or_404(agent_id)
      self.db.delete(agent)
      self.db.commit()
      return {"message": "Agent deleted successfully"}

   # Helper methods
   def _get_agent_or_404(self, agent_id: int) -> AgentCredentialModel:
      agent = self.db.query(AgentCredentialModel).filter(AgentCredentialModel.id == agent_id).first()
      if not agent:
         raise HTTPException(status_code=404, detail="Agent not found")
      return agent

   def _ssh_connect(self, agent):
      ssh = paramiko.SSHClient()
      ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
      ssh.connect(
         hostname=agent.ip,
         port=agent.port,
         username=agent.username,
         password=agent.password,
         timeout=5
      )
      return ssh

   def _update_agent_status_via_ssh(self, ssh, agent):
      _, stdout, _ = ssh.exec_command("id")
      result = stdout.read().decode().strip()

      if result:
         agent.status = "active"
         self._update_agent_info_from_file(ssh, agent)
      else:
         agent.status = "pending"

   def _update_agent_info_from_file(self, ssh, agent):
      _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/static_info.txt")
      file_content = stdout.read().decode().strip()
      lines = file_content.splitlines()

      try:
         agent.vpn_actif = lines[lines.index("VPN Actif") + 1].strip()
         agent.version = lines[lines.index("Version Logiciel") + 1].strip()
         agent.os = lines[lines.index("Système d exploitation") + 1].strip()
         agent.last_connection = lines[lines.index("Dernière connexion") + 1].strip()
      except ValueError:
         print("Could not parse static_info.txt: missing expected labels")

   def _fetch_agent_metrics(self, ssh) -> Dict[str, str]:
      _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/system_metrics.txt")
      output = stdout.read().decode().strip().splitlines()

      return {
         "cpu": output[1] if len(output) > 1 else "N/A",
         "memory": output[3] if len(output) > 3 else "N/A",
         "disk": output[5] if len(output) > 5 else "N/A",
         "uptime": output[7] if len(output) > 7 else "N/A"
      }