import { useEffect, useState } from "react";
import StatusIndicator from "./StatusIndicator";

function ServiceStatus({ services }) {
    const [ checking, setChecking ] = useState(true);
    const [ finished, setFinished ] = useState(false);
    const [ statuses, setStatuses ] = useState([]);

    const expectedServices = [
        { name: 'SSH', display: 'SSH' },
        { name: 'Apache', display: 'Apache Web Server' },
        { name: 'MariaDB', display: 'MariaDB Database' },
        { name: 'Postfix', display: 'Postfix Mail Server' },
        { name: 'Dovecot', display: 'Dovecot IMAP/POP3' }
    ];

    useEffect(() => {
        const checkServices = async() => {
            const results = [];

            for (const expected of expectedServices) {
                const service = services.find(s => s.name === expected.name);
                const status = service 
                    ? service.active
                        ? 'active'
                        : 'inactive'
                    : 'missing';
                
                
                results.push({...expected, status});
                setStatuses([...results]);

                await new Promise(resolve => setTimeout(resolve, 300));
            }

            setChecking(false);
            setFinished(true);
        };

        checkServices();
    }, [services]);

    return (
        <div>
            {checking && ( 
                <div className="flex flex-col items-center mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-3"></div>
                    <p className="text-purple-800 font-opensans pt-4 font-mono text-sm">Vérification des services en cours sur le serveur...</p>
                </div>
            )}

            {finished && (
                <div className="flex items-center justify-center">
                    <div className="text-center py-3 w-[35%] bg-green-100 rounded-lg mb-4">
                        <p className="text-green-700 font-semibold">✓ All services verified</p>
                    </div>
                </div>
            )}

            {statuses.map((service, index) => (
                <div 
                    key={index}
                    className="relative group overflow-hidden border border-gray-200 p-4 max-w-md mx-auto rounded-2xl shadow-sm mb-4
                            transition-all duration-300 hover:shadow-xl hover:border-transparent hover:-translate-y-0.5"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 opacity-0 
                                group-hover:opacity-30 transition-opacity duration-300 -z-10 rounded-2xl"></div>
                    
                    <div className="flex justify-between items-center">
                    <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 truncate text-lg tracking-tight">{service.display}</h3>
                        {service.status === 'missing' && (
                        <p className="text-sm text-gray-600 mt-1 animate-pulse">This service is not present on the server</p>
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

            {finished && (
                <div className="flex justify-center mt-10">
                    <hr className="w-[60%] border-purple-400 shadow-sm"/>
                </div>
            )}
        </div>
    );
}

export default ServiceStatus