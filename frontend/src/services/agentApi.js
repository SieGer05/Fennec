import api from './api';
import { toast } from 'react-hot-toast';

const DEPLOY_BASE = '/deploy';

export const fetchAgentStatus = async () => {
    const { data } = await api.get(`${DEPLOY_BASE}/status`);
    return data;
};

export const fetchAgentMetrics = async (agentId) => {
    if (!agentId) return;
    const { data } = await api.get(`${DEPLOY_BASE}/metrics/${agentId}`, {
        showToast: false
    });
    return data;
};

export const deleteAgent = async (agentId) => {
    await api.delete(`${DEPLOY_BASE}/${agentId}`);
    toast.success("Agent deleted successfully!");
    return true;
};

export const refreshAgent = async (agentId) => {
    const { data } = await api.post(`${DEPLOY_BASE}/refresh/${agentId}`);
    toast.success("Statut de l'agent mis à jour !");
    return data;
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
        return data;
    } catch (err) {
        const errorMsg = err.response?.data?.detail || err.message || "Failed to create agent";
        throw new Error(errorMsg);
    }
};