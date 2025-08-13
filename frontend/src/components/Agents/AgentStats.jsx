import { useEffect, useState } from "react";
import AgentPieChart from "./AgentPieChart";
import StatCard from "./StatCard";
import PerformanceList from "./PerformanceList";
import { fetchAgentStatus, fetchAgentMetrics } from "../../services";

function AgentStats({ agent }) {
  const [statusData, setStatusData] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [metricsError, setMetricsError] = useState(null); 

  const loadStatus = async () => {
    try {
      setLoadingStatus(true);
      setStatusError(null);
      const data = await fetchAgentStatus();
      setStatusData(data);
    } catch (err) {
      console.error("Error loading status:", err);
      setStatusError(err.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadAgentMetrics = async (agentId) => {
    if (!agentId) {
      setPerformances([]);
      return;
    }

    try {
      setLoadingMetrics(true);
      setMetricsError(null);
      const data = await fetchAgentMetrics(agentId);
      
      if (data) {
        setPerformances([
          { label: "CPU Usage", value: data.cpu || 0 },
          { label: "Memory Usage", value: data.memory || 0 },
          { label: "Free Disk Space", value: data.disk || 0 },
          { label: "Uptime", value: data.uptime || 0 },
        ]);
      }
    } catch (err) {
      console.error("Error loading metrics:", err);
      setMetricsError(err.message);
      setPerformances([]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    loadStatus();
    if (agent?.id) {
      loadAgentMetrics(agent.id);
    }
  }, [agent]);

  return (
    <div className="mt-10 flex space-x-6 h-65">
      {/* Pie Chart Section */}
      <div className="flex-2 border border-purple-300 ml-6 rounded-sm relative shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Statut de l'agent
        </h2>
        {loadingStatus ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : statusError ? (
          <div className="mt-23 italic text-center text-red-500 p-4">
            Échec du chargement du statut
          </div>
        ) : (
          <AgentPieChart data={statusData} />
        )}
      </div>

      {/* Agent Details Section */}
      <div className="flex-3 border border-purple-300 rounded-sm relative h-50 mt-7 shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Détails de l'agent
        </h2>

        {agent ? (
          <>
            <div className="flex font-roboto mt-13 space-x-15 justify-center text-sm">
              <StatCard title={"Adresse IP"} value={agent.ip} />
              <StatCard title={"VPN actif"} value={agent.vpn_actif || "Non"} />
              <StatCard title={"Version du logiciel"} value={agent.version} />
              <StatCard title={"Dernière connexion"} value={agent.last_connection} />
            </div>

            <div className="flex font-roboto mt-9 ml-5 space-x-13 text-sm">
              <StatCard title={"Système d'exploitation"} value={agent.os} isBottom={true} />
              <StatCard title={"Nom de l'agent"} value={agent.nom} isBottom={true} />
            </div>
          </>
        ) : (
          <p className="text-center mt-20 text-gray-400 italic">Aucun agent disponible</p>
        )}
      </div>

      {/* Performance Section */}
      <div className="flex-2 border border-purple-300 mr-6 rounded-sm relative shadow-sm">
        <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-purple-700 text-md font-semibold border py-0.5 rounded-2xl border-purple-300">
          Performance
        </h2>
        {loadingMetrics ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : metricsError ? (
          <div className="mt-23 italic text-center text-red-500 p-4">
            Échec du chargement des métriques
          </div>
        ) : (
          <PerformanceList performances={performances} />
        )}
      </div>
    </div>
  );
}

export default AgentStats;