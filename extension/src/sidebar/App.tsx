// ============================================================
// App.tsx — Main Sidebar Application Shell
// ============================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Activity,
  LineChart,
  Brain,
  MessageSquare,
  LayoutDashboard,
  Bell,
  Settings,
  BookOpen,
} from 'lucide-react';
import { MarketStatus } from './components/MarketStatus';
import { TradeSignal } from './components/TradeSignal';
import { TradeScore } from './components/TradeScore';
import { OptionChainPanel } from './components/OptionChainPanel';
import { ChartAnalysis } from './components/ChartAnalysis';
import { SmartMoney } from './components/SmartMoney';
import { AIChat } from './components/AIChat';
import { AlertsPanel } from './components/AlertsPanel';
import { RiskWarnings } from './components/RiskWarnings';
import { Dashboard } from './components/Dashboard';
import { TradeJournal } from './components/TradeJournal';
import { useMarketStore } from './stores/market-store';
import { useSettingsStore } from './stores/settings-store';

/** Available tab views */
type TabId = 'signals' | 'options' | 'chart' | 'smc' | 'chat' | 'dashboard' | 'journal' | 'alerts';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'signals', label: 'Signals', icon: <Activity size={16} /> },
  { id: 'options', label: 'Options', icon: <BarChart3 size={16} /> },
  { id: 'chart', label: 'Chart', icon: <LineChart size={16} /> },
  { id: 'smc', label: 'SMC', icon: <Brain size={16} /> },
  { id: 'chat', label: 'AI Chat', icon: <MessageSquare size={16} /> },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('signals');
  const isConnected = useMarketStore((s) => s.isConnected);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const theme = useSettingsStore((s) => s.settings.theme);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Apply theme class to documentElement
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Listen for messages from content script (parent window)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data as Record<string, unknown>;
      if (!data?.type) return;

      switch (data.type) {
        case 'MARKET_DATA_UPDATE':
          useMarketStore.getState().updateTick(data.payload as never);
          break;
        case 'TRADE_SIGNAL_UPDATE':
          // Handled by trade store
          break;
        case 'CONNECTION_STATUS': {
          const payload = data.payload as { connected: boolean };
          useMarketStore.getState().setConnected(payload.connected);
          break;
        }
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-dark">
      {/* Market Status Header */}
      <MarketStatus />

      {/* Tab Navigation */}
      <nav className="flex items-center gap-0.5 border-b border-surface-200 px-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'tab-active text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}

        {/* Connection indicator */}
        <div className="ml-auto flex items-center gap-1.5 pr-1">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isConnected ? 'bg-bullish shadow-glow-bullish' : 'bg-bearish shadow-glow-bearish'
            }`}
          />
          <span className="text-2xs text-white/30">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-3"
          >
            {activeTab === 'signals' && (
              <div className="flex flex-col gap-3">
                <TradeScore />
                <TradeSignal />
                <RiskWarnings />
              </div>
            )}
            {activeTab === 'options' && <OptionChainPanel />}
            {activeTab === 'chart' && <ChartAnalysis />}
            {activeTab === 'smc' && <SmartMoney />}
            {activeTab === 'chat' && <AIChat />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'journal' && <TradeJournal />}
            {activeTab === 'alerts' && <AlertsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Status Bar */}
      <footer className="flex items-center justify-between border-t border-surface-200 px-3 py-1.5">
        <span className="text-2xs text-white/25">AI Trading Copilot v1.0</span>
        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="text-white/25 transition-colors hover:text-white/50"
        >
          <Settings size={12} />
        </button>
      </footer>
    </div>
  );
}
