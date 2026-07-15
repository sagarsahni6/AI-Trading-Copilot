"""
AI Chat Routes — Conversational AI with NVIDIA NIM
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    reasoning: str | None = None


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse | StreamingResponse:
    """Send a message to the AI and get a response."""
    from app.engines.ai_engine import ai_engine

    if request.stream:
        return StreamingResponse(
            ai_engine.stream_chat(request.message, request.conversation_id),
            media_type="text/event-stream",
        )

    reply, reasoning = await ai_engine.chat(request.message, request.conversation_id)
    return ChatResponse(
        reply=reply,
        conversation_id=request.conversation_id or "default",
        reasoning=reasoning,
    )
