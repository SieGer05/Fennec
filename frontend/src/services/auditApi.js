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

export const fetchMariadbConfiguration = async (agentId) => {
    const { data } = await api.get(
        `${AUDIT_BASE}/agents/${agentId}/mariadb-configuration`   
    );
    return data;
}

export const fetchWebminConfiguration = async (agentId) => {
    const { data } = await api.get(
        `${AUDIT_BASE}/agents/${agentId}/webmin-configuration`   
    );
    return data;
}

export const analyzeAudit = async (auditData) => {
    const { data } = await api.post(
        `${AUDIT_BASE}/analyze-audit`,
        { audits: auditData },
        {
            timeout: 120000, 
            showToast: true
        }
    );
    return data;
};