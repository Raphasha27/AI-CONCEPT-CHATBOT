"""
RAG Engine — OpenAI embeddings + pgvector similarity search + GPT-4o answer generation.
"""
import json
from typing import Optional

import structlog
from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

log = structlog.get_logger()

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

SA_SYSTEM_PROMPT = """You are VerifyZA, a South African AI compliance and accreditation assistant.

Your ONLY role is to help users verify whether a person, business, school, or training provider 
is properly registered/accredited in South Africa.

STRICT RULES:
1. NEVER fabricate or guess official registration status.
2. If you cannot confirm from provided context, say "Not confirmed - unable to verify."
3. Always cite which dataset/source you used.
4. Always provide recommended next steps.
5. Respond in clear, plain English suitable for all literacy levels.
6. If the user writes in isiZulu, isiXhosa, Afrikaans, or Sesotho — respond in the same language.

RESPONSE FORMAT (JSON):
{
  "status": "verified | unverified | uncertain",
  "confidence": 0.0 to 1.0,
  "summary": "Clear summary of what was found",
  "sources": ["dataset names used"],
  "recommended_action": "What the user should do next"
}

MUNICIPAL / CIVIC QUERIES:
If the user describes a municipal problem (water, electricity, potholes, sewage), 
switch to MuniFix mode and help them generate a proper complaint report.

VERIFICATION BODIES IN SOUTH AFRICA:
- HPCSA (Health Professions Council) — medical professionals
- SAQA (South African Qualifications Authority) — qualifications
- DBE (Department of Basic Education) — schools  
- CIPC (Companies and Intellectual Property Commission) — businesses
- CIDB (Construction Industry Development Board) — contractors
- SACE (South African Council for Educators) — teachers
- SACAP (South African Council for the Architectural Profession) — architects
- ECSA (Engineering Council of South Africa) — engineers
"""

MUNIFIX_CIVIC_KEYWORDS = [
    "water", "electricity", "pothole", "sewage", "dump", "rubbish",
    "streetlight", "power outage", "pipe burst", "municipal", "municipality",
    "broken road", "unsafe building",
]


def _is_civic_query(message: str) -> bool:
    msg = message.lower()
    return any(kw in msg for kw in MUNIFIX_CIVIC_KEYWORDS)


async def get_embedding(text: str) -> list[float]:
    """Generate OpenAI embedding for a text."""
    if not client:
        return [0.0] * 1536  # fallback for no API key

    response = await client.embeddings.create(
        model=settings.OPENAI_EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


async def retrieve_relevant_documents(
    db: AsyncSession,
    query_embedding: list[float],
    top_k: int = 4,
) -> list[dict]:
    """Retrieve top-k documents using pgvector cosine similarity."""
    try:
        embedding_str = f"[{','.join(str(x) for x in query_embedding)}]"
        result = await db.execute(
            text("""
                SELECT d.title, d.content, ds.name as dataset_name, ds.source,
                       1 - (d.embedding <=> :embedding::vector) as similarity
                FROM dataset_documents d
                JOIN datasets ds ON ds.id = d.dataset_id
                WHERE d.embedding IS NOT NULL
                ORDER BY d.embedding <=> :embedding::vector
                LIMIT :top_k
            """),
            {"embedding": embedding_str, "top_k": top_k},
        )
        rows = result.fetchall()
        return [
            {
                "title": row.title,
                "content": row.content,
                "dataset_name": row.dataset_name,
                "source": row.source,
                "similarity": float(row.similarity),
            }
            for row in rows
        ]
    except Exception as e:
        log.warning("Vector search failed", error=str(e))
        return []


async def generate_rag_answer(
    query: str,
    context_docs: list[dict],
    db: Optional[AsyncSession] = None,
) -> dict:
    """Generate a GPT-4o answer with RAG context."""
    if not client:
        return _fallback_response(query)

    if _is_civic_query(query):
        return await _generate_civic_response(query)

    context_text = "\n\n".join(
        [
            f"[Source: {doc['dataset_name']}]\n{doc['content'][:800]}"
            for doc in context_docs
        ]
    ) if context_docs else "No relevant dataset documents found."

    sources = list({doc["dataset_name"] for doc in context_docs})

    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SA_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"User query: {query}\n\nRetrieved context:\n{context_text}",
                },
            ],
            temperature=0.1,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        result = json.loads(raw)
        result["sources"] = sources or result.get("sources", [])
        return result

    except Exception as e:
        log.error("OpenAI call failed", error=str(e))
        return _fallback_response(query)


async def _generate_civic_response(query: str) -> dict:
    """Handle civic/municipal queries."""
    from app.services.munifix_engine import detect_category, compute_urgency, DEPARTMENTS
    category = detect_category(query)
    urgency = compute_urgency(query)
    department = DEPARTMENTS.get(category, "General Municipal Services")

    return {
        "status": "uncertain",
        "confidence": 0.6,
        "summary": (
            f"I detected a municipal service issue: **{category.replace('_', ' ').title()}**.\n\n"
            f"Urgency: {urgency}/5 | Responsible: {department}.\n\n"
            "Use the Report Generator to create an official complaint."
        ),
        "sources": ["MuniFix AI Rules Engine"],
        "recommended_action": (
            f"Visit the Report Generator page to create a formal complaint to your municipality's "
            f"{department}. If urgent (score 4-5), call your municipality emergency line immediately."
        ),
    }


def _fallback_response(query: str) -> dict:
    return {
        "status": "uncertain",
        "confidence": 0.0,
        "summary": (
            "I was unable to process your query at this time. "
            "The AI service may not be configured. Please contact your administrator."
        ),
        "sources": [],
        "recommended_action": (
            "Please try again later or contact the platform administrator. "
            "You can also visit the relevant official body's website directly."
        ),
    }
