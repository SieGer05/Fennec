const API_URL = "http://localhost:8000";

export async function fetchAgentServices(agentId) {
    try {
        const response = await fetch(`${API_URL}/audit/agents/${agentId}/services`);

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data; 

    } catch (error) {
        console.error("Failed to fetch agent services:", error);
        throw error;
    }
}

export async function fetchSSHConfiguration(agentId) {
    try {
        const response = await fetch(
            `${API_URL}/audit/agents/${agentId}/ssh-configuration`
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.detail || response.statusText;
            throw new Error(`Error ${response.status}: ${errorMsg}`);
        }

        return await response.json();

    } catch (error) {
        console.error(`Failed to fetch SSH configuration for agent ${agentId}:`, error);
        throw error;
    }
}