// ============================================================
// TradeScore — Animated circular score gauge (0-100)
// ============================================================

import { motion } from 'framer-motion';
import { useTradeStore } from '../stores/trade-store';
import { getConfidenceLevel, getDirectionColor, getDirectionEmoji } from '@shared/utils/formatters';
import { MIN_TRADE_SCORE } from '@shared/constants/weights';

export function TradeScore() {
  const signal = useTradeStore((s) => s.currentSignal);
  const isAnalyzing = useTradeStore((s) => s.isAnalyzing);

  const score = signal?.score ?? 0;
  const direction = signal?.direction ?? 'NO_TRADE';
  const confidence = getConfidenceLevel(score);

  // SVG circle math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  // Score color
  const getScoreColor = () => {
    if (score >= 80) return '#10b981'; // bullish green
    if (score >= 60) return '#f59e0b'; // sideways amber
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // bearish red
  };

  const scoreColor = getScoreColor();

  return (
    <div className="glass-card-accent">
      <div className="flex items-center gap-4">
        {/* Circular Score Gauge */}
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Score arc */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
              style={{
                filter: `drop-shadow(0 0 8px ${scoreColor}40)`,
              }}
            />
            {/* Glow effect */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              transform="rotate(-90 50 50)"
              opacity={0.3}
              style={{
                filter: `blur(4px)`,
              }}
            />
          </svg>

          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isAnalyzing ? (
              <div className="shimmer h-8 w-12 rounded" />
            ) : (
              <>
                <motion.span
                  key={score}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-2xl font-extrabold"
                  style={{ color: scoreColor }}
                >
                  {score}
                </motion.span>
                <span className="text-2xs text-white/30">SCORE</span>
              </>
            )}
          </div>
        </div>

        {/* Signal Details */}
        <div className="flex-1">
          {/* Direction Badge */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">
              {getDirectionEmoji(direction)}
            </span>
            <span
              className={`text-xl font-extrabold tracking-tight ${getDirectionColor(direction)}`}
            >
              {direction}
            </span>
          </div>

          {/* Confidence */}
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-2xs text-white/40">Confidence</span>
            <span
              className={`badge ${
                confidence === 'VERY_HIGH' || confidence === 'HIGH'
                  ? 'badge-bullish'
                  : confidence === 'MODERATE'
                    ? 'badge-neutral'
                    : 'badge-bearish'
              }`}
            >
              {confidence.replace('_', ' ')}
            </span>
          </div>

          {/* Threshold indicator */}
          <div className="flex items-center gap-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ background: scoreColor }}
              />
            </div>
            <span className="text-2xs text-white/25">{MIN_TRADE_SCORE}</span>
          </div>
          <p className="mt-1 text-2xs text-white/30">
            {score >= MIN_TRADE_SCORE
              ? '✓ Score above threshold — trade recommended'
              : '⏳ Score below threshold — wait for better setup'}
          </p>
        </div>
      </div>
    </div>
  );
}
