// ============================================================
// Kite Observer — MutationObserver for Kite DOM data extraction
// ============================================================

import { debounce, throttle } from '@shared/utils/formatters';
import { DEBOUNCE } from '@shared/constants/config';

/**
 * Observes the Zerodha Kite DOM for market data changes
 * and extracts relevant information for analysis
 */
export class KiteObserver {
  private observer: MutationObserver | null = null;
  private isObserving = false;

  /**
   * Start observing the Kite DOM
   */
  start(): void {
    if (this.isObserving) return;

    this.observer = new MutationObserver(
      throttle(this.handleMutations.bind(this), DEBOUNCE.DOM_OBSERVER),
    );

    // Observe the main Kite app container
    const targetNode = document.querySelector('.app') || document.body;

    this.observer.observe(targetNode, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['class', 'data-value'],
    });

    this.isObserving = true;
    console.log('[Kite Observer] Started observing DOM');

    // Initial data extraction
    this.extractAllData();
  }

  /**
   * Stop observing
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
      console.log('[Kite Observer] Stopped observing');
    }
  }

  /**
   * Handle DOM mutations — debounced
   */
  private handleMutations(mutations: MutationRecord[]): void {
    let hasRelevantChange = false;

    for (const mutation of mutations) {
      // Check if the mutation is in a relevant part of the DOM
      const target = mutation.target as HTMLElement;
      if (this.isRelevantNode(target)) {
        hasRelevantChange = true;
        break;
      }
    }

    if (hasRelevantChange) {
      this.debouncedExtract();
    }
  }

  /**
   * Check if a DOM node contains market-relevant data
   */
  private isRelevantNode(node: HTMLElement): boolean {
    if (!node.className || typeof node.className !== 'string') return false;

    const relevantSelectors = [
      'market-depth',     // Market depth panel
      'option-chain',     // Option chain table
      'chart-container',  // Chart area
      'instrument-widget',// Instrument widget
      'price',            // Price elements
      'change',           // Price change
      'quantity',         // Volume/quantity
      'oi',               // Open Interest
      'ltp',              // Last Traded Price
      'order-window',     // Order window
    ];

    return relevantSelectors.some(
      (sel) => node.className.includes(sel) || node.id?.includes(sel),
    );
  }

  /**
   * Debounced full data extraction
   */
  private debouncedExtract = debounce(() => {
    this.extractAllData();
  }, DEBOUNCE.DOM_OBSERVER);

  /**
   * Extract all available market data from the Kite DOM
   */
  private extractAllData(): void {
    const data: Record<string, unknown> = {};

    // Extract current instrument info
    data.instrument = this.extractInstrumentInfo();

    // Extract price data
    data.price = this.extractPriceData();

    // Extract market depth if visible
    data.marketDepth = this.extractMarketDepth();

    // Only send if we got meaningful data
    if (data.instrument || data.price) {
      chrome.runtime.sendMessage({
        type: 'MARKET_DATA_UPDATE',
        payload: {
          source: 'DOM',
          timestamp: Date.now(),
          data,
        },
      }).catch(() => {
        // Extension context may not be ready
      });
    }
  }

  /**
   * Extract current instrument information from Kite header
   */
  private extractInstrumentInfo(): Record<string, unknown> | null {
    try {
      // Kite shows the current instrument in the instrument widget
      const instrumentEl = document.querySelector(
        '.instrument-widget .tradingsymbol, .su-head-title',
      );

      if (instrumentEl) {
        return {
          symbol: instrumentEl.textContent?.trim() || '',
        };
      }
    } catch {
      // DOM structure may have changed
    }
    return null;
  }

  /**
   * Extract price data from visible elements
   */
  private extractPriceData(): Record<string, unknown> | null {
    try {
      const priceEl = document.querySelector('.last-price, .price');
      const changeEl = document.querySelector('.change, .price-change');

      if (priceEl) {
        const priceText = priceEl.textContent?.trim().replace(/,/g, '') || '0';
        const changeText = changeEl?.textContent?.trim().replace(/[,%()]/g, '') || '0';

        return {
          lastPrice: parseFloat(priceText),
          change: parseFloat(changeText),
        };
      }
    } catch {
      // DOM structure may have changed
    }
    return null;
  }

  /**
   * Extract market depth data if the depth panel is visible
   */
  private extractMarketDepth(): Record<string, unknown> | null {
    try {
      const depthTable = document.querySelector('.market-depth, .depth-table');
      if (!depthTable) return null;

      const bids: Array<{ price: number; qty: number; orders: number }> = [];
      const asks: Array<{ price: number; qty: number; orders: number }> = [];

      // Extract bid rows
      const bidRows = depthTable.querySelectorAll('.bid, .buy-depth');
      bidRows.forEach((row) => {
        const cells = row.querySelectorAll('td, span');
        if (cells.length >= 3) {
          bids.push({
            qty: parseInt(cells[0]?.textContent?.replace(/,/g, '') || '0', 10),
            price: parseFloat(cells[1]?.textContent?.replace(/,/g, '') || '0'),
            orders: parseInt(cells[2]?.textContent?.replace(/,/g, '') || '0', 10),
          });
        }
      });

      // Extract ask rows
      const askRows = depthTable.querySelectorAll('.ask, .sell-depth');
      askRows.forEach((row) => {
        const cells = row.querySelectorAll('td, span');
        if (cells.length >= 3) {
          asks.push({
            qty: parseInt(cells[0]?.textContent?.replace(/,/g, '') || '0', 10),
            price: parseFloat(cells[1]?.textContent?.replace(/,/g, '') || '0'),
            orders: parseInt(cells[2]?.textContent?.replace(/,/g, '') || '0', 10),
          });
        }
      });

      return { bids, asks };
    } catch {
      return null;
    }
  }
}
