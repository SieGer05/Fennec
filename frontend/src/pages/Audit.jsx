// Audit.js
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ServiceStatus from "../components/Audit/ServiceStatus";
import { fetchAgentServices, fetchSSHConfiguration } from "../services";
import Header from "../components/Audit/Header";
import AuditingTable from "../components/Audit/AuditingTable";

function Audit() {
  const { agentId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServicesFinished, setIsServicesFinished] = useState(false);
  const [allAudits, setAllAudits] = useState([]);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState(null);

  const expectedServices = [
    { name: 'ssh', display: 'SSH', fetchConfig: fetchSSHConfiguration },
    // Add more services soon:
    // { name: 'apache2', display: 'Apache', fetchConfig: fetchApacheConfiguration },
    // { name: 'mariadb', display: 'MariaDB', fetchConfig: fetchMariaDBConfiguration },
  ];

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

  useEffect(() => {
    const fetchAllAudits = async () => {
      if (!isServicesFinished) return;
      
      setAuditsLoading(true);
      setAuditsError(null);
      
      try {
        const auditPromises = expectedServices
          .filter(expected => 
            services.some(s => s.name === expected.name && s.active)
          )
          .map(async service => {
            try {
              const config = await service.fetchConfig(agentId);
              return config.map(item => ({
                ...item,
                serviceName: service.display
              }));
            } catch (err) {
              console.error(`Failed to fetch ${service.name} config:`, err);
              return []; 
            }
          });

        const results = await Promise.all(auditPromises);
        const combinedAudits = results.flat();
        
        setAllAudits(combinedAudits);
      } catch (err) {
        setAuditsError(`Failed to load audit configurations: ${err.message}`);
      } finally {
        setAuditsLoading(false);
      }
    };

    fetchAllAudits();
  }, [isServicesFinished, services, agentId]);

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
        <ServiceStatus 
          services={services} 
          expectedServices={expectedServices} 
          setIsServicesFinished={setIsServicesFinished}
        />
        {isServicesFinished && (
          <AuditingTable 
            audits={allAudits}
            loading={auditsLoading}
            error={auditsError}
          />
        )}
      </div>
    </div>
  );
}

export default Audit;