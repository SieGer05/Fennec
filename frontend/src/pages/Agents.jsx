import { useState, useEffect } from "react";
import Header from "../components/Agents/Header";
import AgentStats from "../components/Agents/AgentStats";
import AgentUse from "../components/Agents/AgentUse";
import { toast } from "react-hot-toast";
import { fetchAgents, fetchAgentById } from "../services";

function Agents() {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await fetchAgents(); 
      setAgent(data.length > 0 ? data[0] : null);
    } catch (err) {
      toast.error("Failed to load agent data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);

  const handleAgentRefresh = async (agentId) => {
    if (!agentId) {
      setAgent(null);
      return;
    }
    
    try {
      const data = await fetchAgentById(agentId); 
      setAgent(data);
    } catch (err) {
      toast.error("Failed to refresh agent");
      console.error(err);
    }
  };

  return (
    <div className="bg-purple-200 w-full h-screen flex items-center justify-center">
      <div className="bg-white w-[98%] h-[97%]">
        <Header />
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <AgentStats agent={agent} />
            <AgentUse
              agent={agent}
              onAgentChange={setAgent}
              onRefresh={handleAgentRefresh}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Agents;