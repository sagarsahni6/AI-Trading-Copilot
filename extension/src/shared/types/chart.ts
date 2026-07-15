// ============================================================
// Chart & Technical Analysis Types
// ============================================================

import type { TrendDirection } from './market';

/**
 * Technical indicator results
 */
export interface TechnicalIndicators {
  readonly ema: EMAResult;
  readonly vwap: number;
  readonly rsi: RSIResult;
  readonly macd: MACDResult;
  readonly atr: number;
  readonly adx: ADXResult;
  readonly supertrend: SupertrendResult;
  readonly movingAverages: MovingAverageResult;
  readonly volumeSpike: boolean;
  readonly volumeSpikeMultiplier: number;
}

export interface EMAResult {
  readonly ema9: number;
  readonly ema21: number;
  readonly ema50: number;
  readonly ema200: number;
  readonly crossover: 'BULLISH_CROSS' | 'BEARISH_CROSS' | 'NONE';
}

export interface RSIResult {
  readonly value: number;
  readonly zone: 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL';
  readonly divergence: 'BULLISH' | 'BEARISH' | 'NONE';
}

export interface MACDResult {
  readonly macd: number;
  readonly signal: number;
  readonly histogram: number;
  readonly crossover: 'BULLISH' | 'BEARISH' | 'NONE';
}

export interface ADXResult {
  readonly value: number;
  readonly plusDI: number;
  readonly minusDI: number;
  readonly trendStrength: 'STRONG' | 'MODERATE' | 'WEAK' | 'NO_TREND';
}

export interface SupertrendResult {
  readonly value: number;
  readonly direction: TrendDirection;
  readonly signal: 'BUY' | 'SELL' | 'HOLD';
}

export interface MovingAverageResult {
  readonly sma20: number;
  readonly sma50: number;
  readonly sma200: number;
  readonly goldenCross: boolean;
  readonly deathCross: boolean;
}

/**
 * Candlestick pattern detection
 */
export type CandlestickPattern =
  | 'DOJI'
  | 'HAMMER'
  | 'INVERTED_HAMMER'
  | 'BULLISH_ENGULFING'
  | 'BEARISH_ENGULFING'
  | 'MORNING_STAR'
  | 'EVENING_STAR'
  | 'THREE_WHITE_SOLDIERS'
  | 'THREE_BLACK_CROWS'
  | 'SHOOTING_STAR'
  | 'HANGING_MAN'
  | 'SPINNING_TOP'
  | 'MARUBOZU'
  | 'TWEEZER_TOP'
  | 'TWEEZER_BOTTOM';

export interface DetectedPattern {
  readonly pattern: CandlestickPattern;
  readonly direction: TrendDirection;
  readonly reliability: 'HIGH' | 'MODERATE' | 'LOW';
  readonly candleIndex: number;
}

/**
 * Supply/Demand zone
 */
export interface Zone {
  readonly type: 'SUPPLY' | 'DEMAND';
  readonly high: number;
  readonly low: number;
  readonly strength: 'STRONG' | 'MODERATE' | 'WEAK';
  readonly touches: number;
  readonly fresh: boolean;
}

/**
 * Breakout/Breakdown event
 */
export interface BreakoutEvent {
  readonly type: 'BREAKOUT' | 'BREAKDOWN';
  readonly level: number;
  readonly volume: number;
  readonly confirmed: boolean;
  readonly retest: boolean;
}
