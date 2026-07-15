// ============================================================
// Market Data Types — Core market information structures
// ============================================================

/** Represents the overall market trend direction */
export type TrendDirection = 'BULLISH' | 'BEARISH' | 'SIDEWAYS';

/** Suggested trade direction */
export type TradeDirection = 'CALL' | 'PUT' | 'NO_TRADE';

/** Market session status */
export type MarketSession = 'PRE_OPEN' | 'OPEN' | 'CLOSED' | 'POST_CLOSE';

/** Timeframe for analysis */
export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

/** Momentum strength level */
export type MomentumLevel = 'STRONG' | 'MODERATE' | 'WEAK' | 'NEUTRAL';

/** Volatility regime */
export type VolatilityRegime = 'HIGH' | 'MODERATE' | 'LOW' | 'EXTREME';

/**
 * Live market tick data from Kite/backend
 */
export interface MarketTick {
  readonly instrumentToken: number;
  readonly tradingSymbol: string;
  readonly lastPrice: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
  readonly oi: number;
  readonly oiChange: number;
  readonly bid: PriceLevel[];
  readonly ask: PriceLevel[];
  readonly timestamp: number;
}

/** Bid/Ask price level */
export interface PriceLevel {
  readonly price: number;
  readonly quantity: number;
  readonly orders: number;
}

/**
 * Aggregated market status displayed in the sidebar header
 */
export interface MarketStatus {
  readonly session: MarketSession;
  readonly trend: TrendDirection;
  readonly momentum: MomentumLevel;
  readonly volatility: VolatilityRegime;
  readonly spotPrice: number;
  readonly dayChange: number;
  readonly dayChangePercent: number;
  readonly vix: number;
  readonly updatedAt: number;
}

/**
 * OHLCV candle data for chart analysis
 */
export interface Candle {
  readonly timestamp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

/**
 * Support/Resistance level
 */
export interface PriceLevel2 {
  readonly price: number;
  readonly strength: 'STRONG' | 'MODERATE' | 'WEAK';
  readonly type: 'SUPPORT' | 'RESISTANCE';
  readonly touches: number;
}

/**
 * Instrument metadata
 */
export interface Instrument {
  readonly instrumentToken: number;
  readonly exchangeToken: number;
  readonly tradingSymbol: string;
  readonly name: string;
  readonly exchange: string;
  readonly segment: string;
  readonly instrumentType: string;
  readonly strikePrice: number;
  readonly expiry: string;
  readonly lotSize: number;
  readonly tickSize: number;
}
