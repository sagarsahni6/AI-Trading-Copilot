"""
Market Engine — Live market data aggregation and processing
=============================================================
Handles Kite Connect API WebSocket ticks, normalizes data,
and maintains current market state.
"""

import time
from dataclasses import dataclass, field


@dataclass
class TickData:
    """Normalized tick data from Kite WebSocket."""
    instrument_token: int = 0
    trading_symbol: str = ""
    last_price: float = 0.0
    open: float = 0.0
    high: float = 0.0
    low: float = 0.0
    close: float = 0.0
    volume: int = 0
    oi: int = 0
    oi_change: int = 0
    bid: list[dict] = field(default_factory=list)
    ask: list[dict] = field(default_factory=list)
    timestamp: float = 0.0


class MarketEngine:
    """
    Aggregates and manages real-time market data.

    Responsibilities:
    - Receive and normalize ticks from Kite Connect WebSocket
    - Maintain current market state (trend, momentum, volatility)
    - Broadcast updates to connected clients via Redis pub/sub
    """

    def __init__(self) -> None:
        self._current_tick: TickData | None = None
        self._spot_price: float = 0.0
        self._day_open: float = 0.0
        self._day_high: float = 0.0
        self._day_low: float = 0.0
        self._prev_close: float = 0.0
        self._vix: float = 0.0
        self._trend: str = "SIDEWAYS"
        self._momentum: str = "NEUTRAL"
        self._volatility: str = "MODERATE"
        self._session: str = "CLOSED"

    def process_tick(self, tick_data: dict) -> None:
        """Process incoming tick data and update state."""
        tick = TickData(
            instrument_token=tick_data.get("instrument_token", 0),
            trading_symbol=tick_data.get("trading_symbol", ""),
            last_price=tick_data.get("last_price", 0.0),
            open=tick_data.get("open", 0.0),
            high=tick_data.get("high", 0.0),
            low=tick_data.get("low", 0.0),
            close=tick_data.get("close", 0.0),
            volume=tick_data.get("volume", 0),
            oi=tick_data.get("oi", 0),
            oi_change=tick_data.get("oi_change", 0),
            timestamp=tick_data.get("timestamp", time.time()),
        )

        self._current_tick = tick
        self._spot_price = tick.last_price

        if tick.open > 0:
            self._day_open = tick.open
        if tick.high > 0:
            self._day_high = max(self._day_high, tick.high)
        if tick.low > 0:
            self._day_low = min(self._day_low, tick.low) if self._day_low > 0 else tick.low

    def process_dom_data(self, dom_data: dict) -> None:
        """Process market data extracted from Kite DOM (fallback)."""
        data = dom_data.get("data", {})
        price_data = data.get("price", {})

        if price_data:
            ltp = price_data.get("lastPrice", 0.0)
            if ltp > 0:
                self._spot_price = ltp

    def update_trend(self, trend: str) -> None:
        """Update trend from chart analysis."""
        if trend in ("BULLISH", "BEARISH", "SIDEWAYS"):
            self._trend = trend

    def update_session(self) -> None:
        """Determine current market session based on IST time."""
        from datetime import datetime, timezone, timedelta

        ist = timezone(timedelta(hours=5, minutes=30))
        now = datetime.now(ist)
        hour_min = now.hour * 60 + now.minute

        if now.weekday() >= 5:  # Weekend
            self._session = "CLOSED"
        elif hour_min < 9 * 60:
            self._session = "CLOSED"
        elif hour_min < 9 * 60 + 15:
            self._session = "PRE_OPEN"
        elif hour_min <= 15 * 60 + 30:
            self._session = "OPEN"
        elif hour_min <= 16 * 60:
            self._session = "POST_CLOSE"
        else:
            self._session = "CLOSED"

    def get_status(self) -> dict:
        """Get current market status snapshot."""
        self.update_session()

        day_change = self._spot_price - self._prev_close if self._prev_close > 0 else 0
        day_change_pct = (day_change / self._prev_close * 100) if self._prev_close > 0 else 0

        return {
            "session": self._session,
            "trend": self._trend,
            "momentum": self._momentum,
            "volatility": self._volatility,
            "spot_price": self._spot_price,
            "day_change": round(day_change, 2),
            "day_change_percent": round(day_change_pct, 2),
            "vix": self._vix,
        }


# Singleton instance
market_engine = MarketEngine()
