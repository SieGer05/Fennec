import { useEffect, useState } from "react";
import StatusIndicator from "./StatusIndicator";

function ServiceStatus({ services, expectedServices, setIsServicesFinished }) {
  const [checking, setChecking] = useState(true);
  const [finished, setFinished] = useState(false);
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    if (services.length === 0) return;

    const checkServices = async() => {
      const results = [];

      for (const expected of expectedServices) {
        const service = services.find(s => s.name === expected.name);
        
        let status = 'missing';
        if (service) {
          status = service.active ? 'active' : 'inactive';
        }
        
        results.push({...expected, status});
        setStatuses([...results]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      setChecking(false);
      setFinished(true);
      setIsServicesFinished(true);
    };

    checkServices();
  }, [services]);

  return (
    <div className="pb-8">
      {checking && ( 
        <div className="flex flex-col items-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-3"></div>
          <p className="text-purple-800 font-opensans pt-4 font-mono text-sm">
            Analyse des statuts des services sur l’agent distant...
          </p>
        </div>
      )}

      {finished && (
        <div className="flex items-center justify-center animate-fade-in">
          <div className="text-center py-3 w-[35%] bg-green-100 rounded-lg mb-6 shadow-sm">
            <p className="text-green-700 font-semibold">✓ Audit des services terminé</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {statuses.map((service, index) => (
          <div 
            key={index}
            className="relative group overflow-hidden border border-gray-200 p-4 rounded-2xl shadow-sm mb-4
                      transition-all duration-300 hover:shadow-md hover:border-transparent"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl"></div>
            
            <div className="flex justify-between items-center">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 truncate text-lg tracking-tight">
                  {service.display}
                </h3>
                {service.status === 'missing' && (
                  <p className="text-sm text-gray-600 mt-1 animate-pulse">
                    Service non détecté sur le système cible
                  </p>
                )}
              </div>
              
              <StatusIndicator status={service.status} />
            </div>
            
            <div className="absolute bottom-0 left-0 w-0 h-0.5 
                bg-gradient-to-r from-purple-400 to-indigo-500 
                transition-all duration-500 group-hover:w-full">
            </div>
          </div>
        ))}
      </div>

      {finished && (
        <div className="flex justify-center mt-10">
          <div className="w-[60%] border-t border-purple-300 shadow-sm"></div>
        </div>
      )}
    </div>
  );
}

export default ServiceStatus;