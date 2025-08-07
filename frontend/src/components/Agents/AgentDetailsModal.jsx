import { useNavigate } from "react-router-dom";

function AgentDetailsModal({ agent, onClose }) {
   const navigate = useNavigate();

   const handleAuditClick = () => {
      navigate(`/audit/${agent.id}`);
      onClose();
   };

   return (
      <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
      >

      <div
         className="bg-white px-8 py-6 rounded-lg shadow-lg text-center max-w-sm w-full"
         onClick={(e) => e.stopPropagation()}
      >
         <h2 className="text-xl font-semibold text-purple-700 mb-4">
            Informations sur l'Agent
         </h2>

         <div className="space-y-3 text-sm text-gray-700">
            <p><span className="font-medium">ID :</span> {agent.id}</p>
            <p><span className="font-medium">Nom :</span> {agent.nom}</p>
            <p><span className="font-medium">Adresse IP :</span> {agent.ip}</p>
            <p><span className="font-medium">Système d'exploitation :</span> {agent.os}</p>
            <p><span className="font-medium">Version :</span> {agent.version}</p>
            <p>
            <span className="font-medium">Statut :</span>{" "}
            <span
               className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === "active"
                  ? "text-green-700 bg-green-50 ring-1 ring-green-200"
                  : agent.status === "En attente"
                  ? "text-amber-700 bg-amber-50 ring-1 ring-amber-200"
                  : "text-rose-700 bg-rose-50 ring-1 ring-rose-200"
               }`}
            >
               {agent.status}
            </span>
            </p>
         </div>

         <div className="mt-6 flex flex-col gap-3">
            <button
               className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center justify-center gap-2 cursor-pointer"
               onClick={handleAuditClick}
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
               </svg>
               Voir l'audit des services
            </button>
            
            <button
               className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition cursor-pointer"
               onClick={onClose}
            >
            Fermer
            </button>
        </div>

      </div>
      </div>
   );
}

export default AgentDetailsModal;
