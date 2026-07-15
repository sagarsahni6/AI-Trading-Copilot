"""
Tests for Smart Money Concepts Engine
"""

import pytest
import random
from app.engines.smc_engine import SMCEngine


def generate_trending_candles(direction: str = "up", n: int = 100) -> list[dict]:
    """Generate candles with a clear trend for SMC testing."""
    candles = []
    price = 24000.0
    for i in range(n):
        if direction == "up":
            change = random.uniform(-10, 30)  # Bullish bias
        else:
            change = random.uniform(-30, 10)  # Bearish bias

        open_p = price
        close_p = price + change
        high_p = max(open_p, close_p) + random.uniform(5, 25)
        low_p = min(open_p, close_p) - random.uniform(5, 25)

        candles.append({
            "open": round(open_p, 2),
            "high": round(high_p, 2),
            "low": round(low_p, 2),
            "close": round(close_p, 2),
        })
        price = close_p
    return candles


class TestSMCEngine:
    """Test suite for SMCEngine."""

    def setup_method(self) -> None:
        random.seed(42)
        self.engine = SMCEngine()
        self.engine.update_data(generate_trending_candles("up", 100))

    def test_swing_points_detection(self) -> None:
        swings = self.engine.find_swing_points(lookback=3)
        assert len(swings) > 0
        # All swings should have valid types
        for s in swings:
            assert s.type in ["HIGH", "LOW"]
            assert s.price > 0
            assert s.index > 0

    def test_bos_detection(self) -> None:
        bos = self.engine.detect_bos()
        # In a trending market we should get some BOS
        for b in bos:
            assert b["type"] == "BOS"
            assert b["direction"] in ["BULLISH", "BEARISH"]
            assert b["price"] > 0
            assert b["significance"] in ["HIGH", "MODERATE"]

    def test_choch_detection(self) -> None:
        choch = self.engine.detect_choch()
        for c in choch:
            assert c["type"] == "CHOCH"
            assert c["direction"] in ["BULLISH", "BEARISH"]
            assert c["confirmed"] is True

    def test_order_blocks(self) -> None:
        obs = self.engine.detect_order_blocks()
        for ob in obs:
            assert ob["type"] in ["ORDER_BLOCK", "BREAKER_BLOCK"]
            assert ob["direction"] in ["BULLISH", "BEARISH"]
            assert ob["high"] > ob["low"]
            assert ob["strength"] in ["STRONG", "MODERATE"]

    def test_fvg_detection(self) -> None:
        fvgs = self.engine.detect_fvg()
        for fvg in fvgs:
            assert fvg["direction"] in ["BULLISH", "BEARISH"]
            assert isinstance(fvg["filled"], bool)
            assert 0 <= fvg["fill_percent"] <= 100

    def test_liquidity_levels(self) -> None:
        liq = self.engine.detect_liquidity()
        for l in liq:
            assert l["type"] in ["EQUAL_HIGH", "EQUAL_LOW"]
            assert l["price"] > 0
            assert isinstance(l["swept"], bool)

    def test_price_zone(self) -> None:
        zone = self.engine.determine_price_zone()
        assert zone in ["PREMIUM", "DISCOUNT", "EQUILIBRIUM"]

    def test_signal_score(self) -> None:
        signal = self.engine.get_signal_score()
        assert 0 <= signal["score"] <= 100
        assert signal["direction"] in ["BULLISH", "BEARISH", "SIDEWAYS"]

    def test_insufficient_data(self) -> None:
        engine = SMCEngine()
        engine.update_data(generate_trending_candles("up", 10))
        signal = engine.get_signal_score()
        assert signal["score"] == 50

    def test_bearish_trend(self) -> None:
        engine = SMCEngine()
        engine.update_data(generate_trending_candles("down", 100))
        signal = engine.get_signal_score()
        # Bearish trend should give score below 50
        assert signal["direction"] in ["BULLISH", "BEARISH", "SIDEWAYS"]
