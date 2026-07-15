// ============================================================
// Content Script Entry — Injected into Zerodha Kite pages
// ============================================================
// This script runs in the context of kite.zerodha.com and:
// 1. Injects the floating AI sidebar
// 2. Observes DOM mutations for market data extraction
// 3. Handles keyboard shortcuts
// ============================================================

import { KiteObserver } from './kite-observer';
import { SidebarInjector } from './sidebar-injector';
import { KEYBOARD_SHORTCUTS } from '@shared/constants/config';

/** Guard against multiple injections */
if (!(window as any).__AI_TRADING_COPILOT_INJECTED__) {
  (window as any).__AI_TRADING_COPILOT_INJECTED__ = true;

  console.log('[AI Trading Copilot] Content script loaded on Kite');

  // --- Initialize Components ---
  const observer = new KiteObserver();
  const sidebar = new SidebarInjector();

  /**
   * Wait for Kite to fully load before initializing
   */
  function waitForKite(): void {
    // Check for Kite's main app container
    const kiteApp = document.querySelector('.app') || document.querySelector('#app');

    if (kiteApp) {
      console.log('[AI Trading Copilot] Kite app detected, initializing...');
      init();
    } else {
      // Retry after a short delay
      setTimeout(waitForKite, 500);
    }
  }

  /**
   * Initialize the extension within Kite
   */
  function init(): void {
    // Inject the floating sidebar
    sidebar.inject();

    // Start observing the DOM for market data
    observer.start();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Listen for messages from the background service worker
    setupMessageListener();

    console.log('[AI Trading Copilot] Initialization complete ✓');
  }

  /**
   * Setup keyboard shortcuts
   */
  function setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (event) => {
      // Toggle Sidebar: Ctrl+Shift+T
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key === KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR.key
      ) {
        event.preventDefault();
        sidebar.toggle();
      }

      // Refresh Analysis: Ctrl+Shift+R
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.key === KEYBOARD_SHORTCUTS.REFRESH_ANALYSIS.key
      ) {
        event.preventDefault();
        chrome.runtime.sendMessage({ type: 'REQUEST_ANALYSIS', payload: {} });
      }
    });
  }

  /**
   * Listen for messages from background script
   */
  function setupMessageListener(): void {
    chrome.runtime.onMessage.addListener((message) => {
      const msg = message as Record<string, unknown>;

      switch (msg.type) {
        case 'TOGGLE_SIDEBAR':
          sidebar.toggle();
          break;

        case 'KITE_TAB_READY':
          // Re-initialize if needed
          if (!sidebar.isInjected()) {
            init();
          }
          break;

        case 'MARKET_DATA_UPDATE':
        case 'TRADE_SIGNAL_UPDATE':
        case 'OPTION_CHAIN_UPDATE':
        case 'CHART_DATA_UPDATE':
        case 'SMC_DATA_UPDATE':
          // Forward to sidebar iframe
          sidebar.postMessage(msg);
          break;
      }
    });
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForKite);
  } else {
    waitForKite();
  }
}
