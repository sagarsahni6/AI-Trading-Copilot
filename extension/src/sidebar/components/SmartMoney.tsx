// ============================================================
// SmartMoney — Smart Money Concepts analysis panel
// ============================================================

import { motion } from 'framer-motion';
import { Brain, ArrowUpRight, ArrowDownRight, Square, Layers, Droplets } from 'lucide-react';

/** Mock SMC data — replaced by backend analysis */
const MOCK_SMC = {
  marketStructure: {
    trend: 'BULLISH' as const,
    higherHighs: true,
    higherLows: true,
    lowerHighs: false,
    lowerLows: false,
  },
  priceZone: 'DISCOUNT' as const,
  institutionalBias: 'BULLISH' as const,
  structureBreaks: [
    { type: 'BOS', direction: 'BULLISH', price: 24520, confirmed: true, significance: 'HIGH' },
    { type: 'CHOCH', direction: 'BEARISH', price: 24380, confirmed: false, significance: 'MODERATE' },
  ],
  orderBlocks: [
    { type: 'ORDER_BLOCK', direction: 'BULLISH', high: 24420, low: 24380, mitigated: false, strength: 'STRONG' },
    { type: 'BREAKER_BLOCK', direction: 'BEARISH', high: 24780, low: 24750, mitigated: false, strength: 'MODERATE' },
  ],
  fairValueGaps: [
    { direction: 'BULLISH', high: 24480, low: 24440, filled: false, fillPercent: 30 },
    { direction: 'BEARISH', high: 24700, low: 24680, filled: true, fillPercent: 100 },
  ],
  liquidityLevels: [
    { type: 'EQUAL_LOW', price: 24250, swept: false, strength: 'HIGH' },
    { type: 'EQUAL_HIGH', price: 24750, swept: false, strength: 'MODERATE' },
    { type: 'SWING_LOW', price: 24180, swept: false, strength: 'HIGH' },
  ],
};

export function SmartMoney() {
  const smc = MOCK_SMC;

  return (
    <div className="space-y-3">
      {/* Market Structure Overview */}
      <div className="glass-card-accent">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Brain size={14} />
          Market Structure
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <span className="text-2xs text-white/35">Structure</span>
            <p className={`text-sm font-bold ${smc.marketStructure.trend === 'BULLISH' ? 'text-bullish' : 'text-bearish'}`}>
              {smc.marketStructure.trend}
            </p>
          </div>
          <div className="text-center">
            <span className="text-2xs text-white/35">Zone</span>
            <p className={`text-sm font-bold ${smc.priceZone === 'DISCOUNT' ? 'text-bullish' : smc.priceZone === 'PREMIUM' ? 'text-bearish' : 'text-sideways'}`}>
              {smc.priceZone}
            </p>
          </div>
          <div className="text-center">
            <span className="text-2xs text-white/35">Inst. Bias</span>
            <p className={`text-sm font-bold ${smc.institutionalBias === 'BULLISH' ? 'text-bullish' : 'text-bearish'}`}>
              {smc.institutionalBias}
            </p>
          </div>
        </div>

        {/* HH/HL or LH/LL indicators */}
        <div className="mt-2 flex gap-2">
          <StructureTag label="HH" active={smc.marketStructure.higherHighs} positive />
          <StructureTag label="HL" active={smc.marketStructure.higherLows} positive />
          <StructureTag label="LH" active={smc.marketStructure.lowerHighs} positive={false} />
          <StructureTag label="LL" active={smc.marketStructure.lowerLows} positive={false} />
        </div>
      </div>

      {/* Structure Breaks (BOS / CHOCH) */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <ArrowUpRight size={14} />
          Structure Breaks
        </h3>
        <div className="space-y-1.5">
          {smc.structureBreaks.map((sb, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between rounded-lg bg-surface-50 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                {sb.direction === 'BULLISH' ? (
                  <ArrowUpRight size={12} className="text-bullish" />
                ) : (
                  <ArrowDownRight size={12} className="text-bearish" />
                )}
                <span className={`text-xs font-bold ${sb.direction === 'BULLISH' ? 'text-bullish' : 'text-bearish'}`}>
                  {sb.type}
                </span>
                <span className="font-mono text-2xs text-white/50">@ {sb.price}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {sb.confirmed && (
                  <span className="badge-bullish">✓ Confirmed</span>
                )}
                <span className={`badge ${sb.significance === 'HIGH' ? 'badge-bullish' : 'badge-neutral'}`}>
                  {sb.significance}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Blocks */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Square size={14} />
          Order Blocks
        </h3>
        <div className="space-y-1.5">
          {smc.orderBlocks.map((ob, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                ob.direction === 'BULLISH' ? 'bg-bullish/5' : 'bg-bearish/5'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-sm ${ob.direction === 'BULLISH' ? 'bg-bullish' : 'bg-bearish'}`} />
                  <span className="text-2xs font-medium text-white/70">
                    {ob.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="font-mono text-2xs text-white/40">
                  {ob.low} — {ob.high}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {ob.mitigated && <span className="badge-neutral">Mitigated</span>}
                <span className={`badge ${ob.strength === 'STRONG' ? 'badge-bullish' : 'badge-neutral'}`}>
                  {ob.strength}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fair Value Gaps */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Layers size={14} />
          Fair Value Gaps
        </h3>
        <div className="space-y-1.5">
          {smc.fairValueGaps.map((fvg, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-surface-50 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${fvg.direction === 'BULLISH' ? 'bg-bullish' : 'bg-bearish'}`} />
                <span className="font-mono text-2xs text-white/50">
                  {fvg.low} — {fvg.high}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-12 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${fvg.filled ? 'bg-white/20' : 'bg-primary-500'}`}
                    style={{ width: `${fvg.fillPercent}%` }}
                  />
                </div>
                <span className="text-2xs text-white/30">{fvg.fillPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liquidity Levels */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Droplets size={14} />
          Liquidity Levels
        </h3>
        <div className="space-y-1.5">
          {smc.liquidityLevels.map((liq, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-surface-50 px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xs font-medium text-white/70">
                  {liq.type.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-2xs text-white/50">@ {liq.price}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {liq.swept ? (
                  <span className="badge-bearish">Swept ✕</span>
                ) : (
                  <span className="badge-info">Resting</span>
                )}
                <span className={`badge ${liq.strength === 'HIGH' ? 'badge-bullish' : 'badge-neutral'}`}>
                  {liq.strength}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StructureTag({ label, active, positive }: { label: string; active: boolean; positive: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-2xs font-bold ${
        active
          ? positive
            ? 'bg-bullish/15 text-bullish'
            : 'bg-bearish/15 text-bearish'
          : 'bg-white/5 text-white/20'
      }`}
    >
      {label}
    </span>
  );
}
