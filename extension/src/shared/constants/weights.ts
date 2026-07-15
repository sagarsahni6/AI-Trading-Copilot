// ============================================================
// Signal Weights — Configurable weights for trade scoring
// ============================================================

/**
 * Default signal weights used by the Trade Engine
 * Each weight represents the maximum contribution to the overall score (out of 100)
 */
export const SIGNAL_WEIGHTS = {
  /** Trend analysis (EMA alignment, ADX, Supertrend) */
  TREND: 25,

  /** Option chain signals (PCR, Max Pain, OI shift, GEX) */
  OPTION_CHAIN: 20,

  /** Volume analysis (volume spike, VWAP position) */
  VOLUME: 15,

  /** Smart Money Concepts (BOS, CHOCH, OB, FVG, liquidity) */
  SMC: 20,

  /** Technical indicators (RSI, MACD, candlestick patterns) */
  INDICATORS: 10,

  /** Volatility assessment (IV, ATR, VIX) */
  VOLATILITY: 10,
} as const;

/**
 * Minimum score threshold for trade recommendation
 * Scores below this → "WAIT" / "NO TRADE"
 */
export const MIN_TRADE_SCORE = 80;

/**
 * Confidence level thresholds
 */
export const CONFIDENCE_THRESHOLDS = {
  VERY_HIGH: 90,
  HIGH: 75,
  MODERATE: 60,
  LOW: 40,
  VERY_LOW: 0,
} as const;

/**
 * Risk-Reward minimum threshold
 */
export const MIN_RISK_REWARD = 1.5;
