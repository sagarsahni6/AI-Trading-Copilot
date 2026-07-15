// ============================================================
// ChartAnalysis — Technical indicators and pattern detection
// ============================================================

import { motion } from 'framer-motion';
import { LineChart, TrendingUp, TrendingDown, BarChart2, Zap } from 'lucide-react';

/** Mock indicators — replaced by backend data in production */
const MOCK_INDICATORS = {
  ema: { ema9: 24485, ema21: 24460, ema50: 24380, ema200: 24120, crossover: 'BULLISH_CROSS' },
  vwap: 24470,
  rsi: { value: 62.5, zone: 'NEUTRAL', divergence: 'NONE' },
  macd: { macd: 15.2, signal: 8.7, histogram: 6.5, crossover: 'BULLISH' },
  atr: 85,
  adx: { value: 28, plusDI: 32, minusDI: 18, trendStrength: 'MODERATE' },
  supertrend: { value: 24380, direction: 'BULLISH', signal: 'BUY' },
  volumeSpike: false,
  volumeSpikeMultiplier: 1.2,
};

const MOCK_PATTERNS = [
  { pattern: 'BULLISH_ENGULFING', direction: 'BULLISH', reliability: 'HIGH' },
  { pattern: 'ASCENDING_TRIANGLE', direction: 'BULLISH', reliability: 'MODERATE' },
];

const MOCK_ZONES = [
  { type: 'DEMAND', high: 24350, low: 24280, strength: 'STRONG' },
  { type: 'SUPPLY', high: 24780, low: 24820, strength: 'MODERATE' },
];

export function ChartAnalysis() {
  const ind = MOCK_INDICATORS;

  return (
    <div className="space-y-3">
      {/* Indicators Grid */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <LineChart size={14} />
          Technical Indicators
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {/* RSI */}
          <IndicatorBox
            label="RSI (14)"
            value={ind.rsi.value.toFixed(1)}
            subtext={ind.rsi.zone}
            color={
              ind.rsi.value > 70
                ? 'text-bearish'
                : ind.rsi.value < 30
                  ? 'text-bullish'
                  : 'text-white/80'
            }
            gauge={{ value: ind.rsi.value, max: 100 }}
          />

          {/* ADX */}
          <IndicatorBox
            label="ADX"
            value={ind.adx.value.toString()}
            subtext={ind.adx.trendStrength}
            color={ind.adx.value > 25 ? 'text-primary-300' : 'text-white/50'}
            gauge={{ value: ind.adx.value, max: 60 }}
          />

          {/* MACD */}
          <IndicatorBox
            label="MACD"
            value={ind.macd.histogram > 0 ? '+' + ind.macd.histogram.toFixed(1) : ind.macd.histogram.toFixed(1)}
            subtext={ind.macd.crossover}
            color={ind.macd.histogram > 0 ? 'text-bullish' : 'text-bearish'}
          />

          {/* ATR */}
          <IndicatorBox
            label="ATR"
            value={ind.atr.toString()}
            subtext="Volatility"
            color="text-sideways"
          />

          {/* Supertrend */}
          <IndicatorBox
            label="Supertrend"
            value={ind.supertrend.signal}
            subtext={ind.supertrend.value.toString()}
            color={ind.supertrend.direction === 'BULLISH' ? 'text-bullish' : 'text-bearish'}
          />

          {/* VWAP */}
          <IndicatorBox
            label="VWAP"
            value={ind.vwap.toString()}
            subtext="Anchor"
            color="text-primary-300"
          />
        </div>
      </div>

      {/* EMA Alignment */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <TrendingUp size={14} />
          EMA Alignment
        </h3>
        <div className="space-y-1.5">
          <EMARow label="EMA 9" value={ind.ema.ema9} isAbove={ind.ema.ema9 > ind.ema.ema21} />
          <EMARow label="EMA 21" value={ind.ema.ema21} isAbove={ind.ema.ema21 > ind.ema.ema50} />
          <EMARow label="EMA 50" value={ind.ema.ema50} isAbove={ind.ema.ema50 > ind.ema.ema200} />
          <EMARow label="EMA 200" value={ind.ema.ema200} isAbove={true} />
        </div>
        {ind.ema.crossover !== 'NONE' && (
          <div className={`mt-2 rounded-lg px-2 py-1 text-2xs font-medium ${
            ind.ema.crossover === 'BULLISH_CROSS' ? 'bg-bullish/10 text-bullish' : 'bg-bearish/10 text-bearish'
          }`}>
            {ind.ema.crossover === 'BULLISH_CROSS' ? '↑ Bullish EMA Cross' : '↓ Bearish EMA Cross'}
          </div>
        )}
      </div>

      {/* Detected Patterns */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <BarChart2 size={14} />
          Detected Patterns
        </h3>
        {MOCK_PATTERNS.length > 0 ? (
          <div className="space-y-1.5">
            {MOCK_PATTERNS.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface-50 px-2.5 py-1.5"
              >
                <div className="flex items-center gap-2">
                  {p.direction === 'BULLISH' ? (
                    <TrendingUp size={12} className="text-bullish" />
                  ) : (
                    <TrendingDown size={12} className="text-bearish" />
                  )}
                  <span className="text-2xs font-medium text-white/70">
                    {p.pattern.replace(/_/g, ' ')}
                  </span>
                </div>
                <span
                  className={`badge ${
                    p.reliability === 'HIGH'
                      ? 'badge-bullish'
                      : p.reliability === 'MODERATE'
                        ? 'badge-neutral'
                        : 'badge-bearish'
                  }`}
                >
                  {p.reliability}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-2xs text-white/30">No patterns detected</p>
        )}
      </div>

      {/* Supply/Demand Zones */}
      <div className="glass-card">
        <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/60">
          <Zap size={14} />
          Supply & Demand Zones
        </h3>
        <div className="space-y-1.5">
          {MOCK_ZONES.map((zone, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 ${
                zone.type === 'DEMAND' ? 'bg-bullish/5' : 'bg-bearish/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    zone.type === 'DEMAND' ? 'bg-bullish' : 'bg-bearish'
                  }`}
                />
                <span className="text-2xs font-medium text-white/70">
                  {zone.type} Zone
                </span>
              </div>
              <span className="font-mono text-2xs text-white/50">
                {zone.low} — {zone.high}
              </span>
              <span className={`badge ${zone.strength === 'STRONG' ? 'badge-bullish' : 'badge-neutral'}`}>
                {zone.strength}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndicatorBox({
  label,
  value,
  subtext,
  color,
  gauge,
}: {
  label: string;
  value: string;
  subtext: string;
  color: string;
  gauge?: { value: number; max: number };
}) {
  return (
    <div className="rounded-lg bg-surface-50 p-2">
      <span className="text-2xs text-white/35">{label}</span>
      <p className={`font-mono text-sm font-bold ${color}`}>{value}</p>
      <span className="text-2xs text-white/25">{subtext}</span>
      {gauge && (
        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${(gauge.value / gauge.max) * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      )}
    </div>
  );
}

function EMARow({ label, value, isAbove }: { label: string; value: number; isAbove: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-2xs text-white/40">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-white/70">{value}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${isAbove ? 'bg-bullish' : 'bg-bearish'}`} />
      </div>
    </div>
  );
}
