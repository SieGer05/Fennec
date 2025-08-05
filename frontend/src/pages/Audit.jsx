import ServiceStatus from "../components/Audit/ServiceStatus";

function Audit() {
  const services = [
    { name: "SSH", active: true },
    { name: "Apache", active: true },
    { name: "MariaDB", active: false },
    { name: "Postfix", active: true },
    { name: "Dovecot", active: false },
  ];

  return (
    <div className="bg-purple-100 min-h-screen w-full flex justify-center items-start pt-7 pb-7">
      <div className="bg-white w-[90%] rounded-xl shadow p-6 min-h-[80vh]">
        <ServiceStatus services={services} />
      </div>
    </div>
  );
}

export default Audit;
