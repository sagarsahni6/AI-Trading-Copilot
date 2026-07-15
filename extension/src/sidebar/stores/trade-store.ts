// ============================================================
// Trade Store — Zustand store for trade signals & journal
// ============================================================

import { create } from 'zustand';
import type {
  TradeRecommendation,
  TradeJournalEntry,
  DashboardStats,
} from '@shared/types';

interface TradeState {
  // Current active recommendation
  currentSignal: TradeRecommendation | null;
  // History of signals
  signalHistory: TradeRecommendation[];
  maxHistory: number;
  // Trade journal
  journalEntries: TradeJournalEntry[];
  // Dashboard stats
  stats: DashboardStats;
  // Loading states
  isAnalyzing: boolean;
  analysisError: string | null;

  // Actions
  updateSignal: (signal: TradeRecommendation) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  addJournalEntry: (entry: TradeJournalEntry) => void;
  updateJournalEntry: (id: string, updates: Partial<TradeJournalEntry>) => void;
  removeJournalEntry: (id: string) => void;
  setJournalEntries: (entries: TradeJournalEntry[]) => void;
  updateStats: (stats: DashboardStats) => void;
  reset: () => void;
}

const DEFAULT_STATS: DashboardStats = {
  totalTrades: 0,
  wins: 0,
  losses: 0,
  breakeven: 0,
  winRate: 0,
  averageRR: 0,
  totalPnl: 0,
  bestTrade: 0,
  worstTrade: 0,
  currentStreak: 0,
  maxStreak: 0,
  averageScore: 0,
};

export const useTradeStore = create<TradeState>((set, get) => ({
  currentSignal: null,
  signalHistory: [],
  maxHistory: 50,
  journalEntries: [],
  stats: DEFAULT_STATS,
  isAnalyzing: false,
  analysisError: null,

  updateSignal: (signal) => {
    const { signalHistory, maxHistory } = get();
    const updated = [signal, ...signalHistory].slice(0, maxHistory);

    set({
      currentSignal: signal,
      signalHistory: updated,
      isAnalyzing: false,
      analysisError: null,
    });
  },

  setAnalyzing: (analyzing) => {
    set({ isAnalyzing: analyzing });
  },

  setError: (error) => {
    set({ analysisError: error, isAnalyzing: false });
  },

  addJournalEntry: (entry) => {
    set((state) => ({
      journalEntries: [entry, ...state.journalEntries],
    }));
  },

  updateJournalEntry: (id, updates) => {
    set((state) => ({
      journalEntries: state.journalEntries.map((e) =>
        e.id === id ? { ...e, ...updates } as TradeJournalEntry : e,
      ),
    }));
  },

  removeJournalEntry: (id) => {
    set((state) => ({
      journalEntries: state.journalEntries.filter((e) => e.id !== id),
    }));
  },

  setJournalEntries: (entries) => {
    set({ journalEntries: entries });
  },

  updateStats: (stats) => {
    set({ stats });
  },

  reset: () => {
    set({
      currentSignal: null,
      signalHistory: [],
      journalEntries: [],
      stats: DEFAULT_STATS,
      isAnalyzing: false,
      analysisError: null,
    });
  },
}));
