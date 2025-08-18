
function FennecWorkflow() {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center">Comment Fonctionne FENNEC</h2>
            
            <div className="flex flex-col md:flex-row items-center mb-12">
                <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="bg-gray-100 rounded-xl p-6 border-2 border-dashed border-purple-300">
                    <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">1</div>
                    <div>
                        <h3 className="font-bold text-lg text-purple-800">Définition des Règles</h3>
                        <p className="text-gray-700 text-sm">
                        Les règles de sécurité sont définies dans des fichiers JSON avec les valeurs attendues, commandes de vérification et références CIS.
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">2</div>
                    <div>
                        <h3 className="font-bold text-lg text-purple-800">Collecte des Données</h3>
                        <p className="text-gray-700 text-sm">
                        L'agent se connecte via SSH et exécute les commandes spécifiées pour collecter la configuration actuelle.
                        </p>
                    </div>
                    </div>
                    
                    <div className="flex items-start">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold mr-3">3</div>
                    <div>
                        <h3 className="font-bold text-lg text-purple-800">Analyse et Rapport</h3>
                        <p className="text-gray-700 text-sm">
                        Les configurations réelles sont comparées aux standards de sécurité pour générer un rapport détaillé.
                        </p>
                    </div>
                    </div>
                </div>
                </div>
                
                <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 rounded-full border-4 border-purple-200 animate-pulse"></div>
                    </div>
                    
                    <div className="relative bg-white rounded-xl shadow-lg p-6 w-56 z-10">
                    <h4 className="font-bold text-purple-800 mb-3 text-center">Règle SSH</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Directive:</span>
                        <span className="font-medium">PermitRootLogin</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valeur attendue:</span>
                        <span className="font-medium text-green-600">no</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valeur actuelle:</span>
                        <span className="font-medium text-red-600">yes</span>
                        </div>
                        <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sévérité:</span>
                        <span className="font-medium text-red-600">Élevée</span>
                        </div>
                    </div>
                    </div>
                    
                    <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 w-48 z-20">
                    <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">Serveur: Ubuntu</span>
                    </div>
                    <div className="text-xs text-gray-600">
                        <div>IP: 192.168.1.100</div>
                        <div>Status: Actif</div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3">Exemple de Définition de Règle</h3>
                <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                <code className="text-blue-400">{`{`}</code><br/>
                <code className="text-yellow-300 ml-4">"service": "Apache",</code><br/>
                <code className="text-yellow-300 ml-4">"directive": "ServerTokens",</code><br/>
                <code className="text-yellow-300 ml-4">"expected_value": "Prod",</code><br/>
                <code className="text-yellow-300 ml-4">"severity": "medium",</code><br/>
                <code className="text-yellow-300 ml-4">"description": "Masquer les informations du serveur",</code><br/>
                <code className="text-yellow-300 ml-4">"command": "apache2ctl -t -D DUMP_MODULES | grep headers",</code><br/>
                <code className="text-yellow-300 ml-4">"reference": "CIS Benchmark 2.3.5"</code><br/>
                <code className="text-blue-400">{`}`}</code>
                </div>
            </div>
        </div>
    );
}

export default FennecWorkflow