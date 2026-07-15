// ============================================================
// OptionChainPanel — Live option chain with OI, PCR, Max Pain
// ============================================================

import { useState } from 'react';
import { Activity, Gauge } from 'lucide-react';
import { formatCompact, formatNumber } from '@shared/utils/formatters';

/** Mock data — will be replaced by backend WebSocket data */
const MOCK_METRICS = {
  pcr: 1.25,
  maxPain: 24500,
  totalCallOI: 12500000,
  totalPutOI: 15625000,
  support: 24200,
  resistance: 24800,
  gammaExposure: 250000000,
  callOIChange: -450000,
  putOIChange: 780000,
};

const MOCK_STRIKES = [
  { strike: 24200, callOI: 2100000, putOI: 850000, callOIChg: -120000, putOIChg: 45000, callIV: 14.2, putIV: 15.8, callLTP: 285, putLTP: 12 },
  { strike: 24300, callOI: 1800000, putOI: 1200000, callOIChg: -85000, putOIChg: 120000, callIV: 12.8, putIV: 14.5, callLTP: 195, putLTP: 22 },
  { strike: 24400, callOI: 1500000, putOI: 1650000, callOIChg: 45000, putOIChg: 200000, callIV: 11.5, putIV: 13.2, callLTP: 120, putLTP: 48 },
  { strike: 24500, callOI: 3200000, putOI: 2800000, callOIChg: 320000, putOIChg: -150000, callIV: 10.8, putIV: 12.1, callLTP: 68, putLTP: 95 },
  { strike: 24600, callOI: 2400000, putOI: 1900000, callOIChg: 180000, putOIChg: -80000, callIV: 12.2, putIV: 11.5, callLTP: 32, putLTP: 160 },
  { strike: 24700, callOI: 1900000, putOI: 1100000, callOIChg: 95000, putOIChg: -45000, callIV: 13.8, putIV: 10.8, callLTP: 15, putLTP: 240 },
  { strike: 24800, callOI: 2800000, putOI: 700000, callOIChg: 250000, putOIChg: -25000, callIV: 15.5, putIV: 10.2, callLTP: 6, putLTP: 330 },
];

export function OptionChainPanel() {
  const [view, setView] = useState<'chain' | 'analysis'>('chain');
  const metrics = MOCK_METRICS;

  return (
    <div className="space-y-3">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="PCR"
          value={metrics.pcr.toFixed(2)}
          color={metrics.pcr > 1 ? 'text-bullish' : 'text-bearish'}
          subtext={metrics.pcr > 1 ? 'Bullish bias' : 'Bearish bias'}
        />
        <MetricCard
          label="Max Pain"
          value={formatNumber(metrics.maxPain, 0)}
          color="text-primary-300"
          subtext="Strike"
        />
        <MetricCard
          label="Support (Put OI)"
          value={formatNumber(metrics.support, 0)}
          color="text-bullish"
          subtext={formatCompact(metrics.totalPutOI) + ' OI'}
        />
        <MetricCard
          label="Resistance (Call OI)"
          value={formatNumber(metrics.resistance, 0)}
          color="text-bearish"
          subtext={formatCompact(metrics.totalCallOI) + ' OI'}
        />
      </div>

      {/* OI Change Summary */}
      <div className="glass-card">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-2xs font-semibold text-white/50">OI Change</span>
          <span className="badge-info">
            <Gauge size={10} />
            GEX: {formatCompact(metrics.gammaExposure)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-2xs text-white/40">Call OI Chg</span>
            <p className={`font-mono text-sm font-bold ${metrics.callOIChange < 0 ? 'text-bearish' : 'text-bullish'}`}>
              {metrics.callOIChange >= 0 ? '+' : ''}{formatCompact(metrics.callOIChange)}
            </p>
          </div>
          <div>
            <span className="text-2xs text-white/40">Put OI Chg</span>
            <p className={`font-mono text-sm font-bold ${metrics.putOIChange > 0 ? 'text-bullish' : 'text-bearish'}`}>
              {metrics.putOIChange >= 0 ? '+' : ''}{formatCompact(metrics.putOIChange)}
            </p>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 rounded-lg bg-surface-50 p-0.5">
        <button
          onClick={() => setView('chain')}
          className={`flex-1 rounded-md px-3 py-1.5 text-2xs font-medium transition-all ${
            view === 'chain' ? 'bg-primary-600/30 text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          Option Chain
        </button>
        <button
          onClick={() => setView('analysis')}
          className={`flex-1 rounded-md px-3 py-1.5 text-2xs font-medium transition-all ${
            view === 'analysis' ? 'bg-primary-600/30 text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          OI Analysis
        </button>
      </div>

      {/* Option Chain Table */}
      {view === 'chain' && (
        <div className="overflow-x-auto rounded-lg border border-surface-200">
          <table className="w-full text-2xs">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50">
                <th className="px-2 py-1.5 text-right text-white/40">Call OI</th>
                <th className="px-2 py-1.5 text-right text-white/40">Chg</th>
                <th className="px-2 py-1.5 text-right text-white/40">IV</th>
                <th className="px-2 py-1.5 text-right text-white/40">LTP</th>
                <th className="px-2 py-1.5 text-center font-bold text-primary-300">Strike</th>
                <th className="px-2 py-1.5 text-left text-white/40">LTP</th>
                <th className="px-2 py-1.5 text-left text-white/40">IV</th>
                <th className="px-2 py-1.5 text-left text-white/40">Chg</th>
                <th className="px-2 py-1.5 text-left text-white/40">Put OI</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_STRIKES.map((row) => {
                const isATM = row.strike === 24500;
                return (
                  <tr
                    key={row.strike}
                    className={`border-b border-surface-100 transition-colors hover:bg-surface-100 ${
                      isATM ? 'bg-primary-500/5' : ''
                    }`}
                  >
                    <td className="px-2 py-1.5 text-right font-mono text-white/60">
                      {formatCompact(row.callOI)}
                    </td>
                    <td className={`px-2 py-1.5 text-right font-mono ${row.callOIChg >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {row.callOIChg >= 0 ? '+' : ''}{formatCompact(row.callOIChg)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-white/40">
                      {row.callIV.toFixed(1)}
                    </td>
                    <td className="px-2 py-1.5 text-right font-mono text-white/70">
                      {row.callLTP}
                    </td>
                    <td className={`px-2 py-1.5 text-center font-mono font-bold ${isATM ? 'text-primary-300' : 'text-white/80'}`}>
                      {row.strike}
                    </td>
                    <td className="px-2 py-1.5 text-left font-mono text-white/70">
                      {row.putLTP}
                    </td>
                    <td className="px-2 py-1.5 text-left font-mono text-white/40">
                      {row.putIV.toFixed(1)}
                    </td>
                    <td className={`px-2 py-1.5 text-left font-mono ${row.putOIChg >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                      {row.putOIChg >= 0 ? '+' : ''}{formatCompact(row.putOIChg)}
                    </td>
                    <td className="px-2 py-1.5 text-left font-mono text-white/60">
                      {formatCompact(row.putOI)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* OI Analysis View */}
      {view === 'analysis' && (
        <div className="space-y-2">
          <ActivityCard
            label="Short Build Up"
            description="Price falling with rising OI — bearish pressure increasing"
            color="text-bearish"
            bgColor="bg-bearish/5"
          />
          <ActivityCard
            label="Put Writing at 24200"
            description="Heavy put OI addition at support — suggests 24200 will hold"
            color="text-bullish"
            bgColor="bg-bullish/5"
          />
          <ActivityCard
            label="Call Writing at 24800"
            description="Resistance strengthening — 24800 acting as strong ceiling"
            color="text-bearish"
            bgColor="bg-bearish/5"
          />
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  subtext,
}: {
  label: string;
  value: string;
  color: string;
  subtext: string;
}) {
  return (
    <div className="glass-card">
      <span className="text-2xs text-white/35">{label}</span>
      <p className={`font-mono text-lg font-bold ${color}`}>{value}</p>
      <span className="text-2xs text-white/25">{subtext}</span>
    </div>
  );
}

function ActivityCard({
  label,
  description,
  color,
  bgColor,
}: {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl border border-surface-200 ${bgColor} p-3`}>
      <div className="flex items-center gap-2">
        <Activity size={12} className={color} />
        <span className={`text-xs font-semibold ${color}`}>{label}</span>
      </div>
      <p className="mt-1 text-2xs text-white/50">{description}</p>
    </div>
  );
}
