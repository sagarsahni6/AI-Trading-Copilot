// ============================================================
// Chrome Extension Message Types — Inter-context communication
// ============================================================

import type { MarketStatus, MarketTick } from './market';
import type { TradeRecommendation } from './trade';
import type { OptionChainSnapshot } from './option-chain';
import type { TechnicalIndicators } from './chart';
import type { SMCAnalysis } from './smc';

/**
 * All message types for chrome.runtime messaging
 */
export type ExtensionMessage =
  | MarketDataMessage
  | TradeSignalMessage
  | OptionChainMessage
  | ChartDataMessage
  | SMCDataMessage
  | AIchatMessage
  | SettingsMessage
  | ConnectionMessage
  | AlertMessage;

// ---- Market Data ----
export interface MarketDataMessage {
  readonly type: 'MARKET_DATA_UPDATE';
  readonly payload: {
    readonly tick: MarketTick;
    readonly status: MarketStatus;
  };
}

// ---- Trade Signal ----
export interface TradeSignalMessage {
  readonly type: 'TRADE_SIGNAL_UPDATE';
  readonly payload: TradeRecommendation;
}

// ---- Option Chain ----
export interface OptionChainMessage {
  readonly type: 'OPTION_CHAIN_UPDATE';
  readonly payload: OptionChainSnapshot;
}

// ---- Chart Data ----
export interface ChartDataMessage {
  readonly type: 'CHART_DATA_UPDATE';
  readonly payload: {
    readonly indicators: TechnicalIndicators;
    readonly patterns: string[];
  };
}

// ---- SMC Data ----
export interface SMCDataMessage {
  readonly type: 'SMC_DATA_UPDATE';
  readonly payload: SMCAnalysis;
}

// ---- AI Chat ----
export interface AIchatMessage {
  readonly type: 'AI_CHAT_REQUEST' | 'AI_CHAT_RESPONSE' | 'AI_CHAT_STREAM';
  readonly payload: {
    readonly message: string;
    readonly conversationId?: string;
    readonly isStreaming?: boolean;
  };
}

// ---- Settings ----
export interface SettingsMessage {
  readonly type: 'SETTINGS_UPDATE';
  readonly payload: {
    readonly key: string;
    readonly value: unknown;
  };
}

// ---- Connection ----
export interface ConnectionMessage {
  readonly type: 'CONNECTION_STATUS';
  readonly payload: {
    readonly connected: boolean;
    readonly backendUrl: string;
    readonly latency: number;
  };
}

// ---- Alerts ----
export interface AlertMessage {
  readonly type: 'ALERT_TRIGGER';
  readonly payload: {
    readonly alertType: 'TRADE_SIGNAL' | 'SCORE_CHANGE' | 'OI_SHIFT' | 'BREAKOUT' | 'CUSTOM';
    readonly title: string;
    readonly message: string;
    readonly priority: 'HIGH' | 'MEDIUM' | 'LOW';
    readonly sound: boolean;
  };
}

/**
 * Message handler type for type-safe message dispatch
 */
export type MessageHandler<T extends ExtensionMessage> = (
  message: T,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => boolean | void;
