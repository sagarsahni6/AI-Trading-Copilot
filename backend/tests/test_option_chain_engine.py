"""
Tests for Option Chain Engine
"""

import pytest
from app.engines.option_chain_engine import OptionChainEngine


MOCK_STRIKES = [
    {"strike_price": 24200, "call_oi": 2100000, "put_oi": 850000, "call_oi_change": -120000, "put_oi_change": 45000, "call_volume": 50000, "put_volume": 20000, "call_iv": 14.2, "put_iv": 15.8, "call_ltp": 285, "put_ltp": 12},
    {"strike_price": 24300, "call_oi": 1800000, "put_oi": 1200000, "call_oi_change": -85000, "put_oi_change": 120000, "call_volume": 40000, "put_volume": 30000, "call_iv": 12.8, "put_iv": 14.5, "call_ltp": 195, "put_ltp": 22},
    {"strike_price": 24400, "call_oi": 1500000, "put_oi": 1650000, "call_oi_change": 45000, "put_oi_change": 200000, "call_volume": 30000, "put_volume": 40000, "call_iv": 11.5, "put_iv": 13.2, "call_ltp": 120, "put_ltp": 48},
    {"strike_price": 24500, "call_oi": 3200000, "put_oi": 2800000, "call_oi_change": 320000, "put_oi_change": -150000, "call_volume": 80000, "put_volume": 70000, "call_iv": 10.8, "put_iv": 12.1, "call_ltp": 68, "put_ltp": 95},
    {"strike_price": 24600, "call_oi": 2400000, "put_oi": 1900000, "call_oi_change": 180000, "put_oi_change": -80000, "call_volume": 60000, "put_volume": 45000, "call_iv": 12.2, "put_iv": 11.5, "call_ltp": 32, "put_ltp": 160},
    {"strike_price": 24700, "call_oi": 1900000, "put_oi": 1100000, "call_oi_change": 95000, "put_oi_change": -45000, "call_volume": 35000, "put_volume": 25000, "call_iv": 13.8, "put_iv": 10.8, "call_ltp": 15, "put_ltp": 240},
    {"strike_price": 24800, "call_oi": 2800000, "put_oi": 700000, "call_oi_change": 250000, "put_oi_change": -25000, "call_volume": 70000, "put_volume": 15000, "call_iv": 15.5, "put_iv": 10.2, "call_ltp": 6, "put_ltp": 330},
]


class TestOptionChainEngine:
    """Test suite for OptionChainEngine."""

    def setup_method(self) -> None:
        self.engine = OptionChainEngine()
        self.engine.update_data(MOCK_STRIKES, spot_price=24500.0)

    def test_pcr_calculation(self) -> None:
        pcr = self.engine.calculate_pcr()
        total_call = sum(s["call_oi"] for s in MOCK_STRIKES)
        total_put = sum(s["put_oi"] for s in MOCK_STRIKES)
        expected = round(total_put / total_call, 3)
        assert pcr == expected
        assert 0 < pcr < 5  # Sanity check

    def test_max_pain(self) -> None:
        max_pain = self.engine.calculate_max_pain()
        assert max_pain > 0
        # Max pain should be a valid strike price
        valid_strikes = [s["strike_price"] for s in MOCK_STRIKES]
        assert max_pain in valid_strikes

    def test_support_resistance(self) -> None:
        sr = self.engine.find_support_resistance()
        assert "support" in sr
        assert "resistance" in sr
        assert sr["support"] > 0
        assert sr["resistance"] > 0
        # Support (highest put OI) should be different from resistance (highest call OI)
        # in typical markets

    def test_oi_shift_analysis(self) -> None:
        oi_shift = self.engine.analyze_oi_shift()
        assert "activity" in oi_shift
        assert oi_shift["activity"] in [
            "BULLISH_SHIFT", "BEARISH_SHIFT", "RANGE_BOUND",
            "EXPIRY_UNWIND", "NEUTRAL",
        ]
        assert "call_oi_change" in oi_shift
        assert "put_oi_change" in oi_shift
        assert "interpretation" in oi_shift

    def test_gamma_exposure(self) -> None:
        gex = self.engine.calculate_gamma_exposure()
        # GEX should be a number (can be positive or negative)
        assert isinstance(gex, float)

    def test_iv_state_detection(self) -> None:
        iv_state = self.engine.detect_iv_state()
        assert iv_state in ["CRUSH", "EXPANSION", "STABLE"]

    def test_full_analysis(self) -> None:
        analysis = self.engine.get_full_analysis()
        assert "pcr" in analysis
        assert "max_pain" in analysis
        assert "support" in analysis
        assert "resistance" in analysis
        assert "gamma_exposure" in analysis
        assert "iv_state" in analysis
        assert "oi_shift" in analysis

    def test_signal_score(self) -> None:
        signal = self.engine.get_signal_score()
        assert 0 <= signal["score"] <= 100
        assert signal["direction"] in ["BULLISH", "BEARISH", "SIDEWAYS"]
        assert "details" in signal

    def test_empty_data(self) -> None:
        empty_engine = OptionChainEngine()
        assert empty_engine.calculate_pcr() == 0.0
        assert empty_engine.calculate_max_pain() == 0.0
        signal = empty_engine.get_signal_score()
        assert signal["score"] == 50
