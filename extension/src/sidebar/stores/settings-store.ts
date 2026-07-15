// ============================================================
// Settings Store — Zustand store for user preferences
// ============================================================

import { create } from 'zustand';

export interface AppSettings {
  theme: 'dark' | 'light';
  sidebarPosition: 'left' | 'right';
  soundAlerts: boolean;
  desktopNotifications: boolean;
  refreshInterval: number;
  apiUrl: string;
  wsUrl: string;
  selectedSymbol: string;
  selectedExpiry: string;
  selectedTimeframe: string;
  autoAnalysis: boolean;
}

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;

  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  sidebarPosition: 'right',
  soundAlerts: true,
  desktopNotifications: true,
  refreshInterval: 1000,
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000/ws',
  selectedSymbol: 'NIFTY',
  selectedExpiry: '',
  selectedTimeframe: '5m',
  autoAnalysis: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    // Persist to chrome.storage
    get().saveSettings();
  },

  loadSettings: async () => {
    try {
      const result = await chrome.storage.local.get('atc_settings');
      if (result.atc_settings) {
        set({
          settings: { ...DEFAULT_SETTINGS, ...(result.atc_settings as Partial<AppSettings>) },
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  saveSettings: async () => {
    try {
      const { settings } = get();
      await chrome.storage.local.set({ atc_settings: settings });
      // Notify background script
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATE',
        payload: settings,
      }).catch(() => {});
    } catch {
      // Storage may not be available in all contexts
    }
  },
}));
