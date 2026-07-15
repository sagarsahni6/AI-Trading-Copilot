// ============================================================
// Dashboard — Trade performance analytics & statistics
// ============================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  Flame,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { useTradeStore } from '../stores/trade-store';
import { formatCurrency } from '@shared/utils/formatters';

/** Time filter options */
type TimeFilter = 'today' | 'week' | 'month' | 'all';

export function Dashboard() {
  const stats = useTradeStore((s) => s.stats);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades) * 100 : 0;
  const lossRate = stats.totalTrades > 0 ? (stats.losses / stats.totalTrades) * 100 : 0;
  const beRate = stats.totalTrades > 0 ? (stats.breakeven / stats.totalTrades) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Header with time filter */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <LayoutDashboard size={14} />
          Performance Dashboard
        </h3>
        <div className="flex gap-0.5 rounded-lg bg-surface-50 p-0.5">
          {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`rounded-md px-2 py-1 text-2xs font-medium transition-all ${
                timeFilter === f
                  ? 'bg-primary-600/30 text-white'
                  : 'text-white/30 hover:text-white/50'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* P&L Card */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card-accent p-4 ${
          stats.totalPnl >= 0 ? 'border-bullish/20' : 'border-bearish/20'
        }`}
      >
        <span className="text-2xs text-white/40">Total P&L</span>
        <div className="flex items-end gap-3">
          <span
            className={`text-3xl font-extrabold tracking-tight ${
              stats.totalPnl >= 0 ? 'text-bullish' : 'text-bearish'
            }`}
          >
            {stats.totalPnl >= 0 ? '+' : ''}
            {formatCurrency(stats.totalPnl, 0)}
          </span>
          {stats.totalTrades > 0 && (
            <span
              className={`mb-1 text-xs font-semibold ${
                stats.totalPnl >= 0 ? 'text-bullish/70' : 'text-bearish/70'
              }`}
            >
              {stats.totalPnl >= 0 ? (
                <TrendingUp size={14} className="inline" />
              ) : (
                <TrendingDown size={14} className="inline" />
              )}
            </span>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Total Trades"
          value={stats.totalTrades.toString()}
          icon={<Target size={12} />}
          color="text-primary-300"
        />
        <StatCard
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          icon={<Trophy size={12} />}
          color={winRate >= 60 ? 'text-bullish' : winRate >= 40 ? 'text-sideways' : 'text-bearish'}
        />
        <StatCard
          label="Avg R:R"
          value={stats.averageRR.toFixed(1)}
          icon={<BarChart3 size={12} />}
          color={stats.averageRR >= 2 ? 'text-bullish' : 'text-sideways'}
        />
      </div>

      {/* Win/Loss/BE Distribution */}
      <div className="glass-card">
        <h4 className="mb-2 text-2xs font-semibold text-white/40">Trade Distribution</h4>

        {stats.totalTrades > 0 ? (
          <>
            {/* Visual bar */}
            <div className="mb-2 flex h-3 overflow-hidden rounded-full">
              <motion.div
                className="bg-bullish"
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                className="bg-sideways"
                initial={{ width: 0 }}
                animate={{ width: `${beRate}%` }}
                transition={{ duration: 0.8, delay: 0.1 }}
              />
              <motion.div
                className="bg-bearish"
                initial={{ width: 0 }}
                animate={{ width: `${lossRate}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>

            {/* Legend */}
            <div className="flex justify-between text-2xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-bullish" />
                <span className="text-white/50">Wins {stats.wins}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-sideways" />
                <span className="text-white/50">BE {stats.breakeven}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-bearish" />
                <span className="text-white/50">Losses {stats.losses}</span>
              </span>
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-2xs text-white/20">No trades recorded yet</p>
        )}
      </div>

      {/* Streak & Best/Worst */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card">
          <div className="flex items-center gap-1.5">
            <Flame size={12} className="text-sideways" />
            <span className="text-2xs text-white/40">Current Streak</span>
          </div>
          <p className={`mt-1 text-xl font-bold ${stats.currentStreak >= 0 ? 'text-bullish' : 'text-bearish'}`}>
            {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
          </p>
          <span className="text-2xs text-white/20">Max: {stats.maxStreak}</span>
        </div>

        <div className="glass-card">
          <div className="flex items-center gap-1.5">
            <PieChart size={12} className="text-primary-400" />
            <span className="text-2xs text-white/40">Avg Score</span>
          </div>
          <p className="mt-1 text-xl font-bold text-primary-300">
            {stats.averageScore.toFixed(0)}
          </p>
          <span className="text-2xs text-white/20">/ 100</span>
        </div>
      </div>

      {/* Best & Worst Trade */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-bullish/15 bg-bullish/5 p-3">
          <span className="text-2xs text-white/40">Best Trade</span>
          <p className="font-mono text-sm font-bold text-bullish">
            {stats.bestTrade > 0 ? `+${formatCurrency(stats.bestTrade, 0)}` : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-bearish/15 bg-bearish/5 p-3">
          <span className="text-2xs text-white/40">Worst Trade</span>
          <p className="font-mono text-sm font-bold text-bearish">
            {stats.worstTrade < 0 ? formatCurrency(stats.worstTrade, 0) : '—'}
          </p>
        </div>
      </div>

      {/* Equity Curve Placeholder */}
      <div className="glass-card">
        <h4 className="mb-2 text-2xs font-semibold text-white/40">Equity Curve</h4>
        <div className="flex h-24 items-end gap-0.5">
          {generateMockEquityCurve().map((val, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-t ${val >= 0 ? 'bg-bullish/40' : 'bg-bearish/40'}`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.abs(val)}%` }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-2xs text-white/15">
          <span>Start</span>
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="glass-card text-center">
      <div className="mx-auto mb-1 flex items-center justify-center gap-1 text-white/30">
        {icon}
      </div>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <span className="text-2xs text-white/30">{label}</span>
    </div>
  );
}

/** Generate mock equity curve bars for placeholder */
function generateMockEquityCurve(): number[] {
  const bars: number[] = [];
  let cumulative = 0;
  for (let i = 0; i < 30; i++) {
    const change = (Math.random() - 0.45) * 20; // Slight bullish bias
    cumulative += change;
    bars.push(Math.max(5, Math.min(100, 50 + cumulative)));
  }
  return bars;
}
