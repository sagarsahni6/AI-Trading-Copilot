"""
WebSocket Handler — Real-time bidirectional communication
"""

import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Active WebSocket connections
_connections: set[WebSocket] = set()


@router.websocket("/ws")
async def websocket_endpoint(ws: WebSocket) -> None:
    """WebSocket endpoint for real-time market data streaming."""
    await ws.accept()
    _connections.add(ws)
    print(f"[WS] Client connected. Total: {len(_connections)}")

    try:
        while True:
            # Receive messages from the extension
            data = await ws.receive_text()
            message = json.loads(data)
            msg_type = message.get("type", "")

            if msg_type == "MARKET_DATA":
                # Process incoming market data from extension
                await handle_market_data(message.get("payload", {}), ws)

            elif msg_type == "SUBSCRIBE":
                # Subscribe to specific instrument updates
                await ws.send_json({"type": "SUBSCRIBED", "payload": message.get("payload", {})})

            elif msg_type == "PING":
                await ws.send_json({"type": "PONG"})

    except WebSocketDisconnect:
        _connections.discard(ws)
        print(f"[WS] Client disconnected. Total: {len(_connections)}")
    except Exception as e:
        _connections.discard(ws)
        print(f"[WS] Error: {e}")


async def handle_market_data(payload: dict, ws: WebSocket) -> None:
    """Process incoming market data and trigger analysis if needed."""
    # Store data, run engines, and send back results
    # This is where the real-time analysis pipeline runs

    # For now, acknowledge receipt
    await ws.send_json({
        "type": "ACK",
        "payload": {"received": True, "timestamp": payload.get("timestamp", 0)},
    })


async def broadcast(message: dict) -> None:
    """Broadcast a message to all connected clients."""
    disconnected: set[WebSocket] = set()
    for ws in _connections:
        try:
            await ws.send_json(message)
        except Exception:
            disconnected.add(ws)
    _connections.difference_update(disconnected)
