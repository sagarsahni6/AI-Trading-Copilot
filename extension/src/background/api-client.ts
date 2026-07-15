// ============================================================
// API Client — Backend HTTP & WebSocket communication
// ============================================================

import { setConnectionStatus } from './message-handler';

/**
 * API Client for communicating with the FastAPI backend
 * Handles both HTTP requests and WebSocket connections
 */
class APIClient {
  private baseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = 'http://localhost:8000';
    this.wsUrl = 'ws://localhost:8000/ws';
    this.loadSettings();
  }

  /**
   * Load API settings from chrome.storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['atc_settings', 'atc_auth_token']);
      const settings = result.atc_settings as Record<string, string> | undefined;

      if (settings?.apiUrl) this.baseUrl = settings.apiUrl;
      if (settings?.wsUrl) this.wsUrl = settings.wsUrl;
      if (result.atc_auth_token) this.authToken = result.atc_auth_token as string;
    } catch {
      // Use defaults
    }
  }

  /** Get current base URL */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // --- HTTP Methods ---

  /**
   * Make an authenticated HTTP request to the backend
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const { timeout = 10000, ...fetchOptions } = options;

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Request AI analysis for current market data
   */
  async requestAnalysis(payload: unknown): Promise<unknown> {
    return this.request('/api/analysis', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: 60000, // 60s timeout for LLM inference + structured JSON generation
    });
  }

  /**
   * Send chat message to AI
   */
  async sendChatMessage(payload: unknown): Promise<unknown> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
      timeout: 60000, // 60s timeout for LLM chat response
    });
  }

  /**
   * Fetch trade journal entries
   */
  async getJournalEntries(): Promise<unknown> {
    return this.request('/api/journal');
  }

  /**
   * Save trade journal entry
   */
  async saveJournalEntry(entry: unknown): Promise<unknown> {
    return this.request('/api/journal', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }

  // --- WebSocket ---

  /**
   * Connect to backend WebSocket for real-time data
   */
  connectWebSocket(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      const url = this.authToken
        ? `${this.wsUrl}?token=${this.authToken}`
        : this.wsUrl;

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[API Client] WebSocket connected');
        this.reconnectAttempts = 0;
        setConnectionStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          this.handleWSMessage(data);
        } catch {
          console.warn('[API Client] Failed to parse WS message');
        }
      };

      this.ws.onclose = () => {
        console.log('[API Client] WebSocket disconnected');
        setConnectionStatus(false);
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[API Client] WebSocket error:', error);
        setConnectionStatus(false);
      };
    } catch (error) {
      console.error('[API Client] Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Send market data over WebSocket
   */
  sendMarketData(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'MARKET_DATA',
        payload: data,
      }));
    }
  }

  /**
   * Handle incoming WebSocket messages from backend
   */
  private handleWSMessage(data: Record<string, unknown>): void {
    const type = data.type as string;

    // Forward to relevant extension contexts
    switch (type) {
      case 'TRADE_SIGNAL':
      case 'OPTION_CHAIN_UPDATE':
      case 'CHART_UPDATE':
      case 'SMC_UPDATE':
      case 'ALERT':
        // Broadcast to all Kite tabs
        chrome.tabs.query({ url: '*://kite.zerodha.com/*' }, (tabs) => {
          for (const tab of tabs) {
            if (tab.id) {
              chrome.tabs.sendMessage(tab.id, data).catch(() => {});
            }
          }
        });
        break;

      default:
        console.log(`[API Client] WS message: ${type}`);
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[API Client] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `[API Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
    );

    setTimeout(() => this.connectWebSocket(), delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      setConnectionStatus(false);
    }
  }
}

/** Singleton API client instance */
export const apiClient = new APIClient();
