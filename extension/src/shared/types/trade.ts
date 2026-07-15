// ============================================================
// Trade Types — Trade recommendations and scoring
// ============================================================

import type { TrendDirection, TradeDirection, Timeframe } from './market';

/**
 * Complete trade recommendation from the AI + Trade Engine
 */
export interface TradeRecommendation {
  readonly id: string;
  readonly timestamp: number;
  readonly direction: TradeDirection;
  readonly score: number; // 0-100
  readonly confidence: ConfidenceLevel;
  readonly entry: number;
  readonly stopLoss: number;
  readonly target1: number;
  readonly target2: number;
  readonly target3: number;
  readonly riskReward: number;
  readonly trend: TrendDirection;
  readonly timeframe: Timeframe;
  readonly reasoning: TradeReasoning;
  readonly signals: SignalBreakdown;
  readonly warnings: string[];
  readonly notToTradeReasons: string[];
}

/** Confidence level classification */
export type ConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';

/**
 * AI-generated detailed reasoning
 */
export interface TradeReasoning {
  readonly whyTrade: string;
  readonly whyNot: string;
  readonly risk: string;
  readonly probability: string;
  readonly marketPsychology: string;
  readonly institutionalActivity: string;
  readonly expectedMovement: string;
  readonly alternativeScenario: string;
  readonly invalidationPoint: string;
}

/**
 * Weighted signal breakdown for scoring
 */
export interface SignalBreakdown {
  readonly trend: SignalScore;
  readonly optionChain: SignalScore;
  readonly volume: SignalScore;
  readonly smc: SignalScore;
  readonly indicators: SignalScore;
  readonly volatility: SignalScore;
}

/**
 * Individual signal score with reasoning
 */
export interface SignalScore {
  readonly name: string;
  readonly weight: number;
  readonly score: number; // 0-100
  readonly weightedScore: number; // score * weight / 100
  readonly direction: TrendDirection;
  readonly details: string;
}

/**
 * Trade journal entry stored in the database
 */
export interface TradeJournalEntry {
  readonly id: string;
  readonly date: string;
  readonly symbol: string;
  readonly direction: TradeDirection;
  readonly entryPrice: number;
  readonly exitPrice: number | null;
  readonly stopLoss: number;
  readonly target: number;
  readonly quantity: number;
  readonly pnl: number | null;
  readonly pnlPercent: number | null;
  readonly riskReward: number;
  readonly score: number;
  readonly result: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN';
  readonly notes: string;
  readonly mistakes: string[];
  readonly psychologyNotes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * Dashboard statistics
 */
export interface DashboardStats {
  readonly totalTrades: number;
  readonly wins: number;
  readonly losses: number;
  readonly breakeven: number;
  readonly winRate: number;
  readonly averageRR: number;
  readonly totalPnl: number;
  readonly bestTrade: number;
  readonly worstTrade: number;
  readonly currentStreak: number;
  readonly maxStreak: number;
  readonly averageScore: number;
}
