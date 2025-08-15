import { useState } from "react";
import { useNavigate } from 'react-router-dom';

function AuditingTable({ audits, loading, error }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;
    const totalPages = Math.ceil(audits.length / itemsPerPage);

    const navigate = useNavigate();

    const currentItems = audits.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const getStatusStyles = (passed) => 
        passed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';

    const getSeverityStyles = (severity) => {
        const styles = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-blue-100 text-blue-800'
        };
        return styles[severity.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    // Helper function to extract URL from source string
    const extractUrl = (source) => {
        if (!source) return '#';
        
        // Look for http or https URL in the source string
        const urlMatch = source.match(/(https?:\/\/[^\s]+)/);
        return urlMatch ? urlMatch[1] : '#';
    };

    const TruncatedText = ({ text, maxLength = 20 }) => {
        if (!text) return null;
        
        const truncated = text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
        
        return (
            <div className="group relative">
                <span className="truncate block">{truncated}</span>
                {text.length > maxLength && (
                    <div className="absolute hidden group-hover:block z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded whitespace-normal max-w-xs w-auto">
                        {text}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
                    </div>
                )}
            </div>
        );
    };

    const handleGoBack = () => {
      navigate(`/agents/`);
    };

    if (loading) {
        return (
            <div className="mt-8 flex justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mb-4"></div>
                    <p className="text-purple-800 font-mono">Audit de la configuration des services...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Erreur d'audit</h3>
                <p className="text-red-700">{error}</p>
                <button
                    className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    onClick={() => window.location.reload()}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (audits.length === 0) {
        return (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800">Aucun audit de configuration disponible</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* Desktop Table */}
            <div className="hidden md:block rounded-xl border border-gray-200 shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                            </th>
                            <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Directive
                            </th>
                            <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th scope="col" className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Gravité
                            </th>
                            <th scope="col" className="w-[22.5%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Attendu
                            </th>
                            <th scope="col" className="w-[22.5%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actuel
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((audit, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <TruncatedText text={audit.serviceName} maxLength={20} />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <TruncatedText text={audit.directive} maxLength={25} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(audit.passed)}`}>
                                        {audit.passed ? 'Réussi' : 'Échoué'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityStyles(audit.severity)}`}>
                                        {audit.severity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <TruncatedText text={audit.expected} maxLength={30} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <TruncatedText text={audit.actual} maxLength={30} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {currentItems.map((audit, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <h4 className="font-semibold text-gray-900">
                                    {audit.serviceName}
                                </h4>
                                <p className="text-sm text-gray-600">{audit.directive}</p>
                            </div>
                            
                            <div>
                                <p className="text-xs text-gray-500">Statut</p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyles(audit.passed)}`}>
                                    {audit.passed ? 'Réussi' : 'Échoué'}
                                </span>
                            </div>
                            
                            <div>
                                <p className="text-xs text-gray-500">Gravité</p>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityStyles(audit.severity)}`}>
                                    {audit.severity}
                                </span>
                            </div>
                            
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Attendu</p>
                                <p className="text-sm truncate">{audit.expected}</p>
                            </div>
                            
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Actuel</p>
                                <p className="text-sm truncate">{audit.actual}</p>
                            </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <a 
                                href={extractUrl(audit.source)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-purple-600 hover:underline inline-flex items-center"
                            >
                                Référence
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
                <div className="text-sm text-gray-700">
                    Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, audits.length)}</span> sur{' '}
                    <span className="font-medium">{audits.length}</span> résultats
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                            currentPage === 1 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    >
                        Précédent
                    </button>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                            currentPage === totalPages 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    >
                        Suivant
                    </button>
                </div>
            </div>

            {/* Details Section */}
            <div className="mt-6 space-y-4">
                {currentItems.map((audit, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-1">
                            {audit.serviceName} : {audit.directive} — Configuration
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">{audit.description}</p>
                        <a 
                            href={extractUrl(audit.source)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:underline inline-flex items-center"
                        >
                            Référence
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-6">
                <button 
                    className="border-none bg-purple-600 text-white px-4 py-2 rounded-xl
                        hover:bg-purple-800 cursor-pointer"
                    onClick={handleGoBack}
                >
                    Page précédente
                </button>
            </div>
        </div>
    );
}

export default AuditingTable;