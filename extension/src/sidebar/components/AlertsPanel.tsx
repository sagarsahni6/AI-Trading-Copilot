// ============================================================
// AlertsPanel — Trade alerts and notification management
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, VolumeX, Trash2, Check } from 'lucide-react';

interface Alert {
  id: string;
  type: 'TRADE_SIGNAL' | 'SCORE_CHANGE' | 'OI_SHIFT' | 'BREAKOUT' | 'CUSTOM';
  title: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: number;
  read: boolean;
}

/** Mock alerts for UI */
const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'TRADE_SIGNAL',
    title: 'New CALL Signal',
    message: 'Score 85 — NIFTY showing strong bullish BOS with volume confirmation',
    priority: 'HIGH',
    timestamp: Date.now() - 120000,
    read: false,
  },
  {
    id: '2',
    type: 'OI_SHIFT',
    title: 'Put Writing Detected',
    message: 'Heavy put OI addition at 24200 — support strengthening',
    priority: 'MEDIUM',
    timestamp: Date.now() - 300000,
    read: false,
  },
  {
    id: '3',
    type: 'BREAKOUT',
    title: 'Breakout Alert',
    message: 'NIFTY broke above 24500 resistance with 2x volume spike',
    priority: 'HIGH',
    timestamp: Date.now() - 600000,
    read: true,
  },
  {
    id: '4',
    type: 'SCORE_CHANGE',
    title: 'Score Drop',
    message: 'Trade score dropped from 82 to 65 — conditions weakening',
    priority: 'MEDIUM',
    timestamp: Date.now() - 900000,
    read: true,
  },
];

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const clearAll = () => {
    setAlerts([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-bearish/30 bg-bearish/5';
      case 'MEDIUM':
        return 'border-sideways/30 bg-sideways/5';
      default:
        return 'border-surface-200 bg-surface-50';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'TRADE_SIGNAL':
        return '🎯';
      case 'OI_SHIFT':
        return '📊';
      case 'BREAKOUT':
        return '🚀';
      case 'SCORE_CHANGE':
        return '📉';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
            <Bell size={14} />
            Alerts
          </h3>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bearish px-1 text-2xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`rounded-md p-1.5 text-white/30 transition-colors hover:text-white/50 ${soundEnabled ? '' : 'text-bearish/50'}`}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`rounded-md p-1.5 text-white/30 transition-colors hover:text-white/50 ${notificationsEnabled ? '' : 'text-bearish/50'}`}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell size={12} /> : <BellOff size={12} />}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="rounded-md p-1.5 text-white/30 transition-colors hover:text-white/50"
              title="Mark all read"
            >
              <Check size={12} />
            </button>
          )}
          <button
            onClick={clearAll}
            className="rounded-md p-1.5 text-white/30 transition-colors hover:text-bearish/50"
            title="Clear all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <AnimatePresence>
        {alerts.length > 0 ? (
          <div className="space-y-1.5">
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                onClick={() => markRead(alert.id)}
                className={`cursor-pointer rounded-xl border p-2.5 transition-all ${getPriorityColor(alert.priority)} ${
                  !alert.read ? 'ring-1 ring-primary-500/20' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-sm">{getTypeEmoji(alert.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/80">{alert.title}</span>
                      <span className="text-2xs text-white/25">{formatTimeAgo(alert.timestamp)}</span>
                    </div>
                    <p className="mt-0.5 text-2xs leading-relaxed text-white/50">{alert.message}</p>
                  </div>
                  {!alert.read && (
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass-card py-8 text-center">
            <Bell size={24} className="mx-auto mb-2 text-white/10" />
            <p className="text-sm text-white/30">No alerts yet</p>
            <p className="text-2xs mt-1 text-white/15">
              Alerts will appear here when trade signals are detected
            </p>
          </div>
        )}
      </AnimatePresence>

      {/* Alert Settings */}
      <div className="glass-card">
        <h4 className="mb-2 text-2xs font-semibold text-white/40">Alert Triggers</h4>
        <div className="space-y-1.5">
          <AlertToggle label="Trade Signals (Score > 80)" enabled />
          <AlertToggle label="Score Changes (±10)" enabled />
          <AlertToggle label="OI Shifts" enabled />
          <AlertToggle label="Breakouts / Breakdowns" enabled />
          <AlertToggle label="Structure Breaks (BOS/CHOCH)" enabled={false} />
        </div>
      </div>
    </div>
  );
}

function AlertToggle({ label, enabled: initialEnabled }: { label: string; enabled: boolean }) {
  const [enabled, setEnabled] = useState(initialEnabled);

  return (
    <div className="flex items-center justify-between">
      <span className="text-2xs text-white/50">{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative h-4 w-7 rounded-full transition-colors ${
          enabled ? 'bg-primary-500' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${
            enabled ? 'left-3.5' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
