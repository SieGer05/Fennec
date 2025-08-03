import LoginBackground from "../components/Login/LoginBackground";
import LoginForm from "../components/Login/LoginForm";
import { Navigate } from "react-router-dom";

function Login() {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if ( isLoggedIn ) {
    return <Navigate to="/agents" replace />;
  }
  
  return (
    <div className="relative min-h-screen w-full">
      <LoginBackground />

      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 py-8">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-black font-opensans">
            FENNEC 
            <span className="text-xl sm:text-2xl md:text-3xl ml-1 sm:ml-2 text-purple-800">⬤</span>
          </div>
          
          <div className="font-opensans text-xs sm:text-sm md:text-base mt-2 mb-6 sm:mb-8 md:mb-10 lg:mb-12 max-w-md px-4">
            Plateforme open source d'audit et sécurité intelligente
          </div>
        </div>

        <div className="w-full max-w-md px-2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

export default Login;