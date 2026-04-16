from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.auth import Tenant
from app.models.dataset import MunicipalReport
from app.core.rbac import RBAC

router = APIRouter()

@router.get("/status", dependencies=[Depends(RBAC.has_role(["admin"]))])
async def get_national_status(db: AsyncSession = Depends(get_db)):
    """
    Aggregates data across all tenants (cities) for the National Control Tower.
    """
    # 1. Load all municipal tenants
    stmt = select(Tenant)
    result = await db.execute(stmt)
    tenants = result.scalars().all()

    city_stats = []
    total_national_cases = 0
    total_national_resolved = 0

    for tenant in tenants:
        # In a real app, we'd query per tenant. 
        # Here we'll simulate aggregation logic
        q_count = select(func.count(MunicipalReport.id)).where(MunicipalReport.ward.like(f"%{tenant.name}%"))
        count = (await db.execute(q_count)).scalar() or 0
        
        risk_score = 40 + (count % 60) # Simulated risk score
        
        city_stats.append({
            "id": tenant.id,
            "name": tenant.name,
            "risk_score": risk_score,
            "status": "CRITICAL" if risk_score > 80 else "STABLE",
            "active_cases": count
        })
        total_national_cases += count

    return {
        "national_health_index": 72, # Overall country score
        "total_active_cases": total_national_cases,
        "cities": city_stats,
        "active_alerts": [
            {"city": "Johannesburg", "type": "Water Outage", "severity": "HIGH"},
            {"city": "Tshwane", "type": "Grid Instability", "severity": "CRITICAL"}
        ]
    }
