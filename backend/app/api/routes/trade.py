"""
Trade Routes — Trade recommendation history
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/history")
async def get_trade_history(limit: int = 50) -> dict:
    """Get trade recommendation history."""
    return {"trades": [], "total": 0, "limit": limit}


@router.get("/latest")
async def get_latest_recommendation() -> dict:
    """Get the most recent trade recommendation."""
    return {"recommendation": None, "message": "No active recommendation"}
