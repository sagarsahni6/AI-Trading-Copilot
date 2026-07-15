// ============================================================
// Options Page — Extension settings & API configuration
// ============================================================

import { useState, useEffect } from 'react';
import './options.css';

interface Settings {
  apiUrl: string;
  wsUrl: string;
  refreshInterval: number;
  soundAlerts: boolean;
  desktopNotifications: boolean;
  autoAnalysis: boolean;
  selectedSymbol: string;
  selectedTimeframe: string;
}

const DEFAULT_SETTINGS: Settings = {
  apiUrl: 'http://localhost:8000',
  wsUrl: 'ws://localhost:8000/ws',
  refreshInterval: 1000,
  soundAlerts: true,
  desktopNotifications: true,
  autoAnalysis: true,
  selectedSymbol: 'NIFTY',
  selectedTimeframe: '5m',
};

export default function Options() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('atc_settings', (result) => {
      if (result.atc_settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.atc_settings as Partial<Settings> });
      }
    });
  }, []);

  const handleSave = () => {
    chrome.storage.local.set({ atc_settings: settings }, () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Notify background
      chrome.runtime.sendMessage({ type: 'SETTINGS_UPDATE', payload: settings });
    });
  };

  const update = (key: keyof Settings, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="options-page">
      <div className="options-container">
        {/* Header */}
        <div className="options-header">
          <span className="options-logo">⚡</span>
          <h1 className="options-title">AI Trading Copilot Settings</h1>
        </div>

        {/* API Configuration */}
        <section className="options-section">
          <h2 className="options-section-title">🔌 Backend Connection</h2>
          <div className="options-field">
            <label>API URL</label>
            <input
              type="text"
              value={settings.apiUrl}
              onChange={(e) => update('apiUrl', e.target.value)}
              placeholder="http://localhost:8000"
            />
          </div>
          <div className="options-field">
            <label>WebSocket URL</label>
            <input
              type="text"
              value={settings.wsUrl}
              onChange={(e) => update('wsUrl', e.target.value)}
              placeholder="ws://localhost:8000/ws"
            />
          </div>
        </section>

        {/* Trading Preferences */}
        <section className="options-section">
          <h2 className="options-section-title">📊 Trading Preferences</h2>
          <div className="options-field">
            <label>Default Symbol</label>
            <select
              value={settings.selectedSymbol}
              onChange={(e) => update('selectedSymbol', e.target.value)}
            >
              <option value="NIFTY">NIFTY 50</option>
              <option value="BANKNIFTY">BANK NIFTY</option>
              <option value="FINNIFTY">FIN NIFTY</option>
              <option value="MIDCPNIFTY">MIDCAP NIFTY</option>
            </select>
          </div>
          <div className="options-field">
            <label>Default Timeframe</label>
            <select
              value={settings.selectedTimeframe}
              onChange={(e) => update('selectedTimeframe', e.target.value)}
            >
              <option value="1m">1 Minute</option>
              <option value="3m">3 Minutes</option>
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
            </select>
          </div>
          <div className="options-field">
            <label>Refresh Interval (ms)</label>
            <input
              type="number"
              value={settings.refreshInterval}
              onChange={(e) => update('refreshInterval', parseInt(e.target.value) || 1000)}
              min={500}
              max={10000}
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="options-section">
          <h2 className="options-section-title">🔔 Notifications</h2>
          <div className="options-toggle-row">
            <span>Sound Alerts</span>
            <ToggleSwitch
              checked={settings.soundAlerts}
              onChange={(v) => update('soundAlerts', v)}
            />
          </div>
          <div className="options-toggle-row">
            <span>Desktop Notifications</span>
            <ToggleSwitch
              checked={settings.desktopNotifications}
              onChange={(v) => update('desktopNotifications', v)}
            />
          </div>
          <div className="options-toggle-row">
            <span>Auto-Analysis</span>
            <ToggleSwitch
              checked={settings.autoAnalysis}
              onChange={(v) => update('autoAnalysis', v)}
            />
          </div>
        </section>

        {/* Save */}
        <div className="options-actions">
          <button className="options-save-btn" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="options-disclaimer">
          AI Trading Copilot is a decision-support system. It never places or executes trades.
          Always conduct your own research before trading.
        </p>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`options-toggle ${checked ? 'active' : ''}`}
    >
      <span className="options-toggle-knob" />
    </button>
  );
}
