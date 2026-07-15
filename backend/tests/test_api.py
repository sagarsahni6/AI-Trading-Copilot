"""
Tests for API endpoints
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


class TestHealthEndpoints:
    """Test health and root endpoints."""

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "ai-trading-copilot"

    @pytest.mark.asyncio
    async def test_root(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "AI Trading Copilot API"
        assert data["version"] == "1.0.0"


class TestMarketEndpoints:
    """Test market data endpoints."""

    @pytest.mark.asyncio
    async def test_get_market_status(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/market/status")
        assert response.status_code == 200
        data = response.json()
        assert "session" in data
        assert "trend" in data
        assert "spot_price" in data

    @pytest.mark.asyncio
    async def test_get_instruments(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/market/instruments")
        assert response.status_code == 200
        data = response.json()
        assert "exchange" in data


class TestTradeEndpoints:
    """Test trade endpoints."""

    @pytest.mark.asyncio
    async def test_trade_history(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/trade/history")
        assert response.status_code == 200
        data = response.json()
        assert "trades" in data

    @pytest.mark.asyncio
    async def test_latest_recommendation(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/trade/latest")
        assert response.status_code == 200


class TestJournalEndpoints:
    """Test journal CRUD endpoints."""

    @pytest.mark.asyncio
    async def test_get_journal(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/journal/")
        assert response.status_code == 200
        data = response.json()
        assert "entries" in data

    @pytest.mark.asyncio
    async def test_create_journal_entry(self, client: AsyncClient) -> None:
        entry = {
            "symbol": "NIFTY",
            "direction": "CALL",
            "entry_price": 24500.0,
            "stop_loss": 24400.0,
            "target": 24650.0,
            "quantity": 50,
        }
        async with client:
            response = await client.post("/api/journal/", json=entry)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Entry created"

    @pytest.mark.asyncio
    async def test_get_dashboard_stats(self, client: AsyncClient) -> None:
        async with client:
            response = await client.get("/api/journal/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_trades" in data
        assert "win_rate" in data


class TestAuthEndpoints:
    """Test authentication endpoints."""

    @pytest.mark.asyncio
    async def test_login(self, client: AsyncClient) -> None:
        async with client:
            response = await client.post(
                "/api/auth/login",
                json={"api_key": "test-key"},
            )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_empty_key(self, client: AsyncClient) -> None:
        async with client:
            response = await client.post(
                "/api/auth/login",
                json={"api_key": ""},
            )
        assert response.status_code == 401
