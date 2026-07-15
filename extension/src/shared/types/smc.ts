// ============================================================
// Smart Money Concepts (SMC) Types
// ============================================================

import type { TrendDirection } from './market';

/**
 * Complete SMC analysis result
 */
export interface SMCAnalysis {
  readonly structureBreaks: StructureBreak[];
  readonly orderBlocks: OrderBlock[];
  readonly fairValueGaps: FairValueGap[];
  readonly liquidityLevels: LiquidityLevel[];
  readonly marketStructure: MarketStructure;
  readonly priceZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  readonly institutionalBias: TrendDirection;
}

/** Market structure type */
export type StructureType = 'BOS' | 'CHOCH'; // Break of Structure | Change of Character

/**
 * Structure break detection (BOS/CHOCH)
 */
export interface StructureBreak {
  readonly type: StructureType;
  readonly direction: TrendDirection;
  readonly price: number;
  readonly timestamp: number;
  readonly confirmed: boolean;
  readonly significance: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Order Block detection
 */
export type OrderBlockType = 'ORDER_BLOCK' | 'BREAKER_BLOCK' | 'MITIGATION_BLOCK';

export interface OrderBlock {
  readonly type: OrderBlockType;
  readonly direction: TrendDirection;
  readonly high: number;
  readonly low: number;
  readonly origin: number; // Timestamp of origin candle
  readonly mitigated: boolean;
  readonly strength: 'STRONG' | 'MODERATE' | 'WEAK';
}

/**
 * Fair Value Gap (FVG / Imbalance)
 */
export interface FairValueGap {
  readonly direction: TrendDirection;
  readonly high: number;
  readonly low: number;
  readonly filled: boolean;
  readonly fillPercent: number;
  readonly timestamp: number;
}

/**
 * Liquidity level (equal highs/lows, swing points)
 */
export interface LiquidityLevel {
  readonly type: 'EQUAL_HIGH' | 'EQUAL_LOW' | 'SWING_HIGH' | 'SWING_LOW';
  readonly price: number;
  readonly swept: boolean;
  readonly sweepTimestamp: number | null;
  readonly strength: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Overall market structure assessment
 */
export interface MarketStructure {
  readonly trend: TrendDirection;
  readonly higherHighs: boolean;
  readonly higherLows: boolean;
  readonly lowerHighs: boolean;
  readonly lowerLows: boolean;
  readonly lastBOS: StructureBreak | null;
  readonly lastCHOCH: StructureBreak | null;
}

/**
 * Classical Price Action patterns
 */
export type PriceActionPattern =
  | 'DOUBLE_TOP'
  | 'DOUBLE_BOTTOM'
  | 'HEAD_AND_SHOULDERS'
  | 'INVERSE_HEAD_AND_SHOULDERS'
  | 'ASCENDING_TRIANGLE'
  | 'DESCENDING_TRIANGLE'
  | 'SYMMETRICAL_TRIANGLE'
  | 'BULL_FLAG'
  | 'BEAR_FLAG'
  | 'PENNANT'
  | 'RECTANGLE'
  | 'ASCENDING_CHANNEL'
  | 'DESCENDING_CHANNEL'
  | 'CUP_AND_HANDLE';

export interface DetectedPricePattern {
  readonly pattern: PriceActionPattern;
  readonly direction: TrendDirection;
  readonly target: number;
  readonly invalidation: number;
  readonly completion: number; // 0-100%
  readonly reliability: 'HIGH' | 'MODERATE' | 'LOW';
}
