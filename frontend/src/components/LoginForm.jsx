import { ICONS } from "../assets";

function LoginForm() {
   return (
      <div className="border border-purple-200 shadow-md rounded-sm bg-white w-full max-w-md px-4 py-5 mx-4 sm:mx-auto">
         <div className="relative">
            <img 
               src={ICONS.Username}
               className="absolute inset-y-0 left-3 w-5 h-5 my-auto text-gray-400"
            />
            <input
               type="text"
               placeholder="Nom d'utilisateur"
               className="w-full pl-10 pr-3 py-2 border border-gray-300 focus:outline-none focus:border-purple-600"
            />
         </div>

         <div className="relative">
            <img 
               src={ICONS.Password}
               className="absolute inset-y-0 left-3 w-5 h-auto my-7 text-gray-400"
            />
            <input
               type="password"
               placeholder="Mot de passe"
               className="w-full pl-10 pr-3 py-2 mt-4 sm:mt-5 border border-gray-300 focus:outline-none focus:border-purple-600"
            />
         </div>
         
         <button
            className="w-full py-2 bg-purple-700 border-0 rounded-sm text-white mt-4 sm:mt-5 cursor-pointer hover:bg-purple-800">
            Se Connecter
         </button>
      </div>
   );
}

export default LoginForm;