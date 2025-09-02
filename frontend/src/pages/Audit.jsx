import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ServiceStatus from "../components/Audit/ServiceStatus";
import { 
  fetchAgentServices, 
  fetchSSHConfiguration, 
  fetchApache2Configuration,
  fetchMariadbConfiguration,
  fetchWebminConfiguration, 
} from "../services";
import Header from "../components/Audit/Header";
import AuditingTable from "../components/Audit/AuditingTable";
import ChatBot from "../components/Chatbot/ChatBot";
import ChatBotButton from "../components/Chatbot/ChatbotButton";

function Audit() {
  const { agentId } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isServicesFinished, setIsServicesFinished] = useState(false);
  const [allAudits, setAllAudits] = useState([]);
  const [auditsLoading, setAuditsLoading] = useState(false);
  const [auditsError, setAuditsError] = useState(null);
  
  const [showChatButton, setShowChatButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat state moved to parent component to persist between opens/closes
  const [chatMessages, setChatMessages] = useState([
    {
      text: "Bonjour ! Je suis votre assistant de sécurité. Je vois que vous avez effectué un audit de sécurité. Comment puis-je vous aider aujourd'hui?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [hasAnalysisRun, setHasAnalysisRun] = useState(false);

  const expectedServices = [
    { name: 'ssh', display: 'SSH', fetchConfig: fetchSSHConfiguration },
    { name: 'apache2', display: 'Apache', fetchConfig: fetchApache2Configuration },
    { name: 'mariadb', display: 'Maria DB', fetchConfig: fetchMariadbConfiguration },
    { name: 'webmin', display: 'Webmin', fetchConfig: fetchWebminConfiguration },
  ];

  const failedAudits = useMemo(() => {
    return allAudits.filter(audit => !audit.passed);
  }, [allAudits]);

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
    const chatTimer = setTimeout(() => {
      setShowChatButton(true);
    }, 30000);

    return () => clearTimeout(chatTimer);
  }, []);

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
            <p className="text-purple-800 font-mono">Chargement des données de service depuis l'agent...</p>
          </div>
        </div>
        {showChatButton && !isChatOpen && (
          <ChatBotButton onClick={() => setIsChatOpen(true)} />
        )}
        {isChatOpen && (
          <ChatBot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
            failedAudits={failedAudits}
            messages={chatMessages}
            setMessages={setChatMessages}
            hasAnalysisRun={hasAnalysisRun}
            setHasAnalysisRun={setHasAnalysisRun}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-purple-100 min-h-screen w-full flex justify-center items-start pt-7 pb-7">
        <div className="bg-white w-[90%] rounded-xl shadow p-6 min-h-[80vh] flex flex-col items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg max-w-md">
            <h3 className="font-bold text-lg mb-2">Erreur de connexion</h3>
            <p>{error}</p>
          </div>
          <button 
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
            onClick={() => window.location.reload()}
          >
            Réessayer la connexion
          </button>
        </div>
        {showChatButton && !isChatOpen && (
          <ChatBotButton onClick={() => setIsChatOpen(true)} />
        )}
        {isChatOpen && (
          <ChatBot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)}
            failedAudits={failedAudits}
            messages={chatMessages}
            setMessages={setChatMessages}
            hasAnalysisRun={hasAnalysisRun}
            setHasAnalysisRun={setHasAnalysisRun}
          />
        )}
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
      
      {showChatButton && !isChatOpen && (
        <ChatBotButton onClick={() => setIsChatOpen(true)} />
      )}
      {isChatOpen && (
        <ChatBot 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          failedAudits={failedAudits}
          messages={chatMessages}
          setMessages={setChatMessages}
          hasAnalysisRun={hasAnalysisRun}
          setHasAnalysisRun={setHasAnalysisRun}
        />
      )}
    </div>
  );
}

export default Audit;