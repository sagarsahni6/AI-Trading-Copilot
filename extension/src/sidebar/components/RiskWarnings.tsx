// ============================================================
// RiskWarnings — Display risk warnings and reasons not to trade
// ============================================================

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldX, Info } from 'lucide-react';
import { useTradeStore } from '../stores/trade-store';

export function RiskWarnings() {
  const signal = useTradeStore((s) => s.currentSignal);

  const warnings = signal?.warnings ?? [];
  const notToTrade = signal?.notToTradeReasons ?? [];

  if (warnings.length === 0 && notToTrade.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Reasons NOT to trade */}
      {notToTrade.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-bearish/20 bg-bearish/5 p-3"
        >
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-bearish-light">
            <ShieldX size={14} />
            Reasons NOT to Trade
          </h4>
          <ul className="space-y-1">
            {notToTrade.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-2xs text-white/60">
                <span className="mt-0.5 text-bearish">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Risk Warnings */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-sideways/20 bg-sideways/5 p-3"
        >
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-sideways-light">
            <AlertTriangle size={14} />
            Risk Warnings
          </h4>
          <ul className="space-y-1">
            {warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 text-2xs text-white/60">
                <span className="mt-0.5 text-sideways">⚠</span>
                {warning}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-1.5 rounded-lg bg-surface-50 px-2 py-1.5">
        <Info size={10} className="mt-0.5 flex-shrink-0 text-white/20" />
        <p className="text-2xs leading-relaxed text-white/20">
          This is AI-generated analysis for educational purposes only. Never trade based solely on
          these signals. Always conduct your own research and manage your own risk.
        </p>
      </div>
    </div>
  );
}
