
function SetupSteps() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Étape 1 - Création */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-24 h-24 bg-purple-100 rounded-full opacity-30"></div>
                <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white font-bold text-xl mr-4">
                    1
                </div>
                <h2 className="text-2xl font-bold text-purple-900">Créer l'Agent</h2>
                </div>
                
                <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48 bg-purple-50 rounded-xl flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-purple-300 rounded-xl m-4"></div>
                    <div className="bg-white rounded-lg shadow-md p-4 z-10">
                    <div className="flex space-x-2 mb-3">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 bg-purple-200 rounded"></div>
                        <div className="h-2 bg-purple-200 rounded w-4/5"></div>
                        <div className="h-2 bg-purple-200 rounded w-3/4"></div>
                        <div className="h-8 bg-purple-300 rounded mt-4"></div>
                    </div>
                    </div>
                </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                Dans l'interface FENNEC, configurez votre agent avec:
                </p>
                <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-1">
                <li>Adresse IP du serveur</li>
                <li>Port SSH (par défaut: 22)</li>
                <li>Clé publique SSH</li>
                <li>Nom de l'agent</li>
                </ul>
            </div>
            
            {/* Étape 2 - Déploiement */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-24 h-24 bg-purple-100 rounded-full opacity-30"></div>
                <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white font-bold text-xl mr-4">
                    2
                    </div>
                    <h2 className="text-2xl font-bold text-purple-900">Déployer le Script</h2>
                </div>
                
                <p className="text-gray-700 mb-4">
                    Téléchargez et vérifiez l'intégrité du script :
                </p>
                
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                    <code className="text-cyan-400"># Télécharger le script</code><br/>
                    <code className="text-green-400">$ scp user@fennec.app:deploy_agent.sh .</code><br/><br/>
                    
                    <code className="text-cyan-400"># Vérifier le hash SHA256</code><br/>
                    <code className="text-green-400">$ sha256sum deploy_agent.sh | diff - hash_file.txt</code><br/><br/>
                    
                    <code className="text-cyan-400"># Exécuter si vérification OK</code><br/>
                    <code className="text-green-400">$ chmod +x deploy_agent.sh</code><br/>
                    <code className="text-green-400">$ ./deploy_agent.sh</code>
                </div>

                <div className="mt-4 text-xs text-rose-600 font-medium">
                    ⚠️ Vérification du hash obligatoire - À utiliser à vos propres risques
                </div>
            </div>
            
            {/* Étape 3 - Résultats */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-24 h-24 bg-purple-100 rounded-full opacity-30"></div>
                <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500 text-white font-bold text-xl mr-4">
                    3
                </div>
                <h2 className="text-2xl font-bold text-purple-900">Analyser les Résultats</h2>
                </div>
                
                <div className="flex justify-center mb-6">
                <div className="relative w-48 h-48 bg-purple-50 rounded-xl flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-md p-4 w-40">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-purple-900">Audit SSH</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">3 erreurs</span>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-start">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-2"></div>
                        <div>
                            <p className="text-sm font-medium">Root login activé</p>
                            <p className="text-xs text-gray-500">Sévérité: Élevée</p>
                        </div>
                        </div>
                        
                        <div className="flex items-start">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1 mr-2"></div>
                        <div>
                            <p className="text-sm font-medium">Protocole SSHv1</p>
                            <p className="text-xs text-gray-500">Sévérité: Moyenne</p>
                        </div>
                        </div>
                        
                        <div className="flex items-start">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1 mr-2"></div>
                        <div>
                            <p className="text-sm font-medium">Authentification par clé</p>
                            <p className="text-xs text-gray-500">Configuré</p>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                Consultez les résultats dans l'interface FENNEC:
                </p>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Détails par service</li>
                <li>Niveaux de sévérité</li>
                <li>Références CIS</li>
                <li>Solutions recommandées</li>
                </ul>
            </div>
        </div>
    );
}

export default SetupSteps