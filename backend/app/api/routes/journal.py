"""
Journal Routes — Trade journal CRUD operations
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class JournalEntry(BaseModel):
    symbol: str
    direction: str
    entry_price: float
    exit_price: float | None = None
    stop_loss: float
    target: float
    quantity: int
    pnl: float | None = None
    result: str = "OPEN"
    notes: str = ""
    mistakes: list[str] = []
    psychology_notes: str = ""


@router.get("/")
async def get_journal_entries(limit: int = 50, offset: int = 0) -> dict:
    """Get all trade journal entries."""
    return {"entries": [], "total": 0, "limit": limit, "offset": offset}


@router.post("/")
async def create_journal_entry(entry: JournalEntry) -> dict:
    """Create a new trade journal entry."""
    return {"id": "placeholder", "message": "Entry created", "entry": entry.model_dump()}


@router.put("/{entry_id}")
async def update_journal_entry(entry_id: str, entry: JournalEntry) -> dict:
    """Update an existing journal entry."""
    return {"id": entry_id, "message": "Entry updated"}


@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: str) -> dict:
    """Delete a journal entry."""
    return {"id": entry_id, "message": "Entry deleted"}


@router.get("/stats")
async def get_dashboard_stats() -> dict:
    """Get aggregated dashboard statistics."""
    return {
        "total_trades": 0,
        "wins": 0,
        "losses": 0,
        "win_rate": 0.0,
        "average_rr": 0.0,
        "total_pnl": 0.0,
        "best_trade": 0.0,
        "worst_trade": 0.0,
    }
