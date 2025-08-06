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