import { useNavigate } from "react-router-dom";

function CreateAgentCTA() {
    const navigate = useNavigate();

    const handleCreateAgent = () => {
        navigate("/agents");
    };

    return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 mt-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Commencez Votre Audit de Sécurité</h2>
            <p className="text-purple-200 max-w-2xl mx-auto mb-8">
                FENNEC simplifie la conformité aux standards de sécurité sur tous vos systèmes, qu'ils soient sous Linux, Windows ou macOS.
            </p>
            <button 
                className="bg-white text-purple-700 font-bold py-3 px-8 rounded-lg shadow-lgtransition 
                duration-300 cursor-pointer hover:bg-gray-200"
                onClick={handleCreateAgent}>
                Créer Votre Premier Agent
            </button>
        </div>
    );
}

export default CreateAgentCTA