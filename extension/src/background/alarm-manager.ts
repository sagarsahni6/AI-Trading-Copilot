// ============================================================
// Alarm Manager — Periodic tasks via chrome.alarms API
// ============================================================

/**
 * Setup all periodic alarms
 * Chrome alarms have a minimum period of 1 minute in Manifest V3
 */
export function setupAlarms(): void {
  // Health check — verify backend connectivity every 5 minutes
  chrome.alarms.create('health-check', {
    periodInMinutes: 5,
  });

  // Market hours check — determine if market is open
  chrome.alarms.create('market-hours', {
    periodInMinutes: 1,
  });

  // Data cleanup — purge old cached data every hour
  chrome.alarms.create('data-cleanup', {
    periodInMinutes: 60,
  });

  console.log('[Alarm Manager] Alarms configured');
}

/**
 * Handle fired alarms
 */
export function handleAlarm(alarm: chrome.alarms.Alarm): void {
  console.log(`[Alarm Manager] Alarm fired: ${alarm.name}`);

  switch (alarm.name) {
    case 'health-check':
      performHealthCheck();
      break;

    case 'market-hours':
      checkMarketHours();
      break;

    case 'data-cleanup':
      cleanupOldData();
      break;

    default:
      console.warn(`[Alarm Manager] Unknown alarm: ${alarm.name}`);
  }
}

/**
 * Check backend connectivity
 */
async function performHealthCheck(): Promise<void> {
  try {
    const settings = await chrome.storage.local.get('atc_settings');
    const apiUrl = (settings.atc_settings as Record<string, string>)?.apiUrl || 'http://localhost:8000';

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const connected = response.ok;
    chrome.storage.local.set({ atc_backend_connected: connected });

    if (!connected) {
      console.warn('[Health Check] Backend not responding');
    }
  } catch {
    chrome.storage.local.set({ atc_backend_connected: false });
    console.warn('[Health Check] Backend unreachable');
  }
}

/**
 * Check if current time is within market hours (IST)
 */
function checkMarketHours(): void {
  const now = new Date();

  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = (utcMinutes + istOffset) % (24 * 60);

  const marketOpen = 9 * 60 + 15;   // 9:15 AM IST
  const marketClose = 15 * 60 + 30;  // 3:30 PM IST

  const day = now.getDay(); // 0=Sun, 6=Sat
  const isWeekday = day >= 1 && day <= 5;
  const isMarketHours = isWeekday && istMinutes >= marketOpen && istMinutes <= marketClose;

  chrome.storage.local.set({
    atc_market_open: isMarketHours,
    atc_market_check_time: now.toISOString(),
  });
}

/**
 * Cleanup old cached data to prevent storage bloat
 */
async function cleanupOldData(): Promise<void> {
  try {
    const storage = await chrome.storage.local.get(null);
    const keysToRemove: string[] = [];

    // Remove any temporary data older than 24 hours
    for (const [key, value] of Object.entries(storage)) {
      if (key.startsWith('atc_cache_')) {
        const cacheEntry = value as { timestamp?: number };
        if (cacheEntry.timestamp && Date.now() - cacheEntry.timestamp > 24 * 60 * 60 * 1000) {
          keysToRemove.push(key);
        }
      }
    }

    if (keysToRemove.length > 0) {
      await chrome.storage.local.remove(keysToRemove);
      console.log(`[Data Cleanup] Removed ${keysToRemove.length} stale cache entries`);
    }
  } catch (error) {
    console.error('[Data Cleanup] Failed:', error);
  }
}
