// ============================================================
// Utility Functions — Formatting, calculations, helpers
// ============================================================

import type { ConfidenceLevel, TradeDirection, TrendDirection } from '../types';
import { CONFIDENCE_THRESHOLDS } from '../constants/weights';

/**
 * Format a number as Indian currency (₹)
 */
export function formatCurrency(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number with Indian number system grouping
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a large number with K/L/Cr suffix (Indian system)
 */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_00_00_000) return `${sign}${(abs / 1_00_00_000).toFixed(2)}Cr`;
  if (abs >= 1_00_000) return `${sign}${(abs / 1_00_000).toFixed(2)}L`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

/**
 * Format percentage with sign
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number | string): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get confidence level from score
 */
export function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= CONFIDENCE_THRESHOLDS.VERY_HIGH) return 'VERY_HIGH';
  if (score >= CONFIDENCE_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= CONFIDENCE_THRESHOLDS.MODERATE) return 'MODERATE';
  if (score >= CONFIDENCE_THRESHOLDS.LOW) return 'LOW';
  return 'VERY_LOW';
}

/**
 * Get color class for trend direction
 */
export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'BULLISH':
      return 'text-bullish';
    case 'BEARISH':
      return 'text-bearish';
    case 'SIDEWAYS':
      return 'text-sideways';
  }
}

/**
 * Get background color class for trend
 */
export function getTrendBgColor(trend: TrendDirection): string {
  switch (trend) {
    case 'BULLISH':
      return 'bg-bullish/20';
    case 'BEARISH':
      return 'bg-bearish/20';
    case 'SIDEWAYS':
      return 'bg-sideways/20';
  }
}

/**
 * Get color class for trade direction
 */
export function getDirectionColor(direction: TradeDirection): string {
  switch (direction) {
    case 'CALL':
      return 'text-bullish';
    case 'PUT':
      return 'text-bearish';
    case 'NO_TRADE':
      return 'text-sideways';
  }
}

/**
 * Get emoji for trade direction
 */
export function getDirectionEmoji(direction: TradeDirection): string {
  switch (direction) {
    case 'CALL':
      return '🟢';
    case 'PUT':
      return '🔴';
    case 'NO_TRADE':
      return '🟡';
  }
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Calculate risk-reward ratio
 */
export function calculateRiskReward(
  entry: number,
  stopLoss: number,
  target: number,
): number {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(target - entry);
  return risk === 0 ? 0 : Number((reward / risk).toFixed(2));
}
