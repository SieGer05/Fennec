import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ServiceStatus from "../components/Audit/ServiceStatus";
import { fetchAgentServices } from "../services";
import Header from "../components/Audit/Header";

function Audit() {
  const { agentId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const apiServices = await fetchAgentServices(agentId);
        
        const transformedServices = apiServices.map(service => ({
          name: service.service,
          active: service.status === "active"
        }));
        
        setServices(transformedServices);
      } catch (err) {
        setError(`Failed to load services: ${err.message}`);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [agentId]);

  if (loading) {
    return (
      <div className="bg-purple-100 min-h-screen w-full flex justify-center items-start pt-7 pb-7">
        <div className="bg-white w-[90%] rounded-xl shadow p-6 min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
            <p className="text-purple-800 font-mono">Loading service data from agent...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-purple-100 min-h-screen w-full flex justify-center items-start pt-7 pb-7">
        <div className="bg-white w-[90%] rounded-xl shadow p-6 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <h3 className="font-bold text-lg mb-2">Connection Error</h3>
            <p>{error}</p>
          </div>
          <button 
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-100 min-h-screen w-full flex justify-center items-start pt-7 pb-7">
      <div className="bg-white w-[90%] rounded-xl shadow p-6 min-h-[80vh]">
        <Header />
        <ServiceStatus services={services} />
      </div>
    </div>
  );
}

export default Audit;