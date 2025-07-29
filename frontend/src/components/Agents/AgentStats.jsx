import AgentPieChart from "./AgentPieChart";
import StatCard from "./StatCard";
import PerformanceList from "./PerformanceList";

const status_agent = [
   { name: "Active", value: 12 },
   { name: "Pending", value: 5 },
   { name: "Never Connected", value: 3 },
   { name: "Disconnected", value: 7 },
];

const performances = [
   { label: "Utilisation du CPU", value: "28 %" },
   { label: "Utilisation de la mémoire", value: "3.2 Go sur 8 Go" },
   { label: "Espace disque libre", value: "150 Go / 500 Go" },
   { label: "Temps de fonctionnement (uptime)", value: "5 jours, 12 heures" },
];

function AgentStats() {
   return (
      <div className="mt-10 flex space-x-6 h-65">
         <div className="flex-2 border border-purple-300 ml-6 rounded-sm relative shadow-sm">
            <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 
            bg-white px-3 text-purple-700 text-md font-semibold 
            border py-0.5 rounded-2xl border-purple-300 ">
               Statut d'Agent
            </h2>
            
            <AgentPieChart data={status_agent} />
         </div>
         
         <div className="flex-3 border border-purple-300 rounded-sm relative h-50 mt-7 shadow-sm">
            <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 
            bg-white px-3 text-purple-700 text-md font-semibold 
            border py-0.5 rounded-2xl border-purple-300 ">
               Detail de l'Agent
            </h2>

            <div className="flex font-roboto mt-13 space-x-15 justify-center text-sm ">
               <StatCard title={"Addresse IP"} value={"192.168.8.1"} />
               <StatCard title={"VPN Actif"} value={"Non"} />
               <StatCard title={"Version Logiciel"} value={"v2.1.0"} />
               <StatCard title={"Dernière connexion"} value={"5 minutes ago"} />
            </div>  

            <div className="flex font-roboto mt-9 ml-9 space-x-25 text-sm ">
               <StatCard title={"Système d'exploitation"} value={"Ubuntu 22.04 LTS"} isBottom={true}/>
               <StatCard title={"Nom de l'Agent"} value={"Agent Serveur – Casablanca"} isBottom={true} />
            </div>
         </div>
         
         <div className="flex-2 border border-purple-300 mr-6 rounded-sm relative shadow-sm">
            <h2 className="absolute -top-3 left-1/2 -translate-x-1/2 
            bg-white px-3 text-purple-700 text-md font-semibold 
            border py-0.5 rounded-2xl border-purple-300 ">
               Performances
            </h2>

            <PerformanceList performances={performances} />
         </div>
      </div>
   );
}

export default AgentStats