import { ICONS } from "../../assets";
import { toast } from "react-hot-toast";
import AgentTable from "./AgentTable";
import DeployedAgentModal from "./DeployedAgentModal";
import { useState } from "react";

function AgentUse() {
   const [agent, setAgent] = useState({
      id: 1,
      name: "Agent Alpha",
      ip: "192.168.1.10",
      os: "Ubuntu 22.04 LTS",
      version: "1.2.3",
      status: "Actif",
   });

   const [isDeployModal, setIsDeployModal] = useState(false);

   const handleDelete = () => {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ?")) {
         setAgent({}); 
         toast.success("Agent supprimé avec succès !");
      }
   };

   const handleExport = () => {
      if (!agent || Object.keys(agent).length === 0) {
         toast.error("Aucun agent à télécharger !");
      } else {
         const csvContent = `ID,Nom,Adresse IP,OS,Version,Statut\n${agent.id},${agent.name},${agent.ip},${agent.os},${agent.version},${agent.status}`;

         const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
         const url = URL.createObjectURL(blob);

         const link = document.createElement("a");
         link.href = url;
         link.download = "agent.csv";
         link.click();

         setTimeout(() => URL.revokeObjectURL(url), 100);

         toast.success("Fichier téléchargé avec succès !");
      }
   };

   return (
      <div className="border border-purple-200 mt-9 mx-6 h-72 rounded-md shadow-sm relative p-4">
         {/* Action Buttons */}
         <div className="absolute top-4 right-4 flex space-x-5">
            {/* Deploy new agent */}
            <div 
               className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
               onClick={() => setIsDeployModal(true)}
            >
               <img
                  src={ICONS.Add}
                  alt="Déployer un nouvel agent"
                  className="w-6 h-6"
               />
               <h3 className="text-sm font-medium text-purple-700">
                  Déployer
               </h3>
            </div>

            {/* Refresh */}
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80">
               <img
                  src={ICONS.Refresh}
                  alt="Rafraîchir les données"
                  className="w-6 h-6"
               />
               <h3 className="text-sm font-medium text-purple-700">
                  Rafraîchir
               </h3>
            </div>

            {/* Export */}
            <div 
               className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
               onClick={handleExport}
            >
               <img
                  src={ICONS.Download}
                  alt="Exporter les données"
                  className="w-6 h-6"
               />
               <h3 className="text-sm font-medium text-purple-700">
                  Exporter
               </h3>
            </div>
         </div>

         {/* Table */}
         <AgentTable agent={agent} onDelete={handleDelete} />

         {/* Deploy Modal */}
         {isDeployModal && <DeployedAgentModal onClose={() => setIsDeployModal(false)} />}
      </div>
   );
}

export default AgentUse;