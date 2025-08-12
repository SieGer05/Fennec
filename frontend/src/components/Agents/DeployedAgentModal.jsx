import { useState, useEffect } from 'react';
import { generateDeployScript } from '../../scripts/deployAgentTemplate';
import toast from 'react-hot-toast';
import { createAgent } from '../../services';

const DeployedAgentModal = ({ onClose, onAgentCreated }) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('22');
  const [publicKey, setPublicKey] = useState('');
  const [_, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [step, setStep] = useState(1);

  const IPV4_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const SSH_PUBKEY_REGEX = /^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp[0-9]+) AAAA[0-9A-Za-z+\/]+[=]{0,3}( [^@]+@[^@]+)?$/;

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const validateInputs = () => {
    const trimmedIp = ip.trim();
    
    if (!trimmedIp) {
      toast.error("Veuillez saisir une adresse IP valide");
      return false;
    }
    
    if (!IPV4_REGEX.test(trimmedIp)) {
      toast.error("Format d'adresse IP invalide. Exemple: 192.168.1.100");
      return false;
    }
    
    const portNum = parseInt(port, 10);
    if (isNaN(portNum)) {
      toast.error("Veuillez saisir un numéro de port valide");
      return false;
    }
    
    if (portNum < 1 || portNum > 65535) {
      toast.error("Veuillez saisir un numéro de port valide (1-65535)");
      return false;
    }
    
    if (!publicKey.trim()) {
      toast.error("Veuillez saisir votre clé publique SSH");
      return false;
    }
    
    if (!SSH_PUBKEY_REGEX.test(publicKey.trim())) {
      toast.error("Format de clé publique SSH invalide");
      return false;
    }
    
    return true;
  };

  const handlePortChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPort(value);
    }
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;

    setStep(2);
    setIsLoading(true);

    try {
      const newAgent = await createAgent(
        ip.trim(), 
        parseInt(port), 
        publicKey.trim()
      );

      const scriptContent = generateDeployScript(ip, port, publicKey.trim());
      const blob = new Blob([scriptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setStep(3);
      
      if (onAgentCreated) onAgentCreated(newAgent);
      window.dispatchEvent(new CustomEvent("agent-refresh", { detail: newAgent.id }));

    } catch (err) {
      console.error(err);
      toast.error('Une erreur est survenue lors de la génération du script.');
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Déploiement d'Agent</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors cursor-pointer"
            >
              &times;
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            <div 
              className={`absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 z-10 transition-all duration-500`}
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            ></div>
            
            {[1, 2, 3].map((num) => (
              <div 
                key={num} 
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-20 ${
                  step >= num ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          
          {/* Step 1: Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Configuration du Serveur</h3>
                <p className="text-gray-600 mb-4">Saisissez les détails de votre serveur et votre clé publique SSH.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse IP du Serveur
                    </label>
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => setIp(e.target.value)}
                      placeholder="192.168.1.100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Port SSH
                    </label>
                    <input
                      type="text"
                      value={port}
                      onChange={handlePortChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clé Publique SSH
                      <span className="text-xs text-gray-500 ml-2">
                        (ssh-rsa AAA... ou ssh-ed25519 AAA...)
                      </span>
                    </label>
                    <textarea
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      <p>Générez votre clé SSH avec: <code className="bg-gray-100 px-1 py-0.5 rounded">ssh-keygen -t ed25519</code></p>
                      <p>Votre clé publique se trouve dans: <code className="bg-gray-100 px-1 py-0.5 rounded">~/.ssh/id_ed25519.pub</code></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={!ip.trim() || !publicKey.trim()}
                className={`w-full py-3.5 px-4 rounded-xl font-medium text-white transition-all ${
                  (!ip.trim() || !publicKey.trim())
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:opacity-90 cursor-pointer'
                }`}
              >
                Générer le Script de Déploiement
              </button>
            </div>
          )}
          
          {/* Step 2: Generation */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Génération du Script</h3>
              <p className="text-gray-600 text-center max-w-xs">
                Veuillez patienter pendant que nous créons votre script de déploiement personnalisé. Cela prend généralement quelques secondes.
              </p>
            </div>
          )}
          
          {/* Step 3: Download */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Script Généré avec Succès !</h3>
              <p className="text-gray-600 mb-6">
                Votre script de déploiement est prêt. Téléchargez-le et exécutez-le sur votre serveur pour déployer l'agent.
              </p>
              
              <a
                href={downloadUrl}
                download="deploy_agent.sh"
                className="inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-medium rounded-xl hover:opacity-90 transition-opacity w-full mb-4 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Télécharger le Script (deploy_agent.sh)
              </a>
              
              <div className="bg-purple-50 rounded-xl p-4 text-left">
                <h4 className="font-medium text-purple-800 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Instructions Importantes
                </h4>
                <ul className="text-sm text-purple-700 list-disc pl-5 space-y-1">
                  <li>Enregistrez le script sur votre serveur</li>
                  <li>Rendez-le exécutable : <code className="bg-purple-100 px-1.5 py-0.5 rounded">chmod +x deploy_agent.sh</code></li>
                  <li>Exécutez avec : <code className="bg-purple-100 px-1.5 py-0.5 rounded">sudo ./deploy_agent.sh</code></li>
                  <li>Le script se nettoiera automatiquement après exécution</li>
                  <li>Connectez-vous ensuite avec : <code className="bg-purple-100 px-1.5 py-0.5 rounded">ssh -i ~/.ssh/ma_cle_privee -p {port} fennec_user@{ip}</code></li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-600">
              Ce script crée un utilisateur temporaire pour collecter les données de configuration système. 
              Il effectue des opérations en lecture seule et nettoie toutes les ressources après exécution. 
              Aucune modification permanente n'est apportée à votre système.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployedAgentModal;