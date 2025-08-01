import { useEffect, useState } from "react";
import AgentPieChart from "./AgentPieChart";
import StatCard from "./StatCard";
import PerformanceList from "./PerformanceList";
import { toast } from "react-hot-toast";

const performances = [
   { label: "Utilisation du CPU", value: "28 %" },
   { label: "Utilisation de la mémoire", value: "3.2 Go sur 8 Go" },
   { label: "Espace disque libre", value: "150 Go / 500 Go" },
   { label: "Temps de fonctionnement (uptime)", value: "5 jours, 12 heures" },
];

function AgentStats() {
   const [statusData, setStatusData] = useState([]);
   const [agentDetails, setAgentDetails] = useState(null);

   const fetchStatus = async () => {
      try {
         const res = await fetch("http://localhost:8000/deploy/status");
         if (!res.ok) throw new Error("Erreur lors de la récupération des statuts");
         const data = await res.json();
         setStatusData(data);
      } catch (err) {
         toast.error("Impossible de récupérer le statut des agents");
      }
   };

   const fetchAgentDetails = async (agentId = 1) => {
      try {
         const res = await fetch(`http://localhost:8000/deploy/${agentId}`);
         if (!res.ok) throw new Error("Erreur lors de la récupération des détails de l'agent");
         const data = await res.json();
         setAgentDetails(data);
      } catch (err) {
         toast.error("Impossible de récupérer les détails de l'agent");
      }
   };

   useEffect(() => {
      fetchStatus();
      fetchAgentDetails();

      const handleRefreshEvent = (event) => {
         const agentId = event?.detail || 1;
         fetchStatus();
         fetchAgentDetails(agentId);
      };

      window.addEventListener("agent-refresh", handleRefreshEvent);

      return () => {
         window.removeEventListener("agent-refresh", handleRefreshEvent);
      };
   }, []);

   return (
      <div className="mt-10 flex space-x-6 h-65">
         {/* Pie Chart Section */}
         <div className="flex-2 border border-purple-300 ml-6 rounded-sm relative shadow-sm">
            <h2
               className="absolute -top-3 left-1/2 -translate-x-1/2 
               bg-white px-3 text-purple-700 text-md font-semibold 
               border py-0.5 rounded-2xl border-purple-300 "
            >
               Statut d'Agent
            </h2>

            <AgentPieChart data={statusData} />
         </div>

         {/* Agent Details Section */}
         <div className="flex-3 border border-purple-300 rounded-sm relative h-50 mt-7 shadow-sm">
            <h2
               className="absolute -top-3 left-1/2 -translate-x-1/2 
               bg-white px-3 text-purple-700 text-md font-semibold 
               border py-0.5 rounded-2xl border-purple-300 "
            >
               Detail de l'Agent
            </h2>

            {agentDetails ? (
               <>
                  <div className="flex font-roboto mt-13 space-x-15 justify-center text-sm ">
                     <StatCard title={"Addresse IP"} value={agentDetails.ip} />
                     <StatCard title={"VPN Actif"} value={agentDetails.vpn_actif || "Non"} />
                     <StatCard title={"Version Logiciel"} value={agentDetails.version} />
                     <StatCard title={"Dernière connexion"} value={agentDetails.last_connection} />
                  </div>

                  <div className="flex font-roboto mt-9 ml-5 space-x-13 text-sm ">
                     <StatCard title={"Système d'exploitation"} value={agentDetails.os} isBottom={true} />
                     <StatCard title={"Nom de l'Agent"} value={agentDetails.nom} isBottom={true} />
                  </div>
               </>
            ) : (
               <p className="text-center mt-10 text-gray-400">Chargement des détails de l'agent...</p>
            )}
         </div>

         {/* Performance Section */}
         <div className="flex-2 border border-purple-300 mr-6 rounded-sm relative shadow-sm">
            <h2
               className="absolute -top-3 left-1/2 -translate-x-1/2 
               bg-white px-3 text-purple-700 text-md font-semibold 
               border py-0.5 rounded-2xl border-purple-300 "
            >
               Performances
            </h2>

            <PerformanceList performances={performances} />
         </div>
      </div>
   );
}

export default AgentStats;