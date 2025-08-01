import { ICONS } from "../../assets";
import { toast } from "react-hot-toast";
import AgentTable from "./AgentTable";
import DeployedAgentModal from "./DeployedAgentModal";
import { useState, useEffect } from "react";

function AgentUse() {
   const [agent, setAgent] = useState(null); 
   const [isDeployModal, setIsDeployModal] = useState(false);

   const fetchAgent = async () => {
      try {
         const res = await fetch("http://localhost:8000/deploy/");
         const data = await res.json();
         if (data.length > 0) {
            setAgent(data[0]); 
         } else {
            setAgent(null);
         }
      } catch (err) {
         toast.error("Impossible de récupérer l'agent");
      }
   };

   useEffect(() => {
      fetchAgent();
   }, []);

   const handleDelete = async () => {
      if (!agent) return;

      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet agent ?");
      if (!confirmDelete) return;

      try {
         const res = await fetch(`http://localhost:8000/deploy/${agent.id}`, {
            method: "DELETE",
         });

         if (!res.ok) throw new Error("Erreur lors de la suppression");

         setAgent(null);
         toast.success("Agent supprimé avec succès !");

         window.dispatchEvent(new CustomEvent("agent-refresh", { detail: null }));
      } catch (err) {
         toast.error("Erreur lors de la suppression de l'agent");
      }
   };

   const handleExport = () => {
      if (!agent) {
         toast.error("Aucun agent à télécharger !");
         return;
      }

      const csvContent = `ID,Nom,Adresse IP,OS,Version,Statut\n${agent.id},${agent.nom},${agent.ip},${agent.os || "N/A"},${agent.version},${agent.status}`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "agent.csv";
      link.click();

      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success("Fichier téléchargé avec succès !");
   };

   const refreshAgentStatus = async () => {
      if (!agent) {
         toast.error("Aucun agent disponible à rafraîchir !");
         return;
      }

      try {
         const res = await fetch(`http://localhost:8000/deploy/refresh/${agent.id}`, {
            method: "POST",
         });

         if (!res.ok) throw new Error("Erreur lors du rafraîchissement");
         
         const updatedAgent = await res.json();
         setAgent(updatedAgent);
         toast.success("Statut de l'agent mis à jour !");
      
         window.dispatchEvent(new CustomEvent("agent-refresh", { detail: agent.id }));
      } catch (err) {
         toast.error("Impossible de mettre à jour le statut");
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
            <div 
               className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
               onClick={refreshAgentStatus}
            >
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
         {isDeployModal && (
            <DeployedAgentModal
               onClose={() => {
                  setIsDeployModal(false);
                  fetchAgent();
               }}
            />
         )}
      </div>
   );
}

export default AgentUse;