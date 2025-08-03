import { ICONS } from "../../assets";
import { toast } from "react-hot-toast";
import AgentTable from "./AgentTable";
import DeployedAgentModal from "./DeployedAgentModal";
import { refreshAgent, deleteAgent } from "../../services";
import { useState } from "react";

function AgentUse({ agent, onAgentChange, onRefresh }) {
  const [isDeployModal, setIsDeployModal] = useState(false);

  const handleDelete = async () => {
    if (!agent) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this agent?");
    if (!confirmDelete) return;

    try {
      await deleteAgent(agent.id);

      onAgentChange(null);
      onRefresh(null);
    } catch (err) {
      console.err(err);
    }
  };

  const handleExport = () => {
    if (!agent) {
      toast.error("No agent to export!");
      return;
    }

    const csvContent = `ID,Name,IP Address,OS,Version,Status\n${agent.id},${agent.nom},${agent.ip},${agent.os || "N/A"},${agent.version},${agent.status}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "agent.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success("File downloaded successfully!");
  };

  const refreshAgentStatus = async () => {
    if (!agent) {
      toast.error("No agent available to refresh!");
      return;
    }

    try {
      const updatedAgent = await refreshAgent(agent.id);
      onAgentChange(updatedAgent);
      onRefresh(agent.id);
    } catch (err) {
      console.err(err);
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
          <img src={ICONS.Add} alt="Deploy new agent" className="w-6 h-6" />
          <h3 className="text-sm font-medium text-purple-700">Deploy</h3>
        </div>

        {/* Refresh */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
          onClick={refreshAgentStatus}
        >
          <img src={ICONS.Refresh} alt="Refresh data" className="w-6 h-6" />
          <h3 className="text-sm font-medium text-purple-700">Refresh</h3>
        </div>

        {/* Export */}
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:opacity-80"
          onClick={handleExport}
        >
          <img src={ICONS.Download} alt="Export data" className="w-6 h-6" />
          <h3 className="text-sm font-medium text-purple-700">Export</h3>
        </div>
      </div>

      {/* Table */}
      <AgentTable agent={agent} onDelete={handleDelete} />

      {/* Deploy Modal */}
      {isDeployModal && (
        <DeployedAgentModal
          onClose={() => {
            setIsDeployModal(false);
            onRefresh(agent?.id);
          }}
          onAgentCreated={(newAgent) => {
            onAgentChange(newAgent);
            onRefresh(newAgent.id);
          }}
        />
      )}
    </div>
  );
}

export default AgentUse;