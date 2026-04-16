from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.dataset import MunicipalReport
from app.models.user import User
from app.core.rbac import RBAC
from app.services.crisis_engine import CrisisPredictionEngine

router = APIRouter()

@router.get("/metrics", dependencies=[Depends(RBAC.has_role(["admin", "gov_agent"]))])
async def get_command_center_metrics(db: AsyncSession = Depends(get_db)):
    """
    Returns high-level KPIs for the municipal command center.
    """
    # Total Active Cases (Submitted, Routed, In Progress)
    total_active_query = select(func.count(MunicipalReport.id)).where(
        MunicipalReport.status.in_(["submitted", "routed", "in_progress"])
    )
    total_active = (await db.execute(total_active_query)).scalar() or 0

    # Resolved Cases
    resolved_query = select(func.count(MunicipalReport.id)).where(
        MunicipalReport.status == "resolved"
    )
    resolved = (await db.execute(resolved_query)).scalar() or 0

    # Escalated Cases
    escalated_query = select(func.count(MunicipalReport.id)).where(
        MunicipalReport.status == "escalated"
    )
    escalated = (await db.execute(escalated_query)).scalar() or 0

    # Category Breakdown
    category_query = select(MunicipalReport.category, func.count(MunicipalReport.id)).group_by(MunicipalReport.category)
    categories = (await db.execute(category_query)).all()
    category_map = {cat: count for cat, count in categories}

    return {
        "summary": {
            "active_cases": total_active,
            "resolved_today": resolved,
            "escalations": escalated,
            "avg_response_time": "3.2 days" # Mocked for now
        },
        "categories": category_map
    }

@router.get("/live-cases", dependencies=[Depends(RBAC.has_role(["admin", "gov_agent"]))])
async def get_live_cases(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns recent cases for the live feed.
    """
    stmt = select(MunicipalReport).order_by(desc(MunicipalReport.created_at)).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()
