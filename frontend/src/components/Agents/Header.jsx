import { IMAGES, ICONS } from "../../assets";

function Header() {
   return (
      <div className="w-full border-b border-purple-200 h-12 flex items-center px-4 bg-white relative">
         <img
            src={IMAGES.Logo}
            alt="Logo"
            className="h-10 w-auto object-contain pr-4"
         />
         <div className="border-l border-purple-200 h-8"></div>
         <p
            className="text-[14px] bg-purple-200 rounded-md px-2 text-black font-opensans font-medium py-0.5 mx-4"
         >
            Point d'accès aux Agents
         </p>
         <div className="absolute right-4 flex items-center space-x-3">
            <p 
               className="font-opensans text-black border-b border-purple-500 pb-0 mr-2 text-[14px]"
            >admin</p>
            <span 
               className="text-sm text-green-700 mb-0.5"
            >⬤</span>

            <div className="border-l border-purple-200 h-8"></div>
            
            <img 
               src={ICONS.Logout} 
               alt="Logout" 
               className="h-8 w-auto object-contain hover:brightness-80 transition duration-200 cursor-pointer"
            />
         </div>
      </div>
   );
}

export default Header