"""
AI Engine — NVIDIA NIM API integration
========================================
Provides structured trade analysis and conversational AI
using NVIDIA NIM's OpenAI-compatible API.
"""

import json
import time
from collections.abc import AsyncGenerator

from openai import OpenAI

from app.config import settings


# JSON schema for structured trade analysis output
TRADE_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "direction": {"type": "string", "enum": ["CALL", "PUT", "NO_TRADE"]},
        "confidence": {"type": "string", "enum": ["VERY_HIGH", "HIGH", "MODERATE", "LOW", "VERY_LOW"]},
        "entry": {"type": "number"},
        "stop_loss": {"type": "number"},
        "target1": {"type": "number"},
        "target2": {"type": "number"},
        "target3": {"type": "number"},
        "reasoning": {
            "type": "object",
            "properties": {
                "why_trade": {"type": "string"},
                "why_not": {"type": "string"},
                "risk": {"type": "string"},
                "probability": {"type": "string"},
                "market_psychology": {"type": "string"},
                "institutional_activity": {"type": "string"},
                "expected_movement": {"type": "string"},
                "alternative_scenario": {"type": "string"},
                "invalidation_point": {"type": "string"},
            },
            "required": ["why_trade", "why_not", "risk", "probability"],
        },
        "warnings": {"type": "array", "items": {"type": "string"}},
        "not_to_trade_reasons": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["direction", "confidence", "reasoning", "warnings", "not_to_trade_reasons"],
}

SYSTEM_PROMPT = """You are an expert quantitative trading analyst specializing in Indian markets (NSE/NFO).
You analyze option chains, technical indicators, Smart Money Concepts, and price action to provide trade recommendations.

CRITICAL RULES:
1. You are a decision-SUPPORT system only. Never guarantee profits.
2. Always provide reasons NOT to trade alongside reasons to trade.
3. Always include risk warnings.
4. Never recommend trades with insufficient evidence.
5. Be conservative — only recommend high-conviction setups (score > 80).
6. Consider IST market timings (9:15 AM - 3:30 PM).
7. Account for Nifty/BankNifty lot sizes and margin requirements.

When analyzing, consider:
- Trend (EMA alignment, ADX strength)
- Option chain (PCR, Max Pain, OI shifts, GEX)
- Volume (spikes, VWAP position)
- Smart Money (BOS, CHOCH, Order Blocks, FVG, Liquidity)
- Technical indicators (RSI, MACD, Supertrend)
- Volatility (IV, ATR, VIX)
"""


class AIEngine:
    """NVIDIA NIM AI integration for trade analysis and chat."""

    def __init__(self) -> None:
        self._client = OpenAI(
            base_url=settings.NIM_BASE_URL,
            api_key=settings.NIM_API_KEY,
        )
        self._model = settings.NIM_MODEL
        self._chat_history: dict[str, list[dict]] = {}

    async def analyze_trade(self, market_context: dict) -> dict:
        """
        Run AI analysis on aggregated market data.
        Uses guided_json or robust JSON extraction for structured output.
        """
        context_str = json.dumps(market_context, indent=2, default=str)

        prompt = f"""Analyze the following market data and provide a trade recommendation.

MARKET DATA:
{context_str}

Provide your analysis as a structured JSON with:
- direction (CALL/PUT/NO_TRADE)
- confidence level
- entry, stop_loss, target1, target2, target3 prices
- detailed reasoning (why trade, why not, risk, probability, market psychology, institutional activity, expected movement, alternative scenario, invalidation point)
- warnings list
- not_to_trade_reasons list
"""

        try:
            extra_body = {}
            if "glm" in self._model.lower():
                extra_body["chat_template_kwargs"] = {"enable_thinking": True, "clear_thinking": False}
            else:
                extra_body["guided_json"] = TRADE_ANALYSIS_SCHEMA

            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
                extra_body=extra_body,
            )

            content = response.choices[0].message.content or "{}"
            
            # Robust JSON extraction fallback (in case model outputs formatting or thinking tags)
            if "```" in content:
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            content = content.strip()
            if not content.startswith("{"):
                idx = content.find("{")
                if idx != -1:
                    content = content[idx:]
            if not content.endswith("}"):
                idx = content.rfind("}")
                if idx != -1:
                    content = content[:idx+1]

            return json.loads(content)

        except Exception as e:
            return {
                "direction": "NO_TRADE",
                "confidence": "LOW",
                "entry": 0,
                "stop_loss": 0,
                "target1": 0,
                "target2": 0,
                "target3": 0,
                "reasoning": {
                    "why_trade": "",
                    "why_not": f"AI analysis failed: {str(e)}",
                    "risk": "Unable to assess risk — AI unavailable",
                    "probability": "Unknown",
                },
                "warnings": [f"AI engine error: {str(e)}"],
                "not_to_trade_reasons": ["AI analysis unavailable"],
            }

    async def chat(self, message: str, conversation_id: str | None = None) -> tuple[str, str | None]:
        """Send a chat message and get a response with reasoning."""
        conv_id = conversation_id or "default"

        if conv_id not in self._chat_history:
            self._chat_history[conv_id] = [
                {"role": "system", "content": SYSTEM_PROMPT},
            ]

        self._chat_history[conv_id].append({"role": "user", "content": message})

        # Keep history manageable
        if len(self._chat_history[conv_id]) > 20:
            self._chat_history[conv_id] = (
                self._chat_history[conv_id][:1] + self._chat_history[conv_id][-10:]
            )

        try:
            extra_body = {}
            if "glm" in self._model.lower():
                extra_body["chat_template_kwargs"] = {"enable_thinking": True, "clear_thinking": False}

            response = self._client.chat.completions.create(
                model=self._model,
                messages=self._chat_history[conv_id],
                temperature=0.7,
                max_tokens=2000,
                extra_body=extra_body,
            )

            msg = response.choices[0].message
            reply = msg.content or "No response."
            reasoning = getattr(msg, "reasoning_content", None)
            
            self._chat_history[conv_id].append({"role": "assistant", "content": reply})
            return reply, reasoning

        except Exception as e:
            return f"I'm unable to respond right now. Error: {str(e)}", None

    async def stream_chat(
        self, message: str, conversation_id: str | None = None
    ) -> AsyncGenerator[str, None]:
        """Stream a chat response with reasoning via SSE."""
        conv_id = conversation_id or "default"

        if conv_id not in self._chat_history:
            self._chat_history[conv_id] = [
                {"role": "system", "content": SYSTEM_PROMPT},
            ]

        self._chat_history[conv_id].append({"role": "user", "content": message})

        try:
            extra_body = {}
            if "glm" in self._model.lower():
                extra_body["chat_template_kwargs"] = {"enable_thinking": True, "clear_thinking": False}

            stream = self._client.chat.completions.create(
                model=self._model,
                messages=self._chat_history[conv_id],
                temperature=0.7,
                max_tokens=2000,
                stream=True,
                extra_body=extra_body,
            )

            full_response = ""
            for chunk in stream:
                if not getattr(chunk, "choices", None) or len(chunk.choices) == 0:
                    continue
                delta = chunk.choices[0].delta
                
                reasoning = getattr(delta, "reasoning_content", None)
                if reasoning:
                    yield f"data: {json.dumps({'reasoning': reasoning})}\n\n"
                    
                content = getattr(delta, "content", None)
                if content:
                    full_response += content
                    yield f"data: {json.dumps({'content': content})}\n\n"

            self._chat_history[conv_id].append({"role": "assistant", "content": full_response})
            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"


# Singleton
ai_engine = AIEngine()
