export interface SimulationSettings {
    // Base properties
    initialCapital: number;
    annualContribution: number; 
    yearsToSimulate: number;
    expectedReturn: number;
    volatility: number;
    tradingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    tradingStrategy: string;
    feesPerTrade?: number;
    taxRate?: number;
    
    // Properties for trading simulation
    startDate: string | Date; // Accepts string or Date
    endDate: string | Date;   // Accepts string or Date
    tradesPerDay: number;
    winRate: number;
    riskRewardRatio: number;
    positionSizingPercent: number;
    maxDrawdownPercent: number;
    averageWinAmount: number;
    averageLossAmount: number;
    riskPerTrade: number;
    startingEquity: number;
    darkMode?: boolean;
}

export interface EquityPoint {
    date: string;
    equity: number;
    month: string;
    week: string;
}

export interface DateInfo {
    fullDate: string;
    month: string;
    week: string;
    dateObj: Date;
}

export interface MonthlyStats {
    month: string;
    wins: number;
    losses: number;
    profitLoss: number;
    trades: number;
    winRate?: string;
}

export interface WeeklyStats {
    week: string;
    wins: number;
    losses: number;
    profitLoss: number;
    trades: number;
    winRate?: string;
}

export interface SimulationStats {
    winRate: number;
    avgRPerDay: number;
    avgRPerWeek: number;
    avgTradesPerDay: number;
    initialEquity: number;
    finalEquity: number;
    totalProfit: number;
    maxWinStreak: number;
    maxLossStreak: number;
    maxDrawdown: number;
    maxDrawdownPeriod: string;
    maxWinStreakPeriod: string;
    maxLossStreakPeriod: string;
    equityCurve: EquityPoint[];
    monthlyBreakdown: MonthlyStats[];
    weeklyBreakdown: WeeklyStats[];
    totalTrades: number;
    riskRewardRatio: number;
}