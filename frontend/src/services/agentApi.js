import api from './api';
import { toast } from 'react-hot-toast';

const DEPLOY_BASE = '/deploy';

export const fetchAgents = async () => {
  try {
    const { data } = await api.get(DEPLOY_BASE);
    return data;
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch agents');
  }
};

export const fetchAgentById = async (agentId) => {
  try {
    const { data } = await api.get(`${DEPLOY_BASE}/${agentId}`);
    return data;
  } catch (error) {
    console.error(`Failed to fetch agent ${agentId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch agent');
  }
};

export const fetchAgentStatus = async () => {
  try {
    const { data } = await api.get(`${DEPLOY_BASE}/status`);
    return data;
  } catch (error) {
    console.error('Failed to fetch agent status:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch agent status');
  }
};

export const fetchAgentMetrics = async (agentId) => {
  if (!agentId) {
    console.warn('No agentId provided to fetchAgentMetrics');
    return null;
  }
  
  try {
    const { data } = await api.get(`${DEPLOY_BASE}/metrics/${agentId}`, {
      showToast: false
    });
    return data;
  } catch (error) {
    console.error(`Failed to fetch metrics for agent ${agentId}:`, error);
    throw new Error(error.response?.data?.message || 'Failed to fetch agent metrics');
  }
};

export const deleteAgent = async (agentId) => {
  try {
      await api.delete(`${DEPLOY_BASE}/${agentId}`);
      toast.success("Agent deleted successfully!");
      return true;
  } catch (error) {
      toast.error("Failed to delete agent");
      throw error;
  }
};

export const refreshAgent = async (agentId) => {
  try {
      const { data } = await api.post(`${DEPLOY_BASE}/refresh/${agentId}`);
      toast.success("Statut de l'agent mis à jour !");
      return data;
  } catch (error) {
      toast.error("Failed to refresh agent");
      throw error;
  }
};

export const createAgent = async (ip, port, publicKey) => {
  try {
      const { data } = await api.post(`${DEPLOY_BASE}/`, { 
          ip, 
          port,
          public_key: publicKey, 
          username: 'fennec_user',
          status: 'pending',      
          os: 'Not connected',    
          version: 'Not connected'
      });
      toast.success("Agent created successfully!");
      return data;
  } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to create agent";
      toast.error(errorMsg);
      throw new Error(errorMsg);
  }
};