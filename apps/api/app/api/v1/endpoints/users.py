"""
User self-service endpoints — profile, verification history.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.dataset import VerificationRecord
from app.models.user import User

router = APIRouter()


@router.get("/me/verifications")
async def my_verifications(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(VerificationRecord)
        .where(VerificationRecord.user_id == current_user.id)
        .order_by(VerificationRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    records = result.scalars().all()
    return [
        {
            "id": r.id,
            "query": r.query,
            "status": r.status,
            "confidence": r.confidence,
            "summary": r.response_summary,
            "sources": r.sources,
            "recommended_action": r.recommended_action,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ]
