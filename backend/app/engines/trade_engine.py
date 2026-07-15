"""
Trade Engine — Weighted signal aggregation and recommendation
==============================================================
Combines all analysis engines with configurable weights to
produce a final trade score and recommendation.
"""

import time

from app.engines.market_engine import market_engine
from app.engines.option_chain_engine import option_chain_engine
from app.engines.chart_engine import chart_engine
from app.engines.smc_engine import smc_engine
from app.engines.ai_engine import ai_engine

# Signal weights (must sum to 100)
WEIGHTS = {
    "trend": 25,
    "option_chain": 20,
    "volume": 15,
    "smc": 20,
    "indicators": 10,
    "volatility": 10,
}

MIN_TRADE_SCORE = 80
MIN_RISK_REWARD = 1.5


class TradeEngine:
    """
    Combines all analysis signals with weighted scoring.

    Weights:
    - Trend: 25
    - Option Chain: 20
    - Volume: 15
    - SMC: 20
    - Indicators: 10
    - Volatility: 10

    Only recommends trades with score > 80.
    """

    async def run_full_analysis(
        self, symbol: str = "NIFTY", timeframe: str = "5m", include_ai: bool = True
    ) -> dict:
        """Run complete analysis pipeline with all engines + AI."""

        # Get signal scores from each engine
        chart_signal = chart_engine.get_signal_score()
        oc_signal = option_chain_engine.get_signal_score()
        smc_signal = smc_engine.get_signal_score()
        market_status = market_engine.get_status()

        # Calculate weighted scores
        trend_score = chart_signal["score"]
        oc_score = oc_signal["score"]
        volume_score = 50  # TODO: dedicated volume engine
        smc_score = smc_signal["score"]
        indicator_score = chart_signal["score"]  # Shared with chart for now
        volatility_score = 50  # TODO: dedicated volatility engine

        # Weighted aggregation
        signals = {
            "trend": {
                "name": "Trend",
                "weight": WEIGHTS["trend"],
                "score": trend_score,
                "weighted_score": round(trend_score * WEIGHTS["trend"] / 100, 1),
                "direction": chart_signal["direction"],
                "details": chart_signal["details"],
            },
            "option_chain": {
                "name": "Option Chain",
                "weight": WEIGHTS["option_chain"],
                "score": oc_score,
                "weighted_score": round(oc_score * WEIGHTS["option_chain"] / 100, 1),
                "direction": oc_signal["direction"],
                "details": oc_signal["details"],
            },
            "volume": {
                "name": "Volume",
                "weight": WEIGHTS["volume"],
                "score": volume_score,
                "weighted_score": round(volume_score * WEIGHTS["volume"] / 100, 1),
                "direction": "SIDEWAYS",
                "details": "Volume analysis pending",
            },
            "smc": {
                "name": "Smart Money",
                "weight": WEIGHTS["smc"],
                "score": smc_score,
                "weighted_score": round(smc_score * WEIGHTS["smc"] / 100, 1),
                "direction": smc_signal["direction"],
                "details": smc_signal["details"],
            },
            "indicators": {
                "name": "Indicators",
                "weight": WEIGHTS["indicators"],
                "score": indicator_score,
                "weighted_score": round(indicator_score * WEIGHTS["indicators"] / 100, 1),
                "direction": chart_signal["direction"],
                "details": "Technical indicators",
            },
            "volatility": {
                "name": "Volatility",
                "weight": WEIGHTS["volatility"],
                "score": volatility_score,
                "weighted_score": round(volatility_score * WEIGHTS["volatility"] / 100, 1),
                "direction": "SIDEWAYS",
                "details": "Volatility assessment pending",
            },
        }

        # Total weighted score
        total_score = sum(s["weighted_score"] for s in signals.values())
        total_score = round(max(0, min(100, total_score)), 0)

        # Determine direction from dominant signals
        bullish_weight = sum(
            s["weighted_score"] for s in signals.values() if s["direction"] == "BULLISH"
        )
        bearish_weight = sum(
            s["weighted_score"] for s in signals.values() if s["direction"] == "BEARISH"
        )

        if total_score >= MIN_TRADE_SCORE:
            direction = "CALL" if bullish_weight > bearish_weight else "PUT"
        else:
            direction = "NO_TRADE"

        # Get AI analysis if requested
        reasoning = {
            "whyTrade": "",
            "whyNot": "Score below threshold" if total_score < MIN_TRADE_SCORE else "",
            "risk": "",
            "probability": "",
            "marketPsychology": "",
            "institutionalActivity": "",
            "expectedMovement": "",
            "alternativeScenario": "",
            "invalidationPoint": "",
        }
        warnings: list[str] = []
        not_to_trade: list[str] = []

        if include_ai:
            context = {
                "symbol": symbol,
                "timeframe": timeframe,
                "score": total_score,
                "market_status": market_status,
                "signals": signals,
                "option_chain": option_chain_engine.get_full_analysis(),
            }

            ai_result = await ai_engine.analyze_trade(context)
            ai_reasoning = ai_result.get("reasoning", {})
            reasoning = {
                "whyTrade": ai_reasoning.get("why_trade", ""),
                "whyNot": ai_reasoning.get("why_not", ""),
                "risk": ai_reasoning.get("risk", ""),
                "probability": ai_reasoning.get("probability", ""),
                "marketPsychology": ai_reasoning.get("market_psychology", ""),
                "institutionalActivity": ai_reasoning.get("institutional_activity", ""),
                "expectedMovement": ai_reasoning.get("expected_movement", ""),
                "alternativeScenario": ai_reasoning.get("alternative_scenario", ""),
                "invalidationPoint": ai_reasoning.get("invalidation_point", ""),
            }
            warnings = ai_result.get("warnings", [])
            not_to_trade = ai_result.get("not_to_trade_reasons", [])

        # Calculate price levels
        spot = market_status.get("spot_price", 0)
        entry = ai_result.get("entry", spot) if include_ai and 'ai_result' in dir() else spot
        stop_loss = ai_result.get("stop_loss", spot * 0.995) if include_ai and 'ai_result' in dir() else spot * 0.995
        target1 = ai_result.get("target1", spot * 1.005) if include_ai and 'ai_result' in dir() else spot * 1.005
        target2 = ai_result.get("target2", spot * 1.01) if include_ai and 'ai_result' in dir() else spot * 1.01
        target3 = ai_result.get("target3", spot * 1.02) if include_ai and 'ai_result' in dir() else spot * 1.02

        risk = abs(entry - stop_loss)
        reward = abs(target1 - entry)
        risk_reward = round(reward / risk, 2) if risk > 0 else 0

        # Get confidence
        if total_score >= 90:
            confidence = "VERY_HIGH"
        elif total_score >= 75:
            confidence = "HIGH"
        elif total_score >= 60:
            confidence = "MODERATE"
        elif total_score >= 40:
            confidence = "LOW"
        else:
            confidence = "VERY_LOW"

        return {
            "score": int(total_score),
            "direction": direction,
            "confidence": confidence,
            "entry": round(entry, 2),
            "stop_loss": round(stop_loss, 2),
            "target1": round(target1, 2),
            "target2": round(target2, 2),
            "target3": round(target3, 2),
            "risk_reward": risk_reward,
            "trend": market_status.get("trend", "SIDEWAYS"),
            "reasoning": reasoning,
            "warnings": warnings,
            "not_to_trade_reasons": not_to_trade,
            "signals": signals,
            "timestamp": time.time(),
        }

    async def run_quick_analysis(self, symbol: str = "NIFTY") -> dict:
        """Quick analysis without AI — just signal scores."""
        chart_signal = chart_engine.get_signal_score()
        oc_signal = option_chain_engine.get_signal_score()
        smc_signal = smc_engine.get_signal_score()

        total = (
            chart_signal["score"] * WEIGHTS["trend"] / 100
            + oc_signal["score"] * WEIGHTS["option_chain"] / 100
            + 50 * WEIGHTS["volume"] / 100
            + smc_signal["score"] * WEIGHTS["smc"] / 100
            + chart_signal["score"] * WEIGHTS["indicators"] / 100
            + 50 * WEIGHTS["volatility"] / 100
        )

        return {
            "score": round(total),
            "trend": chart_signal["direction"],
            "chart": chart_signal,
            "option_chain": oc_signal,
            "smc": smc_signal,
            "timestamp": time.time(),
        }


# Singleton
trade_engine = TradeEngine()
