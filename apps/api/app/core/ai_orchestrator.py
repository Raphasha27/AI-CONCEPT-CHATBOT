import json
import structlog
from typing import Any, Dict, List, Optional
from openai import AsyncOpenAI
from app.core.config import settings

log = structlog.get_logger()
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

class AIOrchestrator:
    """
    Central AI Brain — handles prompt orchestration, multi-modal routing, 
    and output normalization for all modules (MuniFix, SpazaAI, QueueLess).
    """

    @staticmethod
    async def process(
        system_prompt: str,
        user_input: str,
        response_format: str = "text",
        model: Optional[str] = None
    ) -> Any:
        if not client:
            log.warning("AI client not configured, falling back to basic processing")
            return None

        try:
            options: Dict[str, Any] = {
                "model": model or settings.OPENAI_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input},
                ],
                "temperature": 0.2,
            }

            if response_format == "json":
                options["response_format"] = {"type": "json_object"}

            response = await client.chat.completions.create(**options)
            content = response.choices[0].message.content

            if response_format == "json":
                return json.loads(content)
            return content

        except Exception as e:
            log.error("AI processing failed", error=str(e))
            return None

    @classmethod
    async def get_complaint_report(cls, data: Dict[str, Any]) -> str:
        prompt = """You are a South African Civic Legal Expert. 
        Convert the following user complaint into a formal municipal report.
        Strictly use professional South African bureaucratic English.
        Include references to the Constitution and relevant Local Government Acts."""
        
        return await cls.process(prompt, json.dumps(data))

    @classmethod
    async def get_taxMate_advice(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = """You are a SARS Tax Consultant specializing in Turnover Tax.
        Analyze the turnover data and provide:
        1. Tax saving tips
        2. Compliance warnings
        3. Simple explanation of the current bracket.
        Output as JSON only: {"tips": [], "warnings": [], "explanation": ""}"""
        
        return await cls.process(prompt, json.dumps(data), response_format="json")

    @classmethod
    async def get_concierge_help(cls, query: str) -> str:
        prompt = """You are a South African Government Concierge. 
        Provide a step-by-step checklist for the requested service (DHA, SASSA, etc.).
        Be precise about required documents (Originals vs Copies)."""
        
        return await cls.process(prompt, query)
