"""
Analysis Routes — AI-powered market analysis endpoints
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class AnalysisRequest(BaseModel):
    symbol: str = "NIFTY"
    timeframe: str = "5m"
    include_ai: bool = True


class AnalysisResponse(BaseModel):
    score: int
    direction: str
    confidence: str
    entry: float
    stop_loss: float
    target1: float
    target2: float
    target3: float
    risk_reward: float
    trend: str
    reasoning: dict
    warnings: list[str]
    not_to_trade_reasons: list[str]
    signals: dict
    timestamp: float


@router.post("/", response_model=AnalysisResponse)
async def run_analysis(request: AnalysisRequest) -> AnalysisResponse:
    """Run complete market analysis with all engines."""
    from app.engines.trade_engine import trade_engine

    result = await trade_engine.run_full_analysis(
        symbol=request.symbol,
        timeframe=request.timeframe,
        include_ai=request.include_ai,
    )
    return AnalysisResponse(**result)


@router.get("/quick")
async def quick_analysis(symbol: str = "NIFTY") -> dict:
    """Quick lightweight analysis without full AI processing."""
    from app.engines.trade_engine import trade_engine

    return await trade_engine.run_quick_analysis(symbol=symbol)
