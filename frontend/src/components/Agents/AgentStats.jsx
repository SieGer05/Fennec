import { useEffect, useState } from "react";
import AgentPieChart from "./AgentPieChart";
import StatCard from "./StatCard";
import PerformanceList from "./PerformanceList";
import { fetchAgentStatus, fetchAgentMetrics } from "../../services";


function AgentStats({ agent }) {
  const [statusData, setStatusData] = useState([]);
  const [performances, setPerformances] = useState([]);

  const loadStatus = async () => {
    try {
      const data = await fetchAgentStatus();
      setStatusData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAgentMetrics = async (agentId) => {
    if (!agentId) return;

    try {
      const data = await fetchAgentMetrics(agentId);
      if (data) {
        setPerformances([
          { label: "CPU Usage", value: data.cpu },
          { label: "Memory Usage", value: data.memory },
          { label: "Free Disk Space", value: data.disk },
          { label: "Uptime", value: data.uptime },
        ]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadStatus();
    if (agent?.id) {
      loadAgentMetrics(agent.id);
    } else {
      setPerformances([]);
    }
  }, [agent]);

  return (
    <div className="mt-10 flex space-x-6 h-65">
      {/* Pie Chart Section */}
      <div className="flex-2 border border-purple-300 ml-6 rounded-sm relative shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Agent Status
        </h2>
        <AgentPieChart data={statusData} />
      </div>

      {/* Agent Details Section */}
      <div className="flex-3 border border-purple-300 rounded-sm relative h-50 mt-7 shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Agent Details
        </h2>

        {agent ? (
          <>
            <div className="flex font-roboto mt-13 space-x-15 justify-center text-sm">
              <StatCard title={"IP Address"} value={agent.ip} />
              <StatCard title={"VPN Active"} value={agent.vpn_actif || "No"} />
              <StatCard title={"Software Version"} value={agent.version} />
              <StatCard title={"Last Connection"} value={agent.last_connection} />
            </div>

            <div className="flex font-roboto mt-9 ml-5 space-x-13 text-sm">
              <StatCard title={"Operating System"} value={agent.os} isBottom={true} />
              <StatCard title={"Agent Name"} value={agent.nom} isBottom={true} />
            </div>
          </>
        ) : (
          <p className="text-center mt-20 text-gray-400 italic">No agent available</p>
        )}
      </div>

      {/* Performance Section */}
      <div className="flex-2 border border-purple-300 mr-6 rounded-sm relative shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Performance
        </h2>
        <PerformanceList performances={performances} />
      </div>
    </div>
  );
}

export default AgentStats;