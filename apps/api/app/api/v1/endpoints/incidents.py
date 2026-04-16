from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.dataset import MunicipalReport

router = APIRouter()

@router.get("/")
async def get_incidents(db: AsyncSession = Depends(get_db)):
    """
    Returns a simplified list of infrastructure incidents for the SaaS dashboard.
    """
    stmt = select(MunicipalReport).order_by(desc(MunicipalReport.created_at)).limit(50)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "type": r.category,
            "description": r.description,
            "risk_score": r.urgency_score,
            "status": r.status,
            "created_at": r.created_at
        }
        for r in reports
    ]

@router.post("/analyze")
async def analyze_incident(payload: dict):
    """
    Simple SaaS analysis endpoint for incident text.
    """
    text = payload.get("text", "")
    # Simulation based on text length and keywords as per user's production example
    score = min(100, len(text) % 97 + 20)
    if "water" in text.lower(): score = max(score, 80)
    if "electricity" in text.lower(): score = max(score, 70)
    
    return {
        "category": "infrastructure",
        "risk_score": score,
        "priority": "HIGH" if score > 70 else "MEDIUM"
    }
