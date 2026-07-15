"""
Smart Money Concepts Engine — BOS, CHOCH, OB, FVG, Liquidity
=============================================================
Detects institutional trading footprints in price action.
"""

import numpy as np
from dataclasses import dataclass


@dataclass
class SwingPoint:
    index: int
    price: float
    type: str  # "HIGH" or "LOW"


class SMCEngine:
    """
    Smart Money Concepts detector.

    Detects:
    - BOS (Break of Structure)
    - CHOCH (Change of Character)
    - Order Blocks (OB), Breaker Blocks, Mitigation Blocks
    - Fair Value Gaps (FVG / Imbalance)
    - Liquidity levels (Equal Highs/Lows)
    - Premium/Discount zones
    """

    def __init__(self) -> None:
        self._highs: list[float] = []
        self._lows: list[float] = []
        self._closes: list[float] = []
        self._opens: list[float] = []

    def update_data(self, candles: list[dict]) -> None:
        """Update with fresh candle data."""
        self._highs = [c.get("high", 0) for c in candles]
        self._lows = [c.get("low", 0) for c in candles]
        self._closes = [c.get("close", 0) for c in candles]
        self._opens = [c.get("open", 0) for c in candles]

    def find_swing_points(self, lookback: int = 5) -> list[SwingPoint]:
        """Identify swing highs and swing lows."""
        swings: list[SwingPoint] = []
        n = len(self._highs)

        for i in range(lookback, n - lookback):
            # Swing High
            if all(self._highs[i] >= self._highs[i - j] for j in range(1, lookback + 1)) and \
               all(self._highs[i] >= self._highs[i + j] for j in range(1, lookback + 1)):
                swings.append(SwingPoint(index=i, price=self._highs[i], type="HIGH"))

            # Swing Low
            if all(self._lows[i] <= self._lows[i - j] for j in range(1, lookback + 1)) and \
               all(self._lows[i] <= self._lows[i + j] for j in range(1, lookback + 1)):
                swings.append(SwingPoint(index=i, price=self._lows[i], type="LOW"))

        return swings

    def detect_bos(self) -> list[dict]:
        """Detect Break of Structure (BOS)."""
        swings = self.find_swing_points()
        bos_events: list[dict] = []

        swing_highs = [s for s in swings if s.type == "HIGH"]
        swing_lows = [s for s in swings if s.type == "LOW"]

        # Bullish BOS: price breaks above a previous swing high
        for i in range(1, len(swing_highs)):
            if swing_highs[i].price > swing_highs[i - 1].price:
                bos_events.append({
                    "type": "BOS",
                    "direction": "BULLISH",
                    "price": swing_highs[i].price,
                    "index": swing_highs[i].index,
                    "confirmed": True,
                    "significance": "HIGH" if (swing_highs[i].price - swing_highs[i - 1].price) / swing_highs[i - 1].price > 0.005 else "MODERATE",
                })

        # Bearish BOS: price breaks below a previous swing low
        for i in range(1, len(swing_lows)):
            if swing_lows[i].price < swing_lows[i - 1].price:
                bos_events.append({
                    "type": "BOS",
                    "direction": "BEARISH",
                    "price": swing_lows[i].price,
                    "index": swing_lows[i].index,
                    "confirmed": True,
                    "significance": "HIGH" if (swing_lows[i - 1].price - swing_lows[i].price) / swing_lows[i - 1].price > 0.005 else "MODERATE",
                })

        return bos_events[-5:]  # Return last 5

    def detect_choch(self) -> list[dict]:
        """Detect Change of Character (CHOCH)."""
        swings = self.find_swing_points()
        choch_events: list[dict] = []

        # CHOCH = first break against the prevailing structure
        # Bullish CHOCH: in a downtrend (lower lows), price makes a higher high
        # Bearish CHOCH: in an uptrend (higher highs), price makes a lower low
        highs = [s for s in swings if s.type == "HIGH"]
        lows = [s for s in swings if s.type == "LOW"]

        if len(highs) >= 3 and len(lows) >= 3:
            # Check for bearish CHOCH (was making HH, now LL)
            if highs[-3].price < highs[-2].price and highs[-1].price < highs[-2].price:
                choch_events.append({
                    "type": "CHOCH",
                    "direction": "BEARISH",
                    "price": highs[-1].price,
                    "confirmed": True,
                    "significance": "HIGH",
                })

            # Check for bullish CHOCH (was making LL, now HH)
            if lows[-3].price > lows[-2].price and lows[-1].price > lows[-2].price:
                choch_events.append({
                    "type": "CHOCH",
                    "direction": "BULLISH",
                    "price": lows[-1].price,
                    "confirmed": True,
                    "significance": "HIGH",
                })

        return choch_events

    def detect_order_blocks(self) -> list[dict]:
        """Detect Order Blocks (last opposing candle before impulsive move)."""
        order_blocks: list[dict] = []
        n = len(self._closes)

        for i in range(2, n - 1):
            # Bullish OB: bearish candle followed by strong bullish move
            if self._closes[i] < self._opens[i]:  # Bearish candle
                if self._closes[i + 1] > self._opens[i + 1]:  # Bullish candle after
                    body_ratio = abs(self._closes[i + 1] - self._opens[i + 1]) / abs(self._closes[i] - self._opens[i]) if abs(self._closes[i] - self._opens[i]) > 0 else 0
                    if body_ratio > 1.5:  # Impulsive move
                        order_blocks.append({
                            "type": "ORDER_BLOCK",
                            "direction": "BULLISH",
                            "high": max(self._opens[i], self._closes[i]),
                            "low": min(self._opens[i], self._closes[i]),
                            "index": i,
                            "mitigated": self._lows[-1] < min(self._opens[i], self._closes[i]),
                            "strength": "STRONG" if body_ratio > 2.5 else "MODERATE",
                        })

            # Bearish OB: bullish candle followed by strong bearish move
            if self._closes[i] > self._opens[i]:
                if self._closes[i + 1] < self._opens[i + 1]:
                    body_ratio = abs(self._closes[i + 1] - self._opens[i + 1]) / abs(self._closes[i] - self._opens[i]) if abs(self._closes[i] - self._opens[i]) > 0 else 0
                    if body_ratio > 1.5:
                        order_blocks.append({
                            "type": "ORDER_BLOCK",
                            "direction": "BEARISH",
                            "high": max(self._opens[i], self._closes[i]),
                            "low": min(self._opens[i], self._closes[i]),
                            "index": i,
                            "mitigated": self._highs[-1] > max(self._opens[i], self._closes[i]),
                            "strength": "STRONG" if body_ratio > 2.5 else "MODERATE",
                        })

        return order_blocks[-5:]

    def detect_fvg(self) -> list[dict]:
        """Detect Fair Value Gaps (3-candle imbalance)."""
        fvgs: list[dict] = []
        n = len(self._highs)

        for i in range(1, n - 1):
            # Bullish FVG: gap between candle 1 high and candle 3 low
            if self._lows[i + 1] > self._highs[i - 1]:
                fvgs.append({
                    "direction": "BULLISH",
                    "high": self._lows[i + 1],
                    "low": self._highs[i - 1],
                    "index": i,
                    "filled": self._lows[-1] <= self._highs[i - 1],
                    "fill_percent": min(100, max(0, int(
                        (self._lows[-1] - self._lows[i + 1]) / (self._highs[i - 1] - self._lows[i + 1]) * 100
                    ))) if self._lows[i + 1] != self._highs[i - 1] else 0,
                })

            # Bearish FVG: gap between candle 3 high and candle 1 low
            if self._highs[i + 1] < self._lows[i - 1]:
                fvgs.append({
                    "direction": "BEARISH",
                    "high": self._lows[i - 1],
                    "low": self._highs[i + 1],
                    "index": i,
                    "filled": self._highs[-1] >= self._lows[i - 1],
                    "fill_percent": 100 if self._highs[-1] >= self._lows[i - 1] else 0,
                })

        return fvgs[-5:]

    def detect_liquidity(self) -> list[dict]:
        """Detect liquidity levels (equal highs/lows)."""
        swings = self.find_swing_points()
        liquidity: list[dict] = []
        tolerance = 0.001  # 0.1% tolerance for "equal" levels

        highs = [s for s in swings if s.type == "HIGH"]
        lows = [s for s in swings if s.type == "LOW"]

        # Equal highs
        for i in range(len(highs)):
            for j in range(i + 1, len(highs)):
                if abs(highs[i].price - highs[j].price) / highs[i].price < tolerance:
                    liquidity.append({
                        "type": "EQUAL_HIGH",
                        "price": round((highs[i].price + highs[j].price) / 2, 2),
                        "swept": any(h > max(highs[i].price, highs[j].price) for h in self._highs[highs[j].index:]),
                        "strength": "HIGH",
                    })

        # Equal lows
        for i in range(len(lows)):
            for j in range(i + 1, len(lows)):
                if abs(lows[i].price - lows[j].price) / lows[i].price < tolerance:
                    liquidity.append({
                        "type": "EQUAL_LOW",
                        "price": round((lows[i].price + lows[j].price) / 2, 2),
                        "swept": any(l < min(lows[i].price, lows[j].price) for l in self._lows[lows[j].index:]),
                        "strength": "HIGH",
                    })

        return liquidity[-5:]

    def determine_price_zone(self) -> str:
        """Determine if price is in Premium, Discount, or Equilibrium."""
        if len(self._highs) < 20:
            return "EQUILIBRIUM"

        recent_high = max(self._highs[-20:])
        recent_low = min(self._lows[-20:])
        equilibrium = (recent_high + recent_low) / 2
        current = self._closes[-1] if self._closes else 0

        if current > equilibrium:
            return "PREMIUM"
        elif current < equilibrium:
            return "DISCOUNT"
        return "EQUILIBRIUM"

    def get_signal_score(self) -> dict:
        """Get SMC signal score for trade engine."""
        if len(self._closes) < 50:
            return {"score": 50, "direction": "SIDEWAYS", "details": "Insufficient data"}

        score = 50
        details = []

        # BOS signals
        bos = self.detect_bos()
        if bos:
            latest = bos[-1]
            if latest["direction"] == "BULLISH":
                score += 15
                details.append("Bullish BOS detected")
            else:
                score -= 15
                details.append("Bearish BOS detected")

        # CHOCH signals
        choch = self.detect_choch()
        if choch:
            latest = choch[-1]
            if latest["direction"] == "BULLISH":
                score += 10
                details.append("Bullish CHOCH — trend reversal")
            else:
                score -= 10
                details.append("Bearish CHOCH — trend reversal")

        # Price zone
        zone = self.determine_price_zone()
        if zone == "DISCOUNT":
            score += 5
            details.append("Price in discount zone")
        elif zone == "PREMIUM":
            score -= 5
            details.append("Price in premium zone")

        direction = "BULLISH" if score > 60 else "BEARISH" if score < 40 else "SIDEWAYS"
        return {
            "score": max(0, min(100, score)),
            "direction": direction,
            "details": "; ".join(details),
        }


# Singleton
smc_engine = SMCEngine()
