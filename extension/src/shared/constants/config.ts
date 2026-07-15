// ============================================================
// Application Configuration Constants
// ============================================================

/** Backend API configuration */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/** Data refresh intervals (milliseconds) */
export const REFRESH_INTERVALS = {
  MARKET_DATA: 1000,       // 1 second — real-time ticks
  OPTION_CHAIN: 2000,      // 2 seconds — OI/volume updates
  CHART_ANALYSIS: 3000,    // 3 seconds — indicator recalculation
  SMC_ANALYSIS: 5000,      // 5 seconds — structure analysis
  AI_ANALYSIS: 10000,      // 10 seconds — AI re-evaluation
  DASHBOARD: 30000,        // 30 seconds — stats refresh
} as const;

/** Debounce delays (milliseconds) */
export const DEBOUNCE = {
  DOM_OBSERVER: 250,       // Debounce Kite DOM mutations
  SEARCH: 300,             // Search input debounce
  RESIZE: 150,             // Sidebar resize debounce
  SCROLL: 100,             // Scroll handler debounce
} as const;

/** Sidebar dimensions */
export const SIDEBAR_CONFIG = {
  DEFAULT_WIDTH: 380,
  MIN_WIDTH: 320,
  MAX_WIDTH: 600,
  HEADER_HEIGHT: 48,
  COLLAPSED_WIDTH: 48,
} as const;

/** Storage keys for chrome.storage */
export const STORAGE_KEYS = {
  SETTINGS: 'atc_settings',
  THEME: 'atc_theme',
  SIDEBAR_POSITION: 'atc_sidebar_position',
  SIDEBAR_WIDTH: 'atc_sidebar_width',
  WATCHLIST: 'atc_watchlist',
  JOURNAL: 'atc_journal',
  AUTH_TOKEN: 'atc_auth_token',
} as const;

/** Keyboard shortcuts */
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: { key: 'T', ctrlKey: true, shiftKey: true },
  REFRESH_ANALYSIS: { key: 'R', ctrlKey: true, shiftKey: true },
  TOGGLE_CHAT: { key: 'C', ctrlKey: true, shiftKey: true },
  QUICK_ANALYSIS: { key: 'A', ctrlKey: true, shiftKey: true },
} as const;

/** Alert sound files */
export const ALERT_SOUNDS = {
  TRADE_SIGNAL: 'assets/sounds/trade-signal.mp3',
  WARNING: 'assets/sounds/warning.mp3',
  NOTIFICATION: 'assets/sounds/notification.mp3',
} as const;
