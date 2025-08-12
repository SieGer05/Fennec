from contextlib import contextmanager
import paramiko
from typing import Dict
from threading import Lock
import time
from ..models import AgentCredential as AgentCredentialModel

class SSHCache:
    def __init__(self):
        self._connections: Dict[int, tuple] = {} 
        self._lock = Lock()
        self.connection_timeout = 300  

    @contextmanager
    def get_connection(self, agent: AgentCredentialModel):
        """Get a cached SSH connection or create a new one"""
        with self._lock:
            self._clean_expired_connections()

            ssh = None
            if agent.id in self._connections:
                ssh, _ = self._connections[agent.id]
                if not self._is_connection_alive(ssh):
                    self._close_connection(agent.id)
                    ssh = None
            
            if not ssh:
                ssh = self._create_new_connection(agent)
                self._connections[agent.id] = (ssh, time.time())

            try:
                yield ssh
                self._connections[agent.id] = (ssh, time.time())
            except Exception:
                self._close_connection(agent.id)
                raise

    def _clean_expired_connections(self):
        current_time = time.time()
        expired = [
            agent_id for agent_id, (_, last_used) in self._connections.items()
            if current_time - last_used > self.connection_timeout
        ]
        for agent_id in expired:
            self._close_connection(agent_id)

    def _is_connection_alive(self, ssh: paramiko.SSHClient) -> bool:
        try:
            transport = ssh.get_transport()
            return transport and transport.is_active()
        except:
            return False

    def _create_new_connection(self, agent: AgentCredentialModel) -> paramiko.SSHClient:
        """Create new SSH connection using key authentication from default locations or agent"""
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            hostname=agent.ip,
            port=agent.port,
            username=agent.username,
            look_for_keys=True,   
            allow_agent=True,     
            timeout=10
        )
        return ssh

    def _close_connection(self, agent_id: int):
        if agent_id in self._connections:
            ssh, _ = self._connections.pop(agent_id)
            try:
                ssh.close()
            except:
                pass

    def cleanup(self):
        with self._lock:
            for agent_id in list(self._connections.keys()):
                self._close_connection(agent_id)

ssh_cache = SSHCache()