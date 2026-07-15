// ============================================================
// Background Service Worker — Chrome Extension Entry Point
// ============================================================
// Handles message routing, alarms, API communication, and
// lifecycle management for the extension.
// ============================================================

import { handleMessage } from './message-handler';
import { setupAlarms, handleAlarm } from './alarm-manager';

// --- Initialization ---

console.log('[AI Trading Copilot] Service Worker starting...');

/**
 * Extension installation / update handler
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log(`[AI Trading Copilot] Installed: ${details.reason}`);

  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.local.set({
      atc_settings: {
        sidebarEnabled: true,
        sidebarPosition: 'right',
        sidebarWidth: 380,
        theme: 'light',
        soundAlerts: true,
        desktopNotifications: true,
        refreshInterval: 1000,
        apiUrl: 'http://localhost:8000',
        wsUrl: 'ws://localhost:8000/ws',
      },
      atc_theme: 'light',
    });

    // Open options page on first install
    chrome.runtime.openOptionsPage();
  }

  // Setup periodic alarms
  setupAlarms();
});

/**
 * Service Worker activation
 */
chrome.runtime.onStartup.addListener(() => {
  console.log('[AI Trading Copilot] Service Worker started');
  setupAlarms();
});

// --- Message Handling ---

/**
 * Listen for messages from content scripts, sidebar, popup, etc.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  return handleMessage(message, sender, sendResponse);
});

/**
 * Handle external messages from the sidebar iframe
 */
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  return handleMessage(message, sender, sendResponse);
});

// --- Alarms ---

chrome.alarms.onAlarm.addListener(handleAlarm);

// --- Tab / Navigation Tracking ---

/**
 * Monitor when user navigates to/from Kite
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('kite.zerodha.com')) {
    console.log(`[AI Trading Copilot] Kite detected on tab ${tabId}`);

    // Notify content script that sidebar should be shown
    chrome.tabs.sendMessage(tabId, {
      type: 'KITE_TAB_READY',
      payload: { tabId },
    }).catch(() => {
      // Content script may not be ready yet, that's ok
    });
  }
});

// --- Connection Keep-Alive ---

/**
 * Keep service worker alive during market hours
 * Manifest V3 service workers can be terminated after 30s of inactivity
 */
const KEEP_ALIVE_INTERVAL = 25000; // 25 seconds

function keepAlive(): void {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;

  // Market hours: 9:00 AM - 3:30 PM IST
  const marketOpen = 9 * 60;       // 540
  const marketClose = 15 * 60 + 30; // 930

  if (time >= marketOpen && time <= marketClose) {
    // During market hours, keep the service worker alive
    setTimeout(keepAlive, KEEP_ALIVE_INTERVAL);
  }
}

// Start keep-alive check
keepAlive();

console.log('[AI Trading Copilot] Service Worker initialized ✓');
