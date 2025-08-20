import api from './api';

const AUDIT_BASE = '/audit';

export const fetchAgentServices = async (agentId) => {
    const { data } = await api.get(`${AUDIT_BASE}/agents/${agentId}/services`, {
        showToast: false 
    });
    return data;
};

export const fetchSSHConfiguration = async (agentId) => {
    const { data } = await api.get(
        `${AUDIT_BASE}/agents/${agentId}/ssh-configuration`
    );
    return data;
};

export const fetchApache2Configuration = async (agentId) => {
    const { data } = await api.get(
        `${AUDIT_BASE}/agents/${agentId}/apache2-configuration`
    );
    return data;
}

export const fetchMariadbCOnfiguration = async (agentId) => {
    const { data } = await api.get(
        `${AUDIT_BASE}/agents/${agentId}/mariadb-configuration`   
    );
    return data;
}