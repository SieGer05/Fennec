import React from 'react';

const PerformanceList = ({ performances }) => {
  if (!performances || performances.length === 0) {
    return (
      <div className="p-5 text-center text-gray-400 mt-23 italic">
        Aucune donnée de performance disponible.
      </div>
    );
  }

  const getPerformanceData = (label, value) => {
    const lowerLabel = label.toLowerCase();
    
    // Determine metric type and icon
    let metricType = '';
    let icon = null;
    let progressColor = '';
    
    if (lowerLabel.includes('cpu')) {
      metricType = 'cpu';
      progressColor = 'bg-purple-600';
      icon = (
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13 7H7v6h6V7z" />
            <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } 
    else if (lowerLabel.includes('mémoire') || lowerLabel.includes('memoire') || lowerLabel.includes('memory')) {
      metricType = 'memory';
      progressColor = 'bg-blue-600';
      icon = (
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    else if (lowerLabel.includes('disque') || lowerLabel.includes('disk')) {
      metricType = 'disk';
      progressColor = 'bg-amber-600';
      icon = (
        <div className="p-2 bg-amber-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1H4v10h12V6z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6 9a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    else if (lowerLabel.includes('fonctionnement') || lowerLabel.includes('uptime') || lowerLabel.includes('temps')) {
      metricType = 'uptime';
      progressColor = 'bg-green-600';
      icon = (
        <div className="p-2 bg-green-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    // Parse values for progress bars
    let percentage = null;
    
    // CPU percentage (e.g., "0.0%")
    const cpuMatch = value.match(/([\d.]+)%/);
    if (cpuMatch) percentage = parseFloat(cpuMatch[1]);
    
    // Memory values (e.g., ".2 Go sur 1.9 Go")
    const memoryMatch = value.match(/([\d.]+)\s*Go\s*sur\s*([\d.]+)/);
    if (memoryMatch) {
      const used = parseFloat(memoryMatch[1]);
      const total = parseFloat(memoryMatch[2]);
      percentage = (used / total) * 100;
    }
    
    // Disk values (e.g., "109 Go / 117 Go")
    const diskMatch = value.match(/([\d.]+)\s*Go\s*\/\s*([\d.]+)/);
    if (diskMatch) {
      const used = parseFloat(diskMatch[1]);
      const total = parseFloat(diskMatch[2]);
      percentage = (used / total) * 100;
    }

    return { icon, percentage, progressColor, rawValue: value };
  };

  return (
    <div className="overflow-hidden mt-2">
      <div className="p-5">
        <div className="space-y-5">
          {performances.map(({ label, value }, index) => {
            const { icon, percentage, progressColor, rawValue } = getPerformanceData(label, value);
            
            return (
              <div key={index} className="flex items-start">
                <div className="mt-0.5 mr-3">
                  {icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-[14px] text-gray-800">{label}</h3>
                    <span className="text-[14px] font-medium text-gray-700">{rawValue}</span>
                  </div>
                  
                  {percentage !== null && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`${progressColor} h-1.5 rounded-full`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PerformanceList;