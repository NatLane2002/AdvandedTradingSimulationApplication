import React, { useState, FormEvent, ChangeEvent, useMemo, useEffect } from 'react';
import { Calendar, Moon, Sun, AlertCircle, Save, Download, X, Trash2, AlertTriangle } from 'lucide-react';
import { SimulationSettings } from './types';

interface TradingSimulationSettingsProps {
  onSubmit: (settings: SimulationSettings) => void;
}

interface SavedConfig {
  name: string;
  settings: SimulationSettings;
  date: string;
}

const TradingSimulationSettings: React.FC<TradingSimulationSettingsProps> = ({ onSubmit }) => {
  // Get current date for start date
  const today = new Date();
  // Get date one year from now for end date
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);
  
  // Format dates to YYYY-MM-DD for input fields
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  const [settings, setSettings] = useState<SimulationSettings>({
    // Required fields from your interface
    initialCapital: 10000,
    annualContribution: 0,
    yearsToSimulate: 1,
    expectedReturn: 10,
    volatility: 15,
    tradingFrequency: 'daily',
    tradingStrategy: 'momentum',
    
    // Fields shown in the UI - updated with dynamic dates
    startDate: formatDateForInput(today),
    endDate: formatDateForInput(oneYearFromNow),
    tradesPerDay: 4,
    winRate: 55,
    riskRewardRatio: 1,
    startingEquity: 50000,
    riskPerTrade: 250,
    
    // Additional required fields
    positionSizingPercent: 2,
    maxDrawdownPercent: 0,
    averageWinAmount: 0,
    averageLossAmount: 0,
    
    // Optional fields
    darkMode: false,
    feesPerTrade: 0,
    taxRate: 0
  });

  // State for saved configurations
  const [savedConfigs, setSavedConfigs] = useState<SavedConfig[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [configName, setConfigName] = useState('');
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);
  
  // Load saved configs from localStorage on component mount
  useEffect(() => {
    const savedConfigsStr = localStorage.getItem('tradingSimulationConfigs');
    if (savedConfigsStr) {
      try {
        const configs = JSON.parse(savedConfigsStr);
        setSavedConfigs(configs);
      } catch (e) {
        console.error('Failed to parse saved configurations', e);
      }
    }
  }, []);
  
  // Check if dates are valid
  const isValidDateRange = useMemo(() => {
    const startDate = new Date(settings.startDate);
    const endDate = new Date(settings.endDate);
    
    // Check if dates are valid and end date is after start date
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }
    
    return endDate >= startDate;
  }, [settings.startDate, settings.endDate]);
  
  // Calculate trading days dynamically based on start and end dates
  const tradingDays = useMemo(() => {
    const startDate = new Date(settings.startDate);
    const endDate = new Date(settings.endDate);
    
    // Invalid date handling
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
      return 0; // Return 0 if dates are invalid or end date is before start date
    }
    
    // Calculate total days
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Exclude weekends (approximately)
    // Each week has 5 trading days, so we calculate: (totalDays / 7) * 5
    const approxTradingDays = Math.max(1, Math.round((dayDiff / 7) * 5));
    
    return approxTradingDays;
  }, [settings.startDate, settings.endDate]);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isValidDateRange) {
      onSubmit(settings);
    }
  };
  
  const toggleDarkMode = () => {
    setSettings({
      ...settings,
      darkMode: !settings.darkMode
    });
  };
  
  // Save current settings
  const handleSaveSettings = () => {
    if (!configName.trim()) return;
    
    const newConfig: SavedConfig = {
      name: configName,
      settings: { ...settings },
      date: new Date().toLocaleDateString()
    };
    
    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    
    // Save to localStorage
    localStorage.setItem('tradingSimulationConfigs', JSON.stringify(updatedConfigs));
    
    // Close modal and reset name
    setShowSaveModal(false);
    setConfigName('');
  };
  
  // Load selected settings
  const handleLoadSettings = (config: SavedConfig) => {
    setSettings(config.settings);
    setShowLoadModal(false);
    setConfirmDeleteIndex(null);
  };
  
  // Delete saved configuration
  const handleDeleteConfig = (indexToDelete: number) => {
    const updatedConfigs = savedConfigs.filter((_, index) => index !== indexToDelete);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('tradingSimulationConfigs', JSON.stringify(updatedConfigs));
    setConfirmDeleteIndex(null); // Reset confirmation state after deletion
  };
  
  // Dynamic classes based on dark mode
  const containerClass = settings.darkMode 
    ? "p-6 bg-gray-900 rounded-lg shadow-lg text-white" 
    : "p-6 bg-gray-50 rounded-lg shadow-lg";
  
  const inputClass = settings.darkMode 
    ? "mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
    : "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  
  const errorInputClass = settings.darkMode 
    ? "mt-1 block w-full px-3 py-2 bg-gray-800 border border-red-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
    : "mt-1 block w-full px-3 py-2 bg-white border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500";
  
  const labelClass = settings.darkMode 
    ? "block text-sm font-medium text-gray-300" 
    : "block text-sm font-medium text-gray-700";
  
  const buttonClass = settings.darkMode
    ? "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
    : "w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const modalOverlayClass = settings.darkMode
    ? "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
    : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    
  const modalContentClass = settings.darkMode
    ? "bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"
    : "bg-white p-6 rounded-lg shadow-lg w-full max-w-md";
    
  const iconButtonClass = settings.darkMode
    ? "p-2 rounded-md hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
    : "p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors";
    
  const errorMessageClass = settings.darkMode
    ? "mt-2 flex items-center text-sm text-red-400"
    : "mt-2 flex items-center text-sm text-red-600";
  
  return (
    <div className={containerClass}>
      {/* Header and Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trading Simulation Settings</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSaveModal(true)}
            className={iconButtonClass}
            title="Save settings"
          >
            <Save size={20} />
          </button>
          <button 
            onClick={() => setShowLoadModal(true)}
            className={iconButtonClass}
            title="Load settings"
            disabled={savedConfigs.length === 0}
          >
            <Download size={20} />
          </button>
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded-full ${settings.darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
            title={settings.darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Date Range */}
          <div>
            <label htmlFor="startDate" className={labelClass}>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Start Date</span>
              </div>
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              className={isValidDateRange ? inputClass : errorInputClass}
              value={String(settings.startDate)}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className={labelClass}>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>End Date</span>
              </div>
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              className={isValidDateRange ? inputClass : errorInputClass}
              value={String(settings.endDate)}
              onChange={handleChange}
              required
            />
            {!isValidDateRange && (
              <div className={errorMessageClass}>
                <AlertCircle size={16} className="mr-1" />
                End date must be after start date
              </div>
            )}
          </div>
          
          {/* Trading Parameters */}
          <div>
            <label htmlFor="tradesPerDay" className={labelClass}>Trades Per Day</label>
            <input
              type="number"
              name="tradesPerDay"
              id="tradesPerDay"
              min="1"
              max="20"
              step="1"
              className={inputClass}
              value={settings.tradesPerDay}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="winRate" className={labelClass}>Win Rate (%)</label>
            <input
              type="number"
              name="winRate"
              id="winRate"
              min="1"
              max="99"
              step="0.1"
              className={inputClass}
              value={settings.winRate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="riskRewardRatio" className={labelClass}>Risk/Reward Ratio</label>
            <input
              type="number"
              name="riskRewardRatio"
              id="riskRewardRatio"
              min="0.1"
              max="10"
              step="0.1"
              className={inputClass}
              value={settings.riskRewardRatio}
              onChange={handleChange}
              required
            />
            <p className={`mt-1 text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              1 = equal risk and reward, 2 = potential reward is twice the risk
            </p>
          </div>
          
          <div>
            <label htmlFor="startingEquity" className={labelClass}>Starting Equity ($)</label>
            <input
              type="number"
              name="startingEquity"
              id="startingEquity"
              min="1000"
              step="1000"
              className={inputClass}
              value={settings.startingEquity}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="riskPerTrade" className={labelClass}>$ Amount at Risk per Trade</label>
            <input
              type="number"
              name="riskPerTrade"
              id="riskPerTrade"
              min="1"
              step="any"
              className={inputClass}
              value={settings.riskPerTrade}
              onChange={handleChange}
              required
            />
            <p className={`mt-1 text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Amount you're willing to lose on each trade
            </p>
          </div>
        </div>
        
        {/* Info Cards */}
        <div className={`p-4 rounded-md mb-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <h3 className={`text-sm font-medium ${settings.darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            Simulation Preview
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Trading Days</p>
              {isValidDateRange ? (
                <p className="font-medium">~{tradingDays} days</p>
              ) : (
                <p className="font-medium text-red-500">Invalid date range</p>
              )}
            </div>
            <div>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Trades</p>
              {isValidDateRange ? (
                <p className="font-medium">~{tradingDays * settings.tradesPerDay} trades</p>
              ) : (
                <p className="font-medium text-red-500">Invalid date range</p>
              )}
            </div>
            <div>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Risk per Trade</p>
              <p className="font-medium">${settings.riskPerTrade.toLocaleString()}</p>
            </div>
            <div>
              <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reward per Winning Trade</p>
              <p className="font-medium">${(settings.riskPerTrade * settings.riskRewardRatio).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          className={buttonClass}
          disabled={!isValidDateRange}
        >
          Run Simulation
        </button>
      </form>
      
      {/* Save Settings Modal */}
      {showSaveModal && (
        <div className={modalOverlayClass}>
          <div className={modalContentClass}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Save Configuration</h3>
              <button 
                onClick={() => setShowSaveModal(false)}
                className={iconButtonClass}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label htmlFor="configName" className={labelClass}>Configuration Name</label>
              <input
                type="text"
                id="configName"
                className={inputClass}
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="My trading strategy"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                type="button" 
                className={settings.darkMode 
                  ? "px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600" 
                  : "px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"}
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveSettings}
                disabled={!configName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Settings Modal */}
      {showLoadModal && (
        <div className={modalOverlayClass}>
          <div className={modalContentClass}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Load Configuration</h3>
              <button 
                onClick={() => {
                  setShowLoadModal(false);
                  setConfirmDeleteIndex(null); // Reset delete confirmation when closing modal
                }}
                className={iconButtonClass}
              >
                <X size={20} />
              </button>
            </div>
            {savedConfigs.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {savedConfigs.map((config, index) => (
                  <div 
                    key={index}
                    className={`p-3 mb-2 rounded-md ${
                      settings.darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    } ${confirmDeleteIndex === index ? 'border-2 border-red-500' : ''}`}
                  >
                    {confirmDeleteIndex === index ? (
                      <div className="w-full">
                        <div className="flex items-center mb-2 text-red-500">
                          <AlertTriangle size={16} className="mr-2" />
                          <span className="text-sm font-medium">Delete this configuration?</span>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setConfirmDeleteIndex(null)}
                            className={`px-3 py-1 text-xs rounded-md ${
                              settings.darkMode 
                                ? "bg-gray-600 text-white hover:bg-gray-500" 
                                : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(index)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div 
                          className="flex-grow cursor-pointer" 
                          onClick={() => handleLoadSettings(config)}
                        >
                          <p className="font-medium">{config.name}</p>
                          <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{config.date}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteIndex(index);
                          }}
                          className={`text-red-500 hover:text-red-700 ${settings.darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} p-1 rounded-full`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className={settings.darkMode ? 'text-gray-300' : 'text-gray-600'}>No saved configurations</p>
            )}
            <div className="mt-4 flex justify-end">
              <button 
                type="button" 
                className={settings.darkMode 
                  ? "px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600" 
                  : "px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"}
                onClick={() => {
                  setShowLoadModal(false);
                  setConfirmDeleteIndex(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingSimulationSettings;