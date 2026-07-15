// ============================================================
// MarketStatus — Live market header with trend, momentum, VIX
// ============================================================

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { useMarketStore } from '../stores/market-store';
import {
  formatCurrency,
  formatPercent,
  formatTime,
  getTrendColor,
} from '@shared/utils/formatters';

export function MarketStatus() {
  const status = useMarketStore((s) => s.status);
  const lastUpdated = useMarketStore((s) => s.lastUpdated);

  const trendIcon =
    status.trend === 'BULLISH' ? (
      <TrendingUp size={14} />
    ) : status.trend === 'BEARISH' ? (
      <TrendingDown size={14} />
    ) : (
      <Minus size={14} />
    );

  const trendColor = getTrendColor(status.trend);
  const changeColor =
    status.dayChangePercent >= 0 ? 'text-bullish' : 'text-bearish';

  const getPulseDotClass = () => {
    switch (status.trend) {
      case 'BULLISH':
        return 'pulse-dot-bullish';
      case 'BEARISH':
        return 'pulse-dot-bearish';
      default:
        return 'pulse-dot-sideways';
    }
  };

  return (
    <div className="border-b border-surface-200 bg-dark-50/50 px-3 py-2.5">
      {/* Top row: Price + Change */}
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={getPulseDotClass()} />
          <span className="text-lg font-bold tracking-tight text-white">
            {status.spotPrice > 0
              ? formatCurrency(status.spotPrice, 1)
              : '—'}
          </span>
          <motion.span
            key={status.dayChangePercent}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xs font-semibold ${changeColor}`}
          >
            {status.dayChange !== 0
              ? `${status.dayChange >= 0 ? '+' : ''}${status.dayChange.toFixed(1)} (${formatPercent(status.dayChangePercent)})`
              : ''}
          </motion.span>
        </div>

        {/* Session badge */}
        <span className="badge-info text-2xs">
          {status.session === 'OPEN' ? '● LIVE' : status.session}
        </span>
      </div>

      {/* Bottom row: Trend, Momentum, Volatility, VIX */}
      <div className="flex items-center gap-3 text-2xs">
        {/* Trend */}
        <div className="flex items-center gap-1">
          <span className="text-white/40">Trend</span>
          <span className={`flex items-center gap-0.5 font-semibold ${trendColor}`}>
            {trendIcon}
            {status.trend}
          </span>
        </div>

        {/* Divider */}
        <span className="text-white/10">│</span>

        {/* Momentum */}
        <div className="flex items-center gap-1">
          <span className="text-white/40">Mom</span>
          <span className="font-medium text-white/70">{status.momentum}</span>
        </div>

        <span className="text-white/10">│</span>

        {/* Volatility */}
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-sideways" />
          <span className="font-medium text-white/70">{status.volatility}</span>
        </div>

        <span className="text-white/10">│</span>

        {/* VIX */}
        <div className="flex items-center gap-1">
          <span className="text-white/40">VIX</span>
          <span
            className={`font-mono font-semibold ${
              status.vix > 20
                ? 'text-bearish'
                : status.vix > 15
                  ? 'text-sideways'
                  : 'text-bullish'
            }`}
          >
            {status.vix > 0 ? status.vix.toFixed(1) : '—'}
          </span>
        </div>

        {/* Last updated */}
        <span className="ml-auto text-white/20">
          {lastUpdated > 0 ? formatTime(lastUpdated) : ''}
        </span>
      </div>
    </div>
  );
}
