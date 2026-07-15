"""
AI Trading Copilot — FastAPI Backend
=====================================
Main application entry point. Sets up middleware, routes,
WebSocket handlers, and startup/shutdown lifecycle events.
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import market, analysis, trade, journal, chat, auth
from app.api.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application startup and shutdown lifecycle."""
    # --- Startup ---
    print("AI Trading Copilot backend starting...")
    print(f"   NIM Model: {settings.NIM_MODEL}")
    print(f"   Database: {settings.DATABASE_URL[:30]}...")
    print(f"   Redis: {settings.REDIS_URL}")
    yield
    # --- Shutdown ---
    print("AI Trading Copilot backend shutting down...")


app = FastAPI(
    title="AI Trading Copilot API",
    description="Backend API for AI-powered market analysis on Zerodha Kite",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---- CORS Middleware ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routes ----
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(market.router, prefix="/api/market", tags=["Market Data"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(trade.router, prefix="/api/trade", tags=["Trade"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(chat.router, prefix="/api/chat", tags=["AI Chat"])
app.include_router(ws_router, tags=["WebSocket"])


# ---- Health Check ----
@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, str]:
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "ai-trading-copilot"}


@app.get("/", tags=["Health"])
async def root() -> dict[str, str]:
    """Root endpoint with API info."""
    return {
        "name": "AI Trading Copilot API",
        "version": "1.0.0",
        "docs": "/docs",
    }
