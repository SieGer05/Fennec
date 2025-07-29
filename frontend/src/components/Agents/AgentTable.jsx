import { ICONS } from "../../assets";
import { useState } from "react";
import AgentDetailsModal from "./AgentDetailsModal";

function AgentTable({ agent, onDelete }) {
   const [isView, setIsView] = useState(false);

   if (!agent || Object.keys(agent).length === 0) {
      return (
         <p className="text-center mt-20 text-xl text-gray-400 font-light">
         Aucun agent disponible
         </p>
      );
   }

   const toggleView = () => {
      setIsView((prev) => !prev);
   };

   return (
      <>
         <div className="mt-12 overflow-hidden border-b border-gray-200">
         <table className="min-w-full divide-y divide-gray-200">
            {/* Table Header */}
            <thead>
               <tr className="text-left text-purple-600 tracking-wider">
               <th className="pb-3 font-medium">ID</th>
               <th className="pb-3 font-medium">Nom</th>
               <th className="pb-3 font-medium">Adresse IP</th>
               <th className="pb-3 font-medium">Système d'exploitation</th>
               <th className="pb-3 font-medium">Version</th>
               <th className="pb-3 font-medium">Statut</th>
               <th className="pb-3 font-medium text-center">Actions</th>
               </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-200">
               <tr className="hover:bg-gray-50/80 transition-colors">
               <td className="py-4 text-gray-900">{agent.id}</td>
               <td className="py-4 font-light">{agent.name}</td>
               <td className="py-4 text-gray-600 font-mono">{agent.ip}</td>
               <td className="py-4 text-gray-600 font-mono">{agent.os}</td>
               <td className="py-4 text-gray-600">{agent.version}</td>

               <td className="py-4">
                  <span
                     className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                     ${
                     agent.status === "Actif"
                        ? "text-green-700 bg-green-50 ring-1 ring-green-200"
                        : agent.status === "En attente"
                        ? "text-amber-700 bg-amber-50 ring-1 ring-amber-200"
                        : "text-rose-700 bg-rose-50 ring-1 ring-rose-200"
                     }
                     `}
                  >
                     {agent.status}
                  </span>
               </td>

               <td className="py-4 flex justify-center space-x-4 items-center">
                  <img
                     src={ICONS.Delete}
                     alt="Supprimer"
                     className="w-6 h-6 cursor-pointer hover:opacity-80"
                     onClick={onDelete}
                  />
                  <img
                     onClick={toggleView}
                     src={ICONS.View}
                     alt="Voir"
                     className="w-8 h-8 cursor-pointer hover:opacity-80"
                  />
               </td>
               </tr>
            </tbody>
         </table>
         </div>

         <div className="mt-8 p-2 w-120 mx-auto bg-yellow-100 text-yellow-800 rounded border border-yellow-300 text-center font-semibold">
         ⚠️ Vous ne pouvez ajouter qu'un seul agent pour le moment !
         </div>

         {isView && <AgentDetailsModal agent={agent} onClose={() => setIsView(false)} />}
      </>
   );
}

export default AgentTable;
