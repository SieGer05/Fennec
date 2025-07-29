import Header from "../components/Agents/Header";
import AgentStats from "../components/Agents/AgentStats";
import AgentUse from "../components/Agents/AgentUse";

function Agents() {
   return (
      <div className="bg-purple-200 w-full h-screen flex items-center justify-center">
         <div className="bg-white w-[98%] h-[97%]">
            <Header />
            <AgentStats />
            <AgentUse />
         </div>
      </div>
   );
}

export default Agents