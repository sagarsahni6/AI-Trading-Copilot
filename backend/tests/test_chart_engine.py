"""
Tests for Chart Engine
"""

import pytest
import random
from app.engines.chart_engine import ChartEngine


def generate_candles(n: int = 100, start_price: float = 24000.0) -> list[dict]:
    """Generate mock OHLCV candles for testing."""
    candles = []
    price = start_price
    for i in range(n):
        change = (random.random() - 0.48) * 50  # Slight upward bias
        open_p = price
        close_p = price + change
        high_p = max(open_p, close_p) + random.random() * 20
        low_p = min(open_p, close_p) - random.random() * 20
        volume = random.randint(50000, 200000)
        candles.append({
            "timestamp": 1700000000 + i * 300,
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2),
            "volume": volume,
        })
        price = close_p
    return candles


class TestChartEngine:
    """Test suite for ChartEngine."""

    def setup_method(self) -> None:
        random.seed(42)  # Reproducible tests
        self.engine = ChartEngine()
        self.engine.update_candles(generate_candles(100))

    def test_ema_calculation(self) -> None:
        ema9 = self.engine.ema(9)
        ema21 = self.engine.ema(21)
        assert ema9 > 0
        assert ema21 > 0
        # EMA9 should be closer to current price than EMA21
        closes = [c.close for c in self.engine._candles]
        assert abs(ema9 - closes[-1]) <= abs(ema21 - closes[-1]) + 100  # Reasonable tolerance

    def test_sma_calculation(self) -> None:
        sma20 = self.engine.sma(20)
        assert sma20 > 0

    def test_rsi_range(self) -> None:
        rsi = self.engine.rsi(14)
        assert 0 <= rsi <= 100

    def test_rsi_insufficient_data(self) -> None:
        engine = ChartEngine()
        engine.update_candles(generate_candles(5))
        rsi = engine.rsi(14)
        assert rsi == 50.0  # Default when insufficient data

    def test_macd_structure(self) -> None:
        macd = self.engine.macd()
        assert "macd" in macd
        assert "signal" in macd
        assert "histogram" in macd
        assert "crossover" in macd
        assert macd["crossover"] in ["BULLISH", "BEARISH", "NONE"]

    def test_atr_positive(self) -> None:
        atr = self.engine.atr(14)
        assert atr > 0

    def test_adx_structure(self) -> None:
        adx = self.engine.adx(14)
        assert "value" in adx
        assert "plus_di" in adx
        assert "minus_di" in adx
        assert "trend_strength" in adx
        assert adx["trend_strength"] in ["NO_TREND", "WEAK", "MODERATE", "STRONG"]

    def test_vwap(self) -> None:
        vwap = self.engine.vwap()
        assert vwap > 0
        # VWAP should be within the price range
        closes = [c.close for c in self.engine._candles]
        assert min(closes) - 100 <= vwap <= max(closes) + 100

    def test_volume_spike_detection(self) -> None:
        result = self.engine.detect_volume_spike()
        assert "spike" in result
        assert "multiplier" in result
        assert isinstance(result["spike"], bool)
        assert result["multiplier"] > 0

    def test_trend_detection(self) -> None:
        trend = self.engine.detect_trend()
        assert trend in ["BULLISH", "BEARISH", "SIDEWAYS"]

    def test_signal_score(self) -> None:
        signal = self.engine.get_signal_score()
        assert 0 <= signal["score"] <= 100
        assert signal["direction"] in ["BULLISH", "BEARISH", "SIDEWAYS"]
        assert "details" in signal

    def test_insufficient_data_signal(self) -> None:
        engine = ChartEngine()
        engine.update_candles(generate_candles(10))
        signal = engine.get_signal_score()
        assert signal["score"] == 50
        assert signal["direction"] == "SIDEWAYS"

    def test_empty_engine(self) -> None:
        engine = ChartEngine()
        assert engine.ema(9) == 0.0
        assert engine.sma(20) == 0.0
        assert engine.vwap() == 0.0
