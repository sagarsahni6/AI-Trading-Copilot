// ============================================================
// TradeSignal — Trade recommendation card with levels
// ============================================================

import { motion } from 'framer-motion';
import { Target, ShieldAlert, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useTradeStore } from '../stores/trade-store';
import { formatCurrency } from '@shared/utils/formatters';

export function TradeSignal() {
  const signal = useTradeStore((s) => s.currentSignal);
  const isAnalyzing = useTradeStore((s) => s.isAnalyzing);

  if (isAnalyzing) {
    return (
      <div className="glass-card space-y-3">
        <div className="shimmer h-4 w-24 rounded" />
        <div className="shimmer h-20 w-full rounded" />
        <div className="shimmer h-12 w-full rounded" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="glass-card flex flex-col items-center justify-center py-8 text-center">
        <Target size={28} className="mb-2 text-white/15" />
        <p className="text-sm text-white/40">Waiting for analysis...</p>
        <p className="text-2xs mt-1 text-white/20">
          Connect to backend to receive trade signals
        </p>
        <button
          onClick={() => {
            chrome.runtime.sendMessage({ type: 'REQUEST_ANALYSIS', payload: {} });
          }}
          className="mt-3 rounded-lg bg-primary-600/20 px-4 py-1.5 text-xs font-medium text-primary-300 transition-all hover:bg-primary-600/30"
        >
          Request Analysis
        </button>
      </div>
    );
  }

  const isCallOrPut = signal.direction !== 'NO_TRADE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Target size={14} />
          Trade Recommendation
        </h3>
        <span className={`badge ${signal.trend === 'BULLISH' ? 'badge-bullish' : signal.trend === 'BEARISH' ? 'badge-bearish' : 'badge-neutral'}`}>
          {signal.timeframe}
        </span>
      </div>

      {isCallOrPut ? (
        <>
          {/* Price Levels */}
          <div className="space-y-2">
            {/* Entry */}
            <PriceRow
              label="Entry"
              price={signal.entry}
              icon={<ArrowUpRight size={12} />}
              color="text-primary-300"
              bgColor="bg-primary-500/10"
            />

            {/* Stop Loss */}
            <PriceRow
              label="Stop Loss"
              price={signal.stopLoss}
              icon={<ShieldAlert size={12} />}
              color="text-bearish-light"
              bgColor="bg-bearish/10"
            />

            {/* Targets */}
            <div className="rounded-lg bg-bullish/5 p-2">
              <span className="mb-1.5 flex items-center gap-1 text-2xs font-medium text-bullish-light">
                <TrendingUp size={10} />
                Targets
              </span>
              <div className="grid grid-cols-3 gap-2">
                <TargetBox label="T1" price={signal.target1} />
                <TargetBox label="T2" price={signal.target2} />
                <TargetBox label="T3" price={signal.target3} />
              </div>
            </div>
          </div>

          {/* Risk-Reward */}
          <div className="flex items-center justify-between rounded-lg bg-surface-50 px-3 py-2">
            <span className="text-2xs text-white/40">Risk:Reward</span>
            <span
              className={`font-mono text-sm font-bold ${
                signal.riskReward >= 2
                  ? 'text-bullish'
                  : signal.riskReward >= 1.5
                    ? 'text-sideways'
                    : 'text-bearish'
              }`}
            >
              1 : {signal.riskReward.toFixed(1)}
            </span>
          </div>

          {/* Reasoning */}
          {signal.reasoning && (
            <div className="space-y-2 border-t border-surface-200 pt-2">
              <ReasonItem label="Why Trade" text={signal.reasoning.whyTrade} />
              <ReasonItem label="Expected Move" text={signal.reasoning.expectedMovement} />
              <ReasonItem label="Probability" text={signal.reasoning.probability} />
              {signal.reasoning.alternativeScenario && (
                <ReasonItem label="Alt Scenario" text={signal.reasoning.alternativeScenario} />
              )}
            </div>
          )}
        </>
      ) : (
        /* NO TRADE state */
        <div className="rounded-lg bg-sideways/5 p-4 text-center">
          <span className="text-2xl">⏳</span>
          <p className="mt-1 text-sm font-medium text-sideways">No Trade — Wait</p>
          <p className="mt-1 text-2xs text-white/40">
            {signal.reasoning?.whyNot || 'Insufficient evidence for a trade recommendation'}
          </p>
        </div>
      )}

      {/* Signal Breakdown Mini-bars */}
      {signal.signals && (
        <div className="space-y-1.5 border-t border-surface-200 pt-2">
          <span className="text-2xs font-medium text-white/40">Signal Breakdown</span>
          <SignalBar name="Trend" score={signal.signals.trend?.weightedScore ?? 0} max={25} />
          <SignalBar name="Options" score={signal.signals.optionChain?.weightedScore ?? 0} max={20} />
          <SignalBar name="Volume" score={signal.signals.volume?.weightedScore ?? 0} max={15} />
          <SignalBar name="SMC" score={signal.signals.smc?.weightedScore ?? 0} max={20} />
          <SignalBar name="Indicators" score={signal.signals.indicators?.weightedScore ?? 0} max={10} />
          <SignalBar name="Volatility" score={signal.signals.volatility?.weightedScore ?? 0} max={10} />
        </div>
      )}
    </motion.div>
  );
}

/** Single price level row */
function PriceRow({
  label,
  price,
  icon,
  color,
  bgColor,
}: {
  label: string;
  price: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg ${bgColor} px-3 py-2`}>
      <span className={`flex items-center gap-1.5 text-2xs font-medium ${color}`}>
        {icon}
        {label}
      </span>
      <span className={`font-mono text-sm font-bold ${color}`}>
        {formatCurrency(price, 1)}
      </span>
    </div>
  );
}

/** Target price box */
function TargetBox({ label, price }: { label: string; price: number }) {
  return (
    <div className="text-center">
      <span className="text-2xs text-white/30">{label}</span>
      <p className="font-mono text-xs font-bold text-bullish-light">
        {formatCurrency(price, 1)}
      </p>
    </div>
  );
}

/** Reasoning item */
function ReasonItem({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <span className="text-2xs font-semibold text-white/50">{label}</span>
      <p className="text-2xs leading-relaxed text-white/70">{text}</p>
    </div>
  );
}

/** Signal breakdown bar */
function SignalBar({ name, score, max }: { name: string; score: number; max: number }) {
  const percent = max > 0 ? (score / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 text-right text-2xs text-white/35">{name}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            background:
              percent >= 70
                ? '#10b981'
                : percent >= 40
                  ? '#f59e0b'
                  : '#ef4444',
          }}
        />
      </div>
      <span className="w-8 text-right font-mono text-2xs text-white/40">
        {score.toFixed(0)}/{max}
      </span>
    </div>
  );
}
