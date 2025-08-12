import { toast } from "react-hot-toast";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

function LoginForm() {
   const [ username, setUsername ] = useState("");
   const [ password, setPassword ] = useState("");
   const { login } = useAuth();

   const handleLogin = async(e) => {
      e.preventDefault();

      if (!username || !password) {
         toast.error("Veuillez remplir tous les champs");
         return;
      }

      try {
         await login(username, password);
         toast.success("Connexion réussie !");
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <form
         onSubmit={handleLogin}
         className="border border-purple-200 shadow-md rounded-sm bg-white w-full max-w-md px-4 py-5 mx-4 sm:mx-auto"
      >
         <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-purple-600"
         />
         <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 mt-4 sm:mt-5 border border-gray-300 focus:outline-none focus:border-purple-600"
         />
         <button
            type="submit"
            className="w-full py-2 bg-purple-700 border-0 rounded-sm text-white mt-4 sm:mt-5 cursor-pointer hover:bg-purple-800"
         >
            Se Connecter
         </button>
      </form>
   );
}

export default LoginForm;