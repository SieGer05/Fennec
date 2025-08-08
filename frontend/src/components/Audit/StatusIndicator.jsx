function StatusIndicator({ status }) {
    const statusConfig = {
        active: { color: 'bg-gradient-to-r from-green-400 to-emerald-500', text: 'En cours d’exécution' },
        inactive: { color: 'bg-gradient-to-r from-rose-500 to-red-600', text: 'Arrêté' },
        missing: { color: 'bg-gradient-to-r from-gray-400 to-gray-600', text: 'Non installé' }
    };

    const { color, text } = statusConfig[status];

    return (
        <div className="flex items-center bg-gray-50 px-2 rounded-xl transition-all duration-300">
        <span className={`${color} w-3 h-3 rounded-full mr-3 animate-pulse`}></span>
        <span className="font-medium">{text}</span>
        </div>
    );
}

export default StatusIndicator;