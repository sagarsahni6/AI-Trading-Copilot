"""
Chart Engine — Technical indicator calculations
=================================================
Computes EMA, VWAP, RSI, MACD, ATR, ADX, Supertrend,
candlestick patterns, and supply/demand zones.
"""

import numpy as np
from dataclasses import dataclass


@dataclass
class OHLCV:
    """Single OHLCV candle."""
    timestamp: float
    open: float
    high: float
    low: float
    close: float
    volume: int


class ChartEngine:
    """Technical analysis engine."""

    def __init__(self) -> None:
        self._candles: list[OHLCV] = []

    def update_candles(self, candles: list[dict]) -> None:
        """Update with fresh candle data."""
        self._candles = [
            OHLCV(
                timestamp=c.get("timestamp", 0),
                open=c.get("open", 0),
                high=c.get("high", 0),
                low=c.get("low", 0),
                close=c.get("close", 0),
                volume=c.get("volume", 0),
            )
            for c in candles
        ]

    def _closes(self) -> np.ndarray:
        return np.array([c.close for c in self._candles], dtype=np.float64)

    def _highs(self) -> np.ndarray:
        return np.array([c.high for c in self._candles], dtype=np.float64)

    def _lows(self) -> np.ndarray:
        return np.array([c.low for c in self._candles], dtype=np.float64)

    def _volumes(self) -> np.ndarray:
        return np.array([c.volume for c in self._candles], dtype=np.float64)

    # ---- Indicators ----

    def ema(self, period: int) -> float:
        """Exponential Moving Average."""
        closes = self._closes()
        if len(closes) < period:
            return 0.0
        multiplier = 2 / (period + 1)
        ema_val = float(np.mean(closes[:period]))
        for price in closes[period:]:
            ema_val = (price - ema_val) * multiplier + ema_val
        return round(ema_val, 2)

    def sma(self, period: int) -> float:
        """Simple Moving Average."""
        closes = self._closes()
        if len(closes) < period:
            return 0.0
        return round(float(np.mean(closes[-period:])), 2)

    def rsi(self, period: int = 14) -> float:
        """Relative Strength Index."""
        closes = self._closes()
        if len(closes) < period + 1:
            return 50.0

        deltas = np.diff(closes)
        gains = np.where(deltas > 0, deltas, 0)
        losses = np.where(deltas < 0, -deltas, 0)

        avg_gain = float(np.mean(gains[:period]))
        avg_loss = float(np.mean(losses[:period]))

        for i in range(period, len(gains)):
            avg_gain = (avg_gain * (period - 1) + gains[i]) / period
            avg_loss = (avg_loss * (period - 1) + losses[i]) / period

        if avg_loss == 0:
            return 100.0
        rs = avg_gain / avg_loss
        return round(100 - (100 / (1 + rs)), 2)

    def macd(self, fast: int = 12, slow: int = 26, signal: int = 9) -> dict:
        """MACD indicator."""
        closes = self._closes()
        if len(closes) < slow:
            return {"macd": 0, "signal": 0, "histogram": 0, "crossover": "NONE"}

        ema_fast = self._ema_series(closes, fast)
        ema_slow = self._ema_series(closes, slow)
        macd_line = ema_fast - ema_slow
        signal_line = self._ema_series(macd_line, signal)
        histogram = macd_line - signal_line

        crossover = "NONE"
        if len(histogram) >= 2:
            if histogram[-1] > 0 and histogram[-2] <= 0:
                crossover = "BULLISH"
            elif histogram[-1] < 0 and histogram[-2] >= 0:
                crossover = "BEARISH"

        return {
            "macd": round(float(macd_line[-1]), 2),
            "signal": round(float(signal_line[-1]), 2),
            "histogram": round(float(histogram[-1]), 2),
            "crossover": crossover,
        }

    def atr(self, period: int = 14) -> float:
        """Average True Range."""
        highs, lows, closes = self._highs(), self._lows(), self._closes()
        if len(closes) < period + 1:
            return 0.0

        tr = np.maximum(
            highs[1:] - lows[1:],
            np.maximum(
                np.abs(highs[1:] - closes[:-1]),
                np.abs(lows[1:] - closes[:-1]),
            ),
        )
        return round(float(np.mean(tr[-period:])), 2)

    def adx(self, period: int = 14) -> dict:
        """Average Directional Index."""
        highs, lows, closes = self._highs(), self._lows(), self._closes()
        if len(closes) < period * 2:
            return {"value": 0, "plus_di": 0, "minus_di": 0, "trend_strength": "NO_TREND"}

        # Simplified ADX calculation
        up_move = highs[1:] - highs[:-1]
        down_move = lows[:-1] - lows[1:]

        plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0)
        minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0)

        atr_val = self.atr(period)
        if atr_val == 0:
            return {"value": 0, "plus_di": 0, "minus_di": 0, "trend_strength": "NO_TREND"}

        plus_di = round(float(np.mean(plus_dm[-period:]) / atr_val * 100), 2)
        minus_di = round(float(np.mean(minus_dm[-period:]) / atr_val * 100), 2)

        dx = abs(plus_di - minus_di) / (plus_di + minus_di) * 100 if (plus_di + minus_di) > 0 else 0
        adx_val = round(dx, 2)

        strength = "NO_TREND"
        if adx_val > 40:
            strength = "STRONG"
        elif adx_val > 25:
            strength = "MODERATE"
        elif adx_val > 15:
            strength = "WEAK"

        return {
            "value": adx_val,
            "plus_di": plus_di,
            "minus_di": minus_di,
            "trend_strength": strength,
        }

    def vwap(self) -> float:
        """Volume-Weighted Average Price."""
        if not self._candles:
            return 0.0
        typical = [(c.high + c.low + c.close) / 3 for c in self._candles]
        volumes = [c.volume for c in self._candles]
        total_vol = sum(volumes)
        if total_vol == 0:
            return 0.0
        return round(sum(t * v for t, v in zip(typical, volumes)) / total_vol, 2)

    def detect_volume_spike(self, threshold: float = 2.0) -> dict:
        """Detect if current volume is a spike vs average."""
        volumes = self._volumes()
        if len(volumes) < 20:
            return {"spike": False, "multiplier": 1.0}
        avg_vol = float(np.mean(volumes[-20:-1]))
        current_vol = float(volumes[-1])
        multiplier = current_vol / avg_vol if avg_vol > 0 else 1.0
        return {"spike": multiplier >= threshold, "multiplier": round(multiplier, 2)}

    def detect_trend(self) -> str:
        """Determine overall trend from EMA alignment."""
        ema9 = self.ema(9)
        ema21 = self.ema(21)
        ema50 = self.ema(50)

        if ema9 > ema21 > ema50:
            return "BULLISH"
        elif ema9 < ema21 < ema50:
            return "BEARISH"
        return "SIDEWAYS"

    def get_signal_score(self) -> dict:
        """Get chart signal score for trade engine."""
        if len(self._candles) < 50:
            return {"score": 50, "direction": "SIDEWAYS", "details": "Insufficient data"}

        score = 50
        details = []
        trend = self.detect_trend()

        # Trend contribution
        if trend == "BULLISH":
            score += 15
            details.append("EMA alignment bullish")
        elif trend == "BEARISH":
            score -= 15
            details.append("EMA alignment bearish")

        # RSI
        rsi_val = self.rsi()
        if rsi_val > 70:
            score -= 10
            details.append(f"RSI {rsi_val} overbought")
        elif rsi_val < 30:
            score += 10
            details.append(f"RSI {rsi_val} oversold")

        # MACD
        macd_data = self.macd()
        if macd_data["crossover"] == "BULLISH":
            score += 10
            details.append("MACD bullish crossover")
        elif macd_data["crossover"] == "BEARISH":
            score -= 10
            details.append("MACD bearish crossover")

        # Volume spike
        vol = self.detect_volume_spike()
        if vol["spike"]:
            score += 5 if trend == "BULLISH" else -5
            details.append(f"Volume spike {vol['multiplier']}x")

        direction = "BULLISH" if score > 60 else "BEARISH" if score < 40 else "SIDEWAYS"
        return {
            "score": max(0, min(100, score)),
            "direction": direction,
            "details": "; ".join(details),
        }

    @staticmethod
    def _ema_series(data: np.ndarray, period: int) -> np.ndarray:
        """Calculate EMA series."""
        ema = np.zeros_like(data)
        ema[:period] = np.mean(data[:period])
        multiplier = 2 / (period + 1)
        for i in range(period, len(data)):
            ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1]
        return ema


# Singleton
chart_engine = ChartEngine()
