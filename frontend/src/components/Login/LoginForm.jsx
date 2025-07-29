import { toast } from "react-hot-toast";
import { useState } from "react";

function LoginForm() {
   const [ username, setUsername ] = useState("");
   const [ password, setPassword ] = useState("");

   const handleLogin = async(e) => {
      e.preventDefault();

      if (!username || !password) {
         toast.error("Veuillez remplir tous les champs");
         return;
      }

      try {
         const response = await fetch("http://127.0.0.1:8000/auth/login", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
         });

         if (!response.ok) {
            const err = await response.json();
            toast.error(err.detail || "Identifiants invalides");
            return;
         }

         const data = await response.json();
         console.log("Login success: ", data);
         toast.success("Connexion réussie !");

      } catch (err) {
         console.error(err);
          toast.error("Erreur de connexion");
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