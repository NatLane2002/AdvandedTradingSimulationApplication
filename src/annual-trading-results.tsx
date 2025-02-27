import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { SimulationSettings, SimulationStats, DateInfo, MonthlyStats, WeeklyStats, EquityPoint } from './types';

interface AnnualTradingResultsProps {
  params: SimulationSettings;
}

const AnnualTradingResults: React.FC<AnnualTradingResultsProps> = ({ params }) => {
  const [stats, setStats] = useState<SimulationStats>({
    winRate: 0,
    avgRPerDay: 0,
    avgRPerWeek: 0,
    avgTradesPerDay: 0,
    initialEquity: 0,
    finalEquity: 0,
    totalProfit: 0,
    maxWinStreak: 0,
    maxLossStreak: 0,
    maxDrawdown: 0,
    maxDrawdownPeriod: '',
    maxWinStreakPeriod: '',
    maxLossStreakPeriod: '',
    equityCurve: [],
    monthlyBreakdown: [],
    weeklyBreakdown: [],
    totalTrades: 0,
    riskRewardRatio: 0
  });
  
  const [darkMode, setDarkMode] = useState(params?.darkMode || false);
  // Add simulation key to trigger re-runs
  const [simulationKey, setSimulationKey] = useState<number>(1);
  
  // Function to re-run the simulation
  const handleRerun = () => {
    setSimulationKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    if (!params) return;
    
    // Set parameters for simulation
    const targetWinRate = params.winRate / 100; // Convert percentage to decimal
    const tradesPerDay = params.tradesPerDay;
    const riskRewardRatio = params.riskRewardRatio;
    const riskPerTrade = params.riskPerTrade;
    const rewardPerTrade = riskPerTrade * riskRewardRatio;
    const initialEquity = params.startingEquity;
    
    // Parse dates
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    
    // Calculate approximate trading days (excluding weekends)
    const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekendDays = Math.floor(dayDiff / 7) * 2;
    const approxTradingDays = Math.max(1, dayDiff - weekendDays);
    
    let runningEquity = initialEquity;
    const equityCurve: EquityPoint[] = [];
    const monthlyStats: Record<string, MonthlyStats> = {};
    const weeklyStats: Record<string, WeeklyStats> = {};
    
    // Generate trading dates for the simulation period
    const generateDates = (startDate: Date, endDate: Date): DateInfo[] => {
      const dates: DateInfo[] = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          const month = currentDate.toLocaleString('default', { month: 'short' });
          const day = currentDate.getDate();
          const year = currentDate.getFullYear();
          
          // Get week number
          const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
          const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
          const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
          
          dates.push({
            fullDate: `${month} ${day} ${year}`,
            month: `${month} ${year}`,
            week: `Week ${weekNumber}, ${year}`,
            dateObj: new Date(currentDate)
          });
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dates;
    };
    
    const dates = generateDates(startDate, endDate);
    
    // Simulate trading with the target win rate
    let totalWins = 0;
    let totalLosses = 0;
    let totalTrades = 0;
    
    // Tracking streaks
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let winStreakStart: string | null = null;
    let lossStreakStart: string | null = null;
    let maxWinStreakStart: string | null = null;
    let maxWinStreakEnd: string | null = null;
    let maxLossStreakStart: string | null = null;
    let maxLossStreakEnd: string | null = null;
    
    // Tracking drawdown
    let peakEquity = initialEquity;
    let currentDrawdown = 0;
    let maxDrawdown = 0;
    let drawdownStart: string | null = null;
    let drawdownEnd: string | null = null;
    let maxDrawdownStart: string | null = null;
    let maxDrawdownEnd: string | null = null;
    
    // Initialize monthly and weekly statistics tracking
    dates.forEach(date => {
      const monthKey = date.month;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          wins: 0,
          losses: 0,
          profitLoss: 0,
          trades: 0
        };
      }
      
      const weekKey = date.week;
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = {
          week: weekKey,
          wins: 0,
          losses: 0,
          profitLoss: 0,
          trades: 0
        };
      }
    });
    
    // Add initial point to equity curve
    if (dates.length > 0) {
      equityCurve.push({
        date: dates[0]?.fullDate || 'Start',
        equity: initialEquity,
        month: dates[0]?.month || 'Start',
        week: dates[0]?.week || 'Week 1'
      });
    }
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      let dayEquity = runningEquity;
      const monthKey = date.month;
      const weekKey = date.week;
      
      // Run trades for this day
      for (let j = 0; j < tradesPerDay; j++) {
        // Determine if trade is a win based on target win rate
        const isWin = Math.random() < targetWinRate;
        
        if (isWin) {
          dayEquity += rewardPerTrade;
          totalWins++;
          monthlyStats[monthKey].wins++;
          weeklyStats[weekKey].wins++;
          monthlyStats[monthKey].profitLoss += rewardPerTrade;
          weeklyStats[weekKey].profitLoss += rewardPerTrade;
          
          // Update win streak
          if (currentWinStreak === 0) {
            winStreakStart = date.fullDate;
          }
          currentWinStreak++;
          currentLossStreak = 0;
          
          if (currentWinStreak > maxWinStreak) {
            maxWinStreak = currentWinStreak;
            maxWinStreakStart = winStreakStart;
            maxWinStreakEnd = date.fullDate;
          }
        } else {
          dayEquity -= riskPerTrade;
          totalLosses++;
          monthlyStats[monthKey].losses++;
          weeklyStats[weekKey].losses++;
          monthlyStats[monthKey].profitLoss -= riskPerTrade;
          weeklyStats[weekKey].profitLoss -= riskPerTrade;
          
          // Update loss streak
          if (currentLossStreak === 0) {
            lossStreakStart = date.fullDate;
          }
          currentLossStreak++;
          currentWinStreak = 0;
          
          if (currentLossStreak > maxLossStreak) {
            maxLossStreak = currentLossStreak;
            maxLossStreakStart = lossStreakStart;
            maxLossStreakEnd = date.fullDate;
          }
        }
        
        totalTrades++;
        monthlyStats[monthKey].trades++;
        weeklyStats[weekKey].trades++;
      }
      
      // Update peak equity and calculate drawdown
      if (dayEquity > peakEquity) {
        peakEquity = dayEquity;
        currentDrawdown = 0;
        drawdownStart = null;
      } else {
        const drawdownAmount = peakEquity - dayEquity;
        const drawdownPercentage = (drawdownAmount / peakEquity) * 100;
        
        if (drawdownPercentage > currentDrawdown) {
          currentDrawdown = drawdownPercentage;
          if (!drawdownStart) {
            drawdownStart = date.fullDate;
          }
          drawdownEnd = date.fullDate;
          
          if (currentDrawdown > maxDrawdown) {
            maxDrawdown = currentDrawdown;
            maxDrawdownStart = drawdownStart;
            maxDrawdownEnd = drawdownEnd;
          }
        }
      }
      
      equityCurve.push({
        date: date.fullDate,
        equity: dayEquity,
        month: date.month,
        week: date.week
      });
      
      runningEquity = dayEquity;
    }
    
    // Calculate overall statistics
    const actualWinRate = totalWins / (totalWins + totalLosses) * 100 || params.winRate;
    const totalProfit = runningEquity - initialEquity;
    const avgRPerDay = totalProfit / (riskPerTrade * dates.length) || 0;
    const avgRPerWeek = avgRPerDay * 5; // Assuming 5 trading days per week
    const actualAvgTradesPerDay = totalTrades / dates.length || params.tradesPerDay;
    
    // Convert monthly stats to array and calculate monthly win rates
    const monthlyBreakdown = Object.values(monthlyStats).map(month => {
      const monthWinRate = month.wins / (month.wins + month.losses) * 100 || 0;
      return {
        ...month,
        winRate: monthWinRate.toFixed(2)
      };
    });
    
    // Convert weekly stats to array and calculate weekly win rates
    const weeklyBreakdown = Object.values(weeklyStats).map(week => {
      const weekWinRate = week.wins / (week.wins + week.losses) * 100 || 0;
      return {
        ...week,
        winRate: weekWinRate.toFixed(2)
      };
    });
    
    setStats({
      winRate: actualWinRate,
      avgRPerDay,
      avgRPerWeek,
      avgTradesPerDay: actualAvgTradesPerDay,
      initialEquity,
      totalProfit,
      finalEquity: runningEquity,
      maxWinStreak,
      maxLossStreak,
      maxDrawdown,
      maxDrawdownPeriod: `${maxDrawdownStart || 'N/A'} to ${maxDrawdownEnd || 'N/A'}`,
      maxWinStreakPeriod: `${maxWinStreakStart || 'N/A'} to ${maxWinStreakEnd || 'N/A'}`,
      maxLossStreakPeriod: `${maxLossStreakStart || 'N/A'} to ${maxLossStreakEnd || 'N/A'}`,
      equityCurve,
      monthlyBreakdown,
      weeklyBreakdown,
      totalTrades,
      riskRewardRatio
    });
  }, [params, simulationKey]); // Added simulationKey to dependencies

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Dynamic classes based on dark mode
  const containerClass = darkMode 
    ? "p-4 bg-gray-900 rounded-lg shadow-sm text-white" 
    : "p-4 bg-gray-50 rounded-lg shadow-sm";
  
  const cardClass = darkMode 
    ? "bg-gray-800 p-4 rounded-md shadow-sm" 
    : "bg-white p-4 rounded-md shadow-sm";
  
  const labelClass = darkMode 
    ? "text-gray-300 text-sm" 
    : "text-gray-500 text-sm";
  
  const tableHeaderClass = darkMode 
    ? "py-2 px-4 border-b border-gray-700 text-left" 
    : "py-2 px-4 border-b text-left";
  
  const tableCellClass = darkMode 
    ? "py-2 px-4 border-b border-gray-700" 
    : "py-2 px-4 border-b";
  
  const tableRowAltClass = darkMode 
    ? "bg-gray-850" 
    : "bg-gray-50";

  const buttonClass = darkMode
    ? "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
    : "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center";

  return (
    <div className={containerClass}>
      {/* Theme toggle button and Re-run button */}
      <div className="flex justify-between mb-4">
        <button
          onClick={handleRerun}
          className={buttonClass}
          title="Re-run simulation with the same parameters"
        >
          <RefreshCw size={18} className="mr-2" />
          Re-run Simulation
        </button>
        
        <button 
          onClick={toggleDarkMode} 
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-800'}`}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Trading Simulation Results ({params?.winRate || 0}% Win Rate)</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className={cardClass}>
            <h3 className={labelClass}>Initial Equity</h3>
            <p className="text-2xl font-bold">${stats.initialEquity?.toLocaleString()}</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Final Equity</h3>
            <p className={`text-2xl font-bold ${stats.finalEquity >= stats.initialEquity ? 'text-green-500' : 'text-red-500'}`}>
              ${stats.finalEquity?.toLocaleString()}
            </p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Win Rate</h3>
            <p className="text-2xl font-bold">{stats.winRate.toFixed(2)}%</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Risk:Reward</h3>
            <p className="text-2xl font-bold">1:{stats.riskRewardRatio}</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Avg R Per Day</h3>
            <p className="text-2xl font-bold">{stats.avgRPerDay.toFixed(2)}R</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Avg R Per Week</h3>
            <p className="text-2xl font-bold">{stats.avgRPerWeek.toFixed(2)}R</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Daily Trades</h3>
            <p className="text-2xl font-bold">{params?.tradesPerDay || 0}</p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Total Profit</h3>
            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${stats.totalProfit?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      
      {/* Rest of the component remains the same */}
      {/* Streak and drawdown metrics */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Streak & Drawdown Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={cardClass}>
            <h3 className={labelClass}>Max Win Streak</h3>
            <p className="text-2xl font-bold text-green-500">{stats.maxWinStreak}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} title={stats.maxWinStreakPeriod}>
              {stats.maxWinStreakPeriod || "N/A"}
            </p>
          </div>
          <div className={cardClass}>
            <h3 className={labelClass}>Max Loss Streak</h3>
            <p className="text-2xl font-bold text-red-500">{stats.maxLossStreak}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} title={stats.maxLossStreakPeriod}>
              {stats.maxLossStreakPeriod || "N/A"}
            </p>
          </div>
          <div className={`${cardClass} col-span-2`}>
            <h3 className={labelClass}>Max Drawdown</h3>
            <p className="text-2xl font-bold text-red-500">{stats.maxDrawdown.toFixed(2)}%</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`} title={stats.maxDrawdownPeriod}>
              {stats.maxDrawdownPeriod || "N/A"}
            </p>
          </div>
        </div>
      </div>
      
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold mb-4">Equity Curve ({params?.winRate || 0}% Win Rate)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats.equityCurve}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10, fill: darkMode ? "#D1D5DB" : "#374151" }} 
                interval={Math.max(1, Math.floor(stats.equityCurve.length / 10))} 
                stroke={darkMode ? "#4B5563" : "#9CA3AF"}
              />
              <YAxis 
                domain={['dataMin - 5000', 'dataMax + 5000']} 
                tick={{ fill: darkMode ? "#D1D5DB" : "#374151" }}
                stroke={darkMode ? "#4B5563" : "#9CA3AF"}
              />
              <Tooltip 
                formatter={(value) => ['$' + value.toLocaleString(), 'Account Balance']}
                contentStyle={{ 
                  backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                  borderColor: darkMode ? "#4B5563" : "#E5E7EB",
                  color: darkMode ? "#F3F4F6" : "#111827"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="equity" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Monthly breakdown */}
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold mb-4">Monthly Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Month</th>
                <th className={tableHeaderClass}>Win Rate</th>
                <th className={tableHeaderClass}>Profit/Loss</th>
                <th className={tableHeaderClass}>Trades</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyBreakdown.map((month, index) => (
                <tr key={month.month} className={index % 2 === 1 ? tableRowAltClass : ''}>
                  <td className={tableCellClass}>{month.month}</td>
                  <td className={tableCellClass}>
                    <span className={parseFloat(month.winRate || '0') >= 50 ? 'text-green-500' : 'text-red-500'}>
                      {month.winRate}%
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className={month.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${month.profitLoss.toLocaleString()}
                    </span>
                  </td>
                  <td className={tableCellClass}>{month.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Weekly breakdown */}
      <div className={`${cardClass} mb-6`}>
        <h3 className="text-lg font-bold mb-4">Weekly Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Week</th>
                <th className={tableHeaderClass}>Win Rate</th>
                <th className={tableHeaderClass}>Profit/Loss</th>
                <th className={tableHeaderClass}>Trades</th>
              </tr>
            </thead>
            <tbody>
              {stats.weeklyBreakdown.map((week, index) => (
                <tr key={week.week} className={index % 2 === 1 ? tableRowAltClass : ''}>
                  <td className={tableCellClass}>{week.week}</td>
                  <td className={tableCellClass}>
                    <span className={parseFloat(week.winRate || '0') >= 50 ? 'text-green-500' : 'text-red-500'}>
                      {week.winRate}%
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <span className={week.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      ${week.profitLoss.toLocaleString()}
                    </span>
                  </td>
                  <td className={tableCellClass}>{week.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnnualTradingResults;