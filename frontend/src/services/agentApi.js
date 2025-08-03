import { toast } from "react-hot-toast";

const API_BASE_URL = "http://localhost:8000/deploy";

export const fetchAgentStatus = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/status`);
        if (!res.ok) throw new Error("Failed to fetch agent status");
        return await res.json();
    } catch (err) {
        toast.error("Failed to load agent status");
        throw err;
    }
};

export const fetchAgentMetrics = async (agentId) => {
    if (!agentId) return;
    try {
        const res = await fetch(`${API_BASE_URL}/metrics/${agentId}`);
        if (!res.ok) throw new Error("Failed to fetch agent metrics");
        return await res.json();
    } catch (err) {
        console.log("Failed to load agent metrics");
        throw err;
    }
};

export const deleteAgent = async (agentId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/${agentId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete agent");
        toast.success("Agent deleted successfully!");
        return true;
    } catch (err) {
        toast.error("Failed to delete agent");
        throw err;
    }
};

export const refreshAgent = async (agentId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/refresh/${agentId}`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to refresh agent");
        const updatedAgent = await res.json();
        toast.success("Agent status updated!");
        return updatedAgent;
    } catch (err) {
        toast.error("Failed to update agent status");
        throw err;
    }
};

export async function createAgent(ip, port, password) {
    const response = await fetch(`${API_BASE_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip, port, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create agent");
    }

    return response.json();
}