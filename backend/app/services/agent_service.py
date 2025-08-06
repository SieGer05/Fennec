from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..models import AgentCredential as AgentCredentialModel
from ..schemas import AgentCredentialCreate, AgentCredential
from typing import List, Dict, Any
from contextlib import contextmanager
import paramiko
from paramiko.ssh_exception import AuthenticationException, NoValidConnectionsError, SSHException


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
         password=agent.password,  # Consider encrypting this in production
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
      """
      Refresh the agent's status by connecting via SSH and updating info.
      """
      agent = self._get_agent_or_404(agent_id)

      try:
         with self._ssh_connect(agent) as ssh:
               self._update_agent_status_via_ssh(ssh, agent)
      except (AuthenticationException, NoValidConnectionsError, SSHException) as e:
         print(f"SSH connection failed for agent {agent_id}: {e}")
         agent.status = "disconnected"
      except Exception as e:
         print(f"Unexpected error while refreshing agent {agent_id}: {e}")
         agent.status = "disconnected"

      self.db.commit()
      self.db.refresh(agent)
      return agent

   def get_agent_metrics(self, agent_id: int) -> Dict[str, str]:
      """
      Fetch live metrics (CPU, memory, disk, uptime) via SSH.
      """
      agent = self._get_agent_or_404(agent_id)

      try:
         with self._ssh_connect(agent) as ssh:
               return self._fetch_agent_metrics(ssh)
      except (AuthenticationException, NoValidConnectionsError, SSHException) as e:
         raise HTTPException(status_code=500, detail=f"SSH Error: {e}")
      except Exception as e:
         raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

   # -----------------------
   # HELPER METHODS
   # -----------------------

   def _get_agent_or_404(self, agent_id: int) -> AgentCredentialModel:
      """
      Fetch an agent or raise 404 if not found.
      """
      agent = self.db.query(AgentCredentialModel).filter(AgentCredentialModel.id == agent_id).first()
      if not agent:
         raise HTTPException(status_code=404, detail="Agent not found")
      return agent

   @contextmanager
   def _ssh_connect(self, agent):
      """
      Open SSH connection and ensure proper cleanup.
      """
      ssh = paramiko.SSHClient()
      ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
      ssh.connect(
         hostname=agent.ip,
         port=agent.port,
         username=agent.username,
         password=agent.password,
         timeout=5
      )
      try:
         yield ssh
      finally:
         ssh.close()

   def _update_agent_status_via_ssh(self, ssh, agent):
      """
      Run a simple command to verify SSH connection and update status/info.
      """
      _, stdout, _ = ssh.exec_command("id")
      result = stdout.read().decode().strip()

      if result:
         agent.status = "active"
         self._update_agent_info_from_file(ssh, agent)
      else:
         agent.status = "pending"

   def _update_agent_info_from_file(self, ssh, agent):
      """
      Parse static info file from the agent and update DB fields.
      """
      _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/static_info.txt")
      file_content = stdout.read().decode().strip()
      lines = file_content.splitlines()

      # Defensive parsing: read key-value pairs in 2-line format
      data = {}
      for i in range(0, len(lines), 2):
         key = lines[i].strip()
         value = lines[i + 1].strip() if i + 1 < len(lines) else ""
         data[key] = value

      agent.vpn_actif = data.get("VPN Actif", "N/A")
      agent.version = data.get("Version Logiciel", "N/A")
      agent.os = data.get("Système d exploitation", "N/A")
      agent.last_connection = data.get("Dernière connexion", "N/A")

   def _fetch_agent_metrics(self, ssh) -> Dict[str, str]:
      """
      Fetch system metrics (CPU, memory, disk, uptime) from remote file.
      """
      _, stdout, _ = ssh.exec_command("cat /home/fennec_user/analysis/system_metrics.txt")
      output = stdout.read().decode().strip().splitlines()

      return {
         "cpu": output[1] if len(output) > 1 else "N/A",
         "memory": output[3] if len(output) > 3 else "N/A",
         "disk": output[5] if len(output) > 5 else "N/A",
         "uptime": output[7] if len(output) > 7 else "N/A"
      }