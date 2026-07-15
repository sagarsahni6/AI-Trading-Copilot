// ============================================================
// Option Chain Types — OI, Greeks, and derived metrics
// ============================================================

/**
 * Complete option chain snapshot
 */
export interface OptionChainSnapshot {
  readonly underlying: string;
  readonly spotPrice: number;
  readonly expiry: string;
  readonly strikes: StrikeData[];
  readonly metrics: OptionChainMetrics;
  readonly timestamp: number;
}

/**
 * Single strike row in the option chain
 */
export interface StrikeData {
  readonly strikePrice: number;
  readonly call: OptionData;
  readonly put: OptionData;
  readonly isATM: boolean;
  readonly isITM: boolean;
}

/**
 * Option data for a single strike (call or put side)
 */
export interface OptionData {
  readonly ltp: number;
  readonly oi: number;
  readonly oiChange: number;
  readonly volume: number;
  readonly iv: number;
  readonly bidPrice: number;
  readonly askPrice: number;
  readonly bidQty: number;
  readonly askQty: number;
  readonly greeks: OptionGreeks;
}

/**
 * Option Greeks computed from Black-Scholes
 */
export interface OptionGreeks {
  readonly delta: number;
  readonly gamma: number;
  readonly theta: number;
  readonly vega: number;
  readonly rho: number;
}

/**
 * Derived metrics from the option chain
 */
export interface OptionChainMetrics {
  readonly pcr: number; // Put-Call Ratio
  readonly maxPain: number;
  readonly totalCallOI: number;
  readonly totalPutOI: number;
  readonly totalCallVolume: number;
  readonly totalPutVolume: number;
  readonly callOIChange: number;
  readonly putOIChange: number;
  readonly support: number; // Highest put OI strike
  readonly resistance: number; // Highest call OI strike
  readonly gammaExposure: number; // Net GEX
  readonly ivSkew: number;
}

/** OI activity classification */
export type OIActivity =
  | 'LONG_BUILD_UP'   // Price ↑ OI ↑
  | 'LONG_UNWINDING'  // Price ↓ OI ↓
  | 'SHORT_BUILD_UP'  // Price ↓ OI ↑
  | 'SHORT_COVERING'  // Price ↑ OI ↓
  | 'NEUTRAL';

/** IV state classification */
export type IVState = 'CRUSH' | 'EXPANSION' | 'STABLE';

/**
 * OI shift analysis result
 */
export interface OIShiftAnalysis {
  readonly activity: OIActivity;
  readonly callWriting: number; // Net call OI added
  readonly putWriting: number; // Net put OI added
  readonly shortCovering: boolean;
  readonly longBuildUp: boolean;
  readonly longUnwinding: boolean;
  readonly shortBuildUp: boolean;
  readonly ivState: IVState;
  readonly interpretation: string;
}
