// ============================================================
// Message Handler — Routes messages between extension contexts
// ============================================================

import type { ExtensionMessage } from '@shared/types';
import { apiClient } from './api-client';

/** Active WebSocket connection state */
let wsConnected = false;

/**
 * Central message handler for all extension inter-context communication
 *
 * Returns `true` if the response will be sent asynchronously
 */
export function handleMessage(
  message: ExtensionMessage | Record<string, unknown>,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): boolean {
  const msg = message as Record<string, unknown>;
  const type = msg.type as string;

  console.log(`[Message Handler] Received: ${type} from ${sender.tab?.id ?? 'extension'}`);

  switch (type) {
    // --- Market Data from Content Script ---
    case 'MARKET_DATA_UPDATE':
      handleMarketDataUpdate(msg.payload);
      return false;

    // --- Request analysis from sidebar ---
    case 'REQUEST_ANALYSIS':
      handleAnalysisRequest(msg.payload, sendResponse);
      return true; // Async response

    // --- AI Chat from sidebar ---
    case 'AI_CHAT_REQUEST':
      handleAIChatRequest(msg.payload, sendResponse);
      return true;

    // --- Connection status check ---
    case 'CHECK_CONNECTION':
      sendResponse({
        connected: wsConnected,
        backendUrl: apiClient.getBaseUrl(),
      });
      return false;

    // --- Settings update ---
    case 'SETTINGS_UPDATE':
      handleSettingsUpdate(msg.payload);
      sendResponse({ success: true });
      return false;

    // --- Get current state ---
    case 'GET_STATE':
      handleGetState(sendResponse);
      return true;

    // --- Toggle sidebar visibility ---
    case 'TOGGLE_SIDEBAR':
      broadcastToKiteTabs({ type: 'TOGGLE_SIDEBAR', payload: {} });
      return false;

    default:
      console.warn(`[Message Handler] Unknown message type: ${type}`);
      return false;
  }
}

/**
 * Forward market data updates to all interested contexts
 */
function handleMarketDataUpdate(payload: unknown): void {
  // Forward to sidebar via broadcast
  broadcastToKiteTabs({
    type: 'MARKET_DATA_UPDATE',
    payload,
  });

  // Also send to backend if WebSocket is connected
  if (wsConnected) {
    apiClient.sendMarketData(payload);
  }
}

/**
 * Request AI analysis from backend
 */
async function handleAnalysisRequest(
  payload: unknown,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  try {
    const result = await apiClient.requestAnalysis(payload);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[Message Handler] Analysis request failed:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Handle AI chat request — streams response back
 */
async function handleAIChatRequest(
  payload: unknown,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  try {
    const result = await apiClient.sendChatMessage(payload);
    sendResponse({ success: true, data: result });
  } catch (error) {
    console.error('[Message Handler] Chat request failed:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Update settings in storage and notify all contexts
 */
function handleSettingsUpdate(payload: unknown): void {
  const settings = payload as Record<string, unknown>;
  chrome.storage.local.get('atc_settings', (result) => {
    const current = (result.atc_settings as Record<string, unknown>) || {};
    const updated = { ...current, ...settings };
    chrome.storage.local.set({ atc_settings: updated });
  });
}

/**
 * Get current state from storage
 */
async function handleGetState(sendResponse: (response: unknown) => void): Promise<void> {
  try {
    const result = await chrome.storage.local.get(null);
    sendResponse({ success: true, data: result });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

/**
 * Broadcast a message to all Kite tabs
 */
function broadcastToKiteTabs(message: Record<string, unknown>): void {
  chrome.tabs.query({ url: '*://kite.zerodha.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab may not have content script, ignore
        });
      }
    }
  });
}

/**
 * Update WebSocket connection status
 */
export function setConnectionStatus(connected: boolean): void {
  wsConnected = connected;
}
