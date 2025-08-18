import { IMAGES } from "../../assets";
import { ICONS } from "../../assets";

function Header() {
  return (
    <header className="text-center mb-16 py-12 bg-gradient-to-b from-white to-purple-50 rounded-md">
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-700 mb-4 tracking-tight">
            Guide FENNEC pour l'Audit de Sécurité
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Automatisez les audits de sécurité sur tous vos systèmes avec FENNEC.
            </p>
        </div>

        <div className="animate-float">
            <img 
            src={IMAGES.Logo} 
            alt="FENNEC Logo" 
            className="w-32 mx-auto mt-8 mb-8 drop-shadow-xl"
            />
        </div>

        <div className="relative py-6 max-w-3xl mx-auto">
            <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-purple-100"></div>
            </div>
            <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-purple-500 font-medium rounded-2xl">
                PLATEFORMES SUPPORTÉES
            </span>
            </div>
        </div>

        <div className="mt-12 max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-center">
            {[
                { name: "Linux", icon: ICONS.Linux },
                { name: "Windows", icon: ICONS.Windows },
                { name: "macOS", icon: ICONS.Macos }
            ].map((platform) => (
                <div 
                key={platform.name}
                className="flex flex-col items-center bg-white rounded-xl border border-purple-100 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1.5"
                >
                <div className="bg-purple-50 p-4 rounded-full mb-4">
                    <img 
                    src={platform.icon} 
                    alt={platform.name} 
                    className="w-14 h-14 object-contain"
                    />
                </div>
                <span className="font-semibold text-purple-800 text-lg">
                    {platform.name}
                </span>
                </div>
            ))}
            </div>
        </div>
    </header>
  );
}

export default Header;