import Header from "../components/Guide/Header";
import SetupSteps from "../components/Guide/SetupSteps";
import FennecWorkflow from "../components/Guide/FennecWorkflow";
import CreateAgentCTA from "../components/Guide/CreateAgentCTA";
import Footer from "../components/Guide/Footer";

function Guide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-400 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-6xl w-full bg-purple-50 rounded-3xl shadow-2xl p-8 sm:p-12">
        {/* En-tête avec plateformes supportées */}
        <Header />
        {/* Processus en 3 étapes visuelles */}
        <SetupSteps />
        {/* Section Fonctionnement */}
        <FennecWorkflow />
        {/* Section Démarrer */}
        <CreateAgentCTA />
        {/* Pied de page */}
        <Footer />
      </div>
    </div>
  );
}

export default Guide;