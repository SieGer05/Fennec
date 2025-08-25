import { useState, useRef, useEffect } from "react";
import { analyzeAudit } from "../../services";

function ChatBot({ isOpen, onClose, failedAudits = [] }) {
  const [messages, setMessages] = useState([
    {
      text: "Bonjour ! Je suis votre assistant de sécurité. Je vois que vous avez effectué un audit de sécurité. Comment puis-je vous aider aujourd'hui?",
      sender: "bot",
      timestamp: new Date(),
    }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);
  const [hasAnalysisRun, setHasAnalysisRun] = useState(false);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (!isOpen) return null;

  const handleAIAnalysis = async () => {
    if (failedAudits.length === 0) {
      const newMessage = {
        text: "Excellent! Aucun problème n'a été détecté lors de l'audit. Votre système semble sécurisé.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);
      return;
    }

    setIsAnalyzing(true);
    setHasAnalysisRun(true);
    
    const userMessage = {
      text: "Analyse les problèmes de sécurité détectés avec l'IA",
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const loadingMessage = {
        text: "J'analyse les problèmes de sécurité avec l'IA...",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, loadingMessage]);

      const response = await analyzeAudit(failedAudits);
      
      setMessages(prev => prev.filter(msg => msg.text !== "J'analyse les problèmes de sécurité avec l'IA..."));
      
      if (response && response.analysis) {
        const analysisParts = response.analysis.split('|');
        
        analysisParts.forEach((part, index) => {
          if (part.trim()) {
            setTimeout(() => {
              const analysisMessage = {
                text: part.trim(),
                sender: "bot",
                timestamp: new Date(),
              };
              setMessages(prev => [...prev, analysisMessage]);
            }, index * 800);
          }
        });
        
        setTimeout(() => {
          const recommendationMessage = {
            text: "Recommandation: Je vous suggère de corriger ces problèmes par ordre de criticité.",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, recommendationMessage]);
        }, analysisParts.length * 800 + 500);
      } else {
        throw new Error("Format de réponse invalide de l'analyse IA");
      }
      
    } catch (error) {
      console.error("AI analysis error:", error);
      
      setMessages(prev => prev.filter(msg => msg.text !== "⏳ J'analyse les problèmes de sécurité avec l'IA..."));
      
      let errorMessageText = "❌ Désolé, je n'ai pas pu analyser les problèmes avec l'IA pour le moment. Veuillez réessayer plus tard.";
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessageText = `❌ Erreur d'analyse: ${error.response.data.detail}`;
      } else if (error.message) {
        errorMessageText = `❌ Erreur: ${error.message}`;
      }
      
      const errorMessage = {
        text: errorMessageText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        text: "Bonjour ! Je suis votre assistant de sécurité. Je vois que vous avez effectué un audit de sécurité. Comment puis-je vous aider aujourd'hui?",
        sender: "bot",
        timestamp: new Date(),
      }
    ]);
    setHasAnalysisRun(false);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-xl z-50 border border-purple-300 transform transition-all duration-300 scale-100 max-h-[85vh] flex flex-col">
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
          <span className="text-lg font-bold">Assistant de Sécurité</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleResetChat}
            className="text-white hover:text-purple-200 text-sm p-1 cursor-pointer transition-colors"
            title="Réinitialiser la conversation"
          >
            ↻
          </button>
          <button 
            onClick={onClose}
            className="text-white hover:text-purple-200 text-xl font-bold cursor-pointer transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-purple-50 to-indigo-50 max-h-[calc(85vh-180px)]">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 ${msg.sender === "bot" ? "text-left" : "text-right"}`}
          >
            <div className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.sender === "bot"
                    ? "bg-white text-purple-800 border border-purple-200 shadow-sm"
                    : "bg-purple-600 text-white shadow-md"
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className={`text-xs text-gray-500 mt-1 ${msg.sender === "bot" ? "text-left ml-10" : "text-right mr-10"}`}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="flex justify-start mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white text-purple-800 border border-purple-200 shadow-sm max-w-[70%] p-3 rounded-lg flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Analyse en cours avec l'IA...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-purple-200 bg-white rounded-b-lg">
        <div className="flex flex-col space-y-3">
          {!hasAnalysisRun && (
            <button
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAIAnalysis}
              disabled={isAnalyzing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isAnalyzing ? "Analyse en cours..." : "Analyser avec l'IA"}
            </button>
          )}
          
          {failedAudits.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center text-yellow-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">
                  {failedAudits.length} problème(s) de sécurité détecté(s)
                </span>
              </div>
            </div>
          )}
          
          {hasAnalysisRun && !isAnalyzing && (
            <button
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md flex items-center justify-center"
              onClick={handleAIAnalysis}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Relancer l'analyse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatBot;