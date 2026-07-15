"""
Market Data Routes — Live market data endpoints
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class MarketStatusResponse(BaseModel):
    session: str
    trend: str
    momentum: str
    volatility: str
    spot_price: float
    day_change: float
    day_change_percent: float
    vix: float


@router.get("/status", response_model=MarketStatusResponse)
async def get_market_status() -> MarketStatusResponse:
    """Get current market status summary."""
    from app.engines.market_engine import market_engine

    status = market_engine.get_status()
    return MarketStatusResponse(**status)


@router.get("/instruments")
async def get_instruments(exchange: str = "NSE", segment: str = "NFO") -> dict:
    """Get available instruments for subscription."""
    return {
        "exchange": exchange,
        "segment": segment,
        "instruments": [],  # Populated from Kite API
        "message": "Connect Kite API to fetch instruments",
    }
