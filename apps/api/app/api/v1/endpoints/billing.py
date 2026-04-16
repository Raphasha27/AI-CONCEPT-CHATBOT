from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.saas import Subscription, UsageEvent
from app.models.user import User

router = APIRouter()

PLAN_FEATURES = {
    "free": ["complaints", "tax_basic"],
    "pro": ["complaints", "tax_pro", "queueless", "command_center"],
    "enterprise": ["all"]
}

@router.get("/subscription")
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Returns the subscription status and allowed features for the current tenant.
    """
    if not current_user.tenant_id:
        return {"plan": "free", "status": "active", "features": PLAN_FEATURES["free"]}
    
    stmt = select(Subscription).where(Subscription.tenant_id == current_user.tenant_id)
    result = await db.execute(stmt)
    sub = result.scalar_one_or_none()
    
    plan = sub.plan if sub else "free"
    
    return {
        "plan": plan,
        "status": sub.status if sub else "active",
        "current_period_end": sub.current_period_end if sub else None,
        "features": PLAN_FEATURES.get(plan, PLAN_FEATURES["free"]) if plan != "enterprise" else PLAN_FEATURES["enterprise"]
    }

@router.get("/usage")
async def get_usage_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns usage metrics (AI calls, etc.) for the current tenant.
    """
    if not current_user.tenant_id:
        raise HTTPException(status_code=400, detail="User has no tenant")
        
    stmt = select(UsageEvent).where(UsageEvent.tenant_id == current_user.tenant_id)
    result = await db.execute(stmt)
    return result.scalars().all()

def check_feature_access(feature: str):
    """
    Dependency to gate routes by plan features.
    """
    async def dependency(
        sub: Dict[str, Any] = Depends(get_my_subscription)
    ):
        if "all" in sub["features"]:
            return True
        if feature not in sub["features"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Feature '{feature}' is not available on your {sub['plan']} plan. Upgrade to unlock."
            )
        return True
    return dependency
