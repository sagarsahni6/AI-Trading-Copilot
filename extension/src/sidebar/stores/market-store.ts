// ============================================================
// Market Store — Zustand store for real-time market data
// ============================================================

import { create } from 'zustand';
import type { MarketStatus, MarketTick, TrendDirection, MarketSession } from '@shared/types';

interface MarketState {
  // Current market status
  status: MarketStatus;
  // Latest tick data
  currentTick: MarketTick | null;
  // Connection state
  isConnected: boolean;
  lastUpdated: number;
  // Historical ticks for mini charts
  recentTicks: MarketTick[];
  maxRecentTicks: number;

  // Actions
  updateStatus: (status: Partial<MarketStatus>) => void;
  updateTick: (tick: MarketTick) => void;
  setConnected: (connected: boolean) => void;
  reset: () => void;
}

const DEFAULT_STATUS: MarketStatus = {
  session: 'CLOSED' as MarketSession,
  trend: 'SIDEWAYS' as TrendDirection,
  momentum: 'NEUTRAL',
  volatility: 'MODERATE',
  spotPrice: 0,
  dayChange: 0,
  dayChangePercent: 0,
  vix: 0,
  updatedAt: Date.now(),
};

export const useMarketStore = create<MarketState>((set, get) => ({
  status: DEFAULT_STATUS,
  currentTick: null,
  isConnected: false,
  lastUpdated: 0,
  recentTicks: [],
  maxRecentTicks: 100,

  updateStatus: (partial) => {
    set((state) => ({
      status: {
        ...state.status,
        ...partial,
        updatedAt: Date.now(),
      },
      lastUpdated: Date.now(),
    }));
  },

  updateTick: (tick) => {
    const { recentTicks, maxRecentTicks } = get();
    const updated = [...recentTicks, tick].slice(-maxRecentTicks);

    set({
      currentTick: tick,
      recentTicks: updated,
      lastUpdated: Date.now(),
    });
  },

  setConnected: (connected) => {
    set({ isConnected: connected });
  },

  reset: () => {
    set({
      status: DEFAULT_STATUS,
      currentTick: null,
      isConnected: false,
      lastUpdated: 0,
      recentTicks: [],
    });
  },
}));
