import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AgentsPieChart = ({ data }) => {
   const COLORS = ['#00C49F', '#FFBB28', '#0088FE', '#FF8042', '#8884d8'];
   
   const isEmpty = !data || data.length === 0 || data.every(item => item.value === 0);
  
   if (isEmpty) {
      return (
         <div className="flex flex-col items-center justify-center w-full h-full p-4">
         <div className="relative w-40 h-40">
            <PieChart width={160} height={160}>
               <Pie
               data={[{ value: 1 }]}
               cx={80}
               cy={80}
               innerRadius={60}
               outerRadius={70}
               fill="#F3F4F6"
               stroke="#E5E7EB"
               dataKey="value"
               />
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center">
               <p className="text-center text-gray-500 text-sm font-medium">
               No agent data
               </p>
            </div>
         </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col items-center w-full h-full p-4 mt-5">
         <div className="flex items-center justify-center w-full">
         <div className="w-1/2 max-w-[200px]">
            <ResponsiveContainer width="100%" height={180}>
               <PieChart>
                  <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={2}
                     dataKey="value"
                     nameKey="name"
                  >
                  {data.map((_, index) => (
                  <Cell 
                     key={index} 
                     fill={COLORS[index % COLORS.length]} 
                     stroke="#fff"
                     strokeWidth={2}
                  />
                  ))}
               </Pie>
               <Tooltip 
                     content={({ active, payload }) => {
                     if (active && payload && payload.length) {
                        return (
                           <div className="p-2 text-xs bg-gray-800 text-white rounded shadow-lg">
                              <p className="font-medium">{payload[0].name}</p>
                              <p>{payload[0].value} agents</p>
                           </div>
                        );
                     }
                     return null;
                     }}
               />
               </PieChart>
            </ResponsiveContainer>
         </div>
         
            <div className="ml-6 space-y-2">
               {data.map((entry, index) => (
               <div key={index} className="flex items-center">
                  <div 
                     className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                     style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600 truncate max-w-[100px]">{entry.name}</span>
                  <span className="ml-1 text-xs font-medium text-gray-900">({entry.value})</span>
               </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default AgentsPieChart;