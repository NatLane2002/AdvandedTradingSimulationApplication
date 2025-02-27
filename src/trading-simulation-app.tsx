import React, { useState } from 'react';
import TradingSimulationSettings from './trading-simulation-settings';
import AnnualTradingResults from './annual-trading-results';
import { SimulationSettings } from './types';

const TradingSimulationApp: React.FC = () => {
  const [showResults, setShowResults] = useState<boolean>(false);
  const [simulationParams, setSimulationParams] = useState<SimulationSettings | null>(null);
  
  const handleSettingsSubmit = (settings: SimulationSettings) => {
    setSimulationParams(settings);
    setShowResults(true);
  };
  
  const handleBackToSettings = () => {
    setShowResults(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {!showResults ? (
        <TradingSimulationSettings onSubmit={handleSettingsSubmit} />
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={handleBackToSettings}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium transition-colors"
            >
              ← Back to Settings
            </button>
          </div>
          {simulationParams && <AnnualTradingResults params={simulationParams} />}
        </>
      )}
    </div>
  );
};

export default TradingSimulationApp;