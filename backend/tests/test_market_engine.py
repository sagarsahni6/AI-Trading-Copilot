"""
Tests for Market Engine
"""

import pytest
from app.engines.market_engine import MarketEngine


class TestMarketEngine:
    """Test suite for MarketEngine."""

    def setup_method(self) -> None:
        self.engine = MarketEngine()

    def test_initial_state(self) -> None:
        status = self.engine.get_status()
        assert status["spot_price"] == 0.0
        assert status["trend"] == "SIDEWAYS"
        assert status["momentum"] == "NEUTRAL"
        assert status["volatility"] == "MODERATE"

    def test_process_tick(self) -> None:
        tick = {
            "instrument_token": 256265,
            "trading_symbol": "NIFTY 50",
            "last_price": 24500.0,
            "open": 24400.0,
            "high": 24550.0,
            "low": 24350.0,
            "close": 24450.0,
            "volume": 1000000,
            "oi": 0,
        }
        self.engine.process_tick(tick)
        status = self.engine.get_status()
        assert status["spot_price"] == 24500.0

    def test_process_multiple_ticks_tracks_high_low(self) -> None:
        ticks = [
            {"last_price": 24400.0, "open": 24400.0, "high": 24420.0, "low": 24380.0, "close": 24400.0, "volume": 100},
            {"last_price": 24500.0, "open": 24400.0, "high": 24510.0, "low": 24395.0, "close": 24500.0, "volume": 200},
            {"last_price": 24450.0, "open": 24400.0, "high": 24505.0, "low": 24440.0, "close": 24450.0, "volume": 150},
        ]
        for t in ticks:
            self.engine.process_tick(t)

        assert self.engine._spot_price == 24450.0
        assert self.engine._day_high == 24510.0
        assert self.engine._day_low == 24380.0

    def test_process_dom_data(self) -> None:
        dom_data = {
            "data": {
                "price": {"lastPrice": 24600.0, "change": 50.0},
            }
        }
        self.engine.process_dom_data(dom_data)
        assert self.engine._spot_price == 24600.0

    def test_update_trend(self) -> None:
        self.engine.update_trend("BULLISH")
        assert self.engine._trend == "BULLISH"

        self.engine.update_trend("BEARISH")
        assert self.engine._trend == "BEARISH"

        # Invalid trend ignored
        self.engine.update_trend("INVALID")
        assert self.engine._trend == "BEARISH"

    def test_get_status_day_change_calculation(self) -> None:
        self.engine._prev_close = 24400.0
        self.engine._spot_price = 24500.0
        status = self.engine.get_status()
        assert status["day_change"] == 100.0
        assert round(status["day_change_percent"], 2) == 0.41

    def test_get_status_no_prev_close(self) -> None:
        self.engine._spot_price = 24500.0
        status = self.engine.get_status()
        assert status["day_change"] == 0
        assert status["day_change_percent"] == 0
