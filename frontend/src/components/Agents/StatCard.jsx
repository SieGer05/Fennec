function StatCard({ title, value, isBottom = false }) {
   if (isBottom) {
      return (
      <div className="flex flex-col">
         <h3>{title}</h3>
         <div className="text-xl font-bold mt-1 text-purple-800">{value}</div>
      </div>
   );
   }

   return (
      <div className="flex flex-col items-center">
         <h3>{title}</h3>
         <div className="font-bold mt-1">{value}</div>
      </div>
   );
}

export default StatCard;