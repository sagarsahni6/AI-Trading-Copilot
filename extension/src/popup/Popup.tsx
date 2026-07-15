// ============================================================
// Popup — Extension toolbar popup with quick status & actions
// ============================================================

import { useState, useEffect } from 'react';
import './popup.css';

export default function Popup() {
  const [connected, setConnected] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    // Check connection status
    chrome.runtime.sendMessage({ type: 'CHECK_CONNECTION' }, (response) => {
      if (response) {
        setConnected((response as { connected: boolean }).connected);
      }
    });

    // Check market hours
    chrome.storage.local.get('atc_market_open', (result) => {
      setMarketOpen(result.atc_market_open === true);
    });
  }, []);

  const openKite = () => {
    chrome.tabs.create({ url: 'https://kite.zerodha.com/' });
  };

  const toggleSidebar = () => {
    chrome.runtime.sendMessage({ type: 'TOGGLE_SIDEBAR' });
  };

  const openSettings = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="popup-container">
      {/* Header */}
      <div className="popup-header">
        <div className="popup-logo">
          <span className="popup-logo-icon">⚡</span>
          <span className="popup-logo-text">AI Trading Copilot</span>
        </div>
        <span className="popup-version">v1.0.0</span>
      </div>

      {/* Status */}
      <div className="popup-status">
        <div className="popup-status-row">
          <span className="popup-status-label">Backend</span>
          <span className={`popup-status-dot ${connected ? 'connected' : 'disconnected'}`} />
          <span className="popup-status-value">{connected ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="popup-status-row">
          <span className="popup-status-label">Market</span>
          <span className={`popup-status-dot ${marketOpen ? 'connected' : 'disconnected'}`} />
          <span className="popup-status-value">{marketOpen ? 'Open' : 'Closed'}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="popup-actions">
        <button className="popup-btn popup-btn-primary" onClick={openKite}>
          Open Kite
        </button>
        <button className="popup-btn popup-btn-secondary" onClick={toggleSidebar}>
          Toggle Sidebar
        </button>
        <button className="popup-btn popup-btn-ghost" onClick={openSettings}>
          ⚙ Settings
        </button>
      </div>

      {/* Footer */}
      <div className="popup-footer">
        <p>Decision support only. Never executes trades.</p>
      </div>
    </div>
  );
}
