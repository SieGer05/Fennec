function AgentDetailsModal({ agent, onClose }) {
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
            <p><span className="font-medium">Nom :</span> {agent.name}</p>
            <p><span className="font-medium">Adresse IP :</span> {agent.ip}</p>
            <p><span className="font-medium">Système d'exploitation :</span> {agent.os}</p>
            <p><span className="font-medium">Version :</span> {agent.version}</p>
            <p>
            <span className="font-medium">Statut :</span>{" "}
            <span
               className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  agent.status === "Actif"
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

         <button
            className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition cursor-pointer"
            onClick={onClose}
         >
            Fermer
         </button>
      </div>
      </div>
   );
}

export default AgentDetailsModal;
