import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";

function DeviceError() {
  const { logout } = useAuth();

  const handleLogout =() => {
    logout();
    toast.success("Déconnexion réussie !");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="max-w-md w-full text-center">
        
        <div className="mx-auto mb-5">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-purple-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <div className="mb-4">
          <span className="text-lg font-medium text-gray-900 border-b border-purple-200 pb-1">
            Fennec
          </span>
        </div>
        
        <h1 className="text-2xl font-medium text-gray-800 mb-3">
          Appareil non pris en charge
        </h1>
        
        <p className="text-gray-600 mb-5 leading-relaxed">
          Fennec n'est pas disponible sur les téléphones ou tablettes.<br />
          Veuillez utiliser un ordinateur de bureau.
        </p>
        
        <div className="w-16 h-px bg-gray-200 mx-auto mb-5"></div>
        
        <p className="text-sm text-gray-500">
          Fennec nécessite un écran plus large pour une expérience optimale.
        </p>

      <button
        className="mt-8 bg-purple-400 p-2 rounded-xl text-white font-bold
          cursor-pointer hover:bg-purple-700"
        onClick={handleLogout}>
          Déconnexion
      </button>
      </div>
    </div>
  );
}

export default DeviceError;