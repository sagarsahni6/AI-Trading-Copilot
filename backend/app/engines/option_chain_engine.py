"""
Option Chain Engine — OI analysis, PCR, Max Pain, Greeks, GEX
==============================================================
Processes option chain data to derive actionable trading signals.
"""

import math
from dataclasses import dataclass


@dataclass
class StrikeInfo:
    strike_price: float
    call_oi: int
    put_oi: int
    call_oi_change: int
    put_oi_change: int
    call_volume: int
    put_volume: int
    call_iv: float
    put_iv: float
    call_ltp: float
    put_ltp: float


class OptionChainEngine:
    """
    Analyzes option chain data to produce:
    - PCR (Put-Call Ratio)
    - Max Pain strike
    - Support & Resistance from OI clusters
    - OI shift analysis (Long/Short build-up, covering, unwinding)
    - Gamma Exposure (GEX)
    - IV Crush / Expansion detection
    """

    def __init__(self) -> None:
        self._strikes: list[StrikeInfo] = []
        self._spot_price: float = 0.0

    def update_data(self, strikes: list[dict], spot_price: float) -> None:
        """Update with fresh option chain data."""
        self._spot_price = spot_price
        self._strikes = [
            StrikeInfo(
                strike_price=s.get("strike_price", 0),
                call_oi=s.get("call_oi", 0),
                put_oi=s.get("put_oi", 0),
                call_oi_change=s.get("call_oi_change", 0),
                put_oi_change=s.get("put_oi_change", 0),
                call_volume=s.get("call_volume", 0),
                put_volume=s.get("put_volume", 0),
                call_iv=s.get("call_iv", 0),
                put_iv=s.get("put_iv", 0),
                call_ltp=s.get("call_ltp", 0),
                put_ltp=s.get("put_ltp", 0),
            )
            for s in strikes
        ]

    def calculate_pcr(self) -> float:
        """Calculate Put-Call Ratio based on OI."""
        total_call_oi = sum(s.call_oi for s in self._strikes)
        total_put_oi = sum(s.put_oi for s in self._strikes)
        return round(total_put_oi / total_call_oi, 3) if total_call_oi > 0 else 0.0

    def calculate_max_pain(self) -> float:
        """Calculate Max Pain — strike where option writers lose least money."""
        min_pain = float("inf")
        max_pain_strike = 0.0

        for expiry_strike in self._strikes:
            total_pain = 0.0
            for s in self._strikes:
                # Call pain: max(0, expiryStrike - strike) * callOI
                if expiry_strike.strike_price > s.strike_price:
                    total_pain += (expiry_strike.strike_price - s.strike_price) * s.call_oi
                # Put pain: max(0, strike - expiryStrike) * putOI
                if s.strike_price > expiry_strike.strike_price:
                    total_pain += (s.strike_price - expiry_strike.strike_price) * s.put_oi

            if total_pain < min_pain:
                min_pain = total_pain
                max_pain_strike = expiry_strike.strike_price

        return max_pain_strike

    def find_support_resistance(self) -> dict:
        """Find support (highest put OI) and resistance (highest call OI) levels."""
        if not self._strikes:
            return {"support": 0, "resistance": 0}

        max_put_oi_strike = max(self._strikes, key=lambda s: s.put_oi)
        max_call_oi_strike = max(self._strikes, key=lambda s: s.call_oi)

        return {
            "support": max_put_oi_strike.strike_price,
            "resistance": max_call_oi_strike.strike_price,
            "support_oi": max_put_oi_strike.put_oi,
            "resistance_oi": max_call_oi_strike.call_oi,
        }

    def analyze_oi_shift(self) -> dict:
        """Analyze OI changes to detect institutional activity."""
        total_call_oi_change = sum(s.call_oi_change for s in self._strikes)
        total_put_oi_change = sum(s.put_oi_change for s in self._strikes)

        # Determine dominant OI activity
        activity = "NEUTRAL"
        interpretation = ""

        if total_put_oi_change > 0 and total_call_oi_change < 0:
            activity = "BULLISH_SHIFT"
            interpretation = "Put writing + Call unwinding indicates bullish institutional bias"
        elif total_call_oi_change > 0 and total_put_oi_change < 0:
            activity = "BEARISH_SHIFT"
            interpretation = "Call writing + Put unwinding indicates bearish institutional bias"
        elif total_call_oi_change > 0 and total_put_oi_change > 0:
            activity = "RANGE_BOUND"
            interpretation = "Both call and put OI increasing — market likely range-bound"
        elif total_call_oi_change < 0 and total_put_oi_change < 0:
            activity = "EXPIRY_UNWIND"
            interpretation = "Both sides unwinding — expiry effect or uncertainty"

        return {
            "activity": activity,
            "call_oi_change": total_call_oi_change,
            "put_oi_change": total_put_oi_change,
            "call_writing": total_call_oi_change > 0,
            "put_writing": total_put_oi_change > 0,
            "short_covering": total_call_oi_change < 0,
            "long_unwinding": total_put_oi_change < 0,
            "interpretation": interpretation,
        }

    def calculate_gamma_exposure(self) -> float:
        """Calculate net Gamma Exposure (GEX) across all strikes."""
        gex = 0.0
        for s in self._strikes:
            # Simplified GEX = (Call OI - Put OI) * gamma * spot * 100
            # Using a simplified gamma approximation
            distance = abs(self._spot_price - s.strike_price)
            if distance < self._spot_price * 0.1:  # Only near-ATM strikes
                gamma_approx = max(0, 1 - distance / (self._spot_price * 0.05))
                gex += (s.call_oi - s.put_oi) * gamma_approx * self._spot_price * 0.01
        return round(gex, 0)

    def detect_iv_state(self) -> str:
        """Detect IV Crush or Expansion."""
        if not self._strikes:
            return "STABLE"

        avg_call_iv = sum(s.call_iv for s in self._strikes) / len(self._strikes)
        avg_put_iv = sum(s.put_iv for s in self._strikes) / len(self._strikes)
        avg_iv = (avg_call_iv + avg_put_iv) / 2

        # Simple heuristic — would need historical IV comparison in production
        if avg_iv < 12:
            return "CRUSH"
        elif avg_iv > 20:
            return "EXPANSION"
        return "STABLE"

    def get_full_analysis(self) -> dict:
        """Get complete option chain analysis."""
        sr = self.find_support_resistance()
        oi_shift = self.analyze_oi_shift()

        return {
            "pcr": self.calculate_pcr(),
            "max_pain": self.calculate_max_pain(),
            "support": sr["support"],
            "resistance": sr["resistance"],
            "gamma_exposure": self.calculate_gamma_exposure(),
            "iv_state": self.detect_iv_state(),
            "oi_shift": oi_shift,
            "total_call_oi": sum(s.call_oi for s in self._strikes),
            "total_put_oi": sum(s.put_oi for s in self._strikes),
        }

    def get_signal_score(self) -> dict:
        """Get option chain signal score (0-100) for the trade engine."""
        if not self._strikes:
            return {"score": 50, "direction": "SIDEWAYS", "details": "No option chain data"}

        pcr = self.calculate_pcr()
        oi_shift = self.analyze_oi_shift()
        iv_state = self.detect_iv_state()

        score = 50  # Neutral baseline
        direction = "SIDEWAYS"
        details = []

        # PCR analysis
        if pcr > 1.2:
            score += 15
            details.append(f"PCR {pcr:.2f} — bullish (put writing)")
        elif pcr < 0.8:
            score -= 15
            details.append(f"PCR {pcr:.2f} — bearish (call writing)")

        # OI shift
        if oi_shift["activity"] == "BULLISH_SHIFT":
            score += 15
            details.append("Bullish OI shift detected")
        elif oi_shift["activity"] == "BEARISH_SHIFT":
            score -= 15
            details.append("Bearish OI shift detected")

        # IV state
        if iv_state == "EXPANSION":
            score -= 5
            details.append("IV expanding — higher risk")

        direction = "BULLISH" if score > 60 else "BEARISH" if score < 40 else "SIDEWAYS"

        return {
            "score": max(0, min(100, score)),
            "direction": direction,
            "details": "; ".join(details),
        }


# Singleton
option_chain_engine = OptionChainEngine()
