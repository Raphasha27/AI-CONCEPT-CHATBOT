"""
Admin-only endpoints — users, audit logs, system stats.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.dataset import AuditLog, MunicipalReport, VerificationRecord
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas import AuditLogResponse, UserResponse

router = APIRouter()


@router.get("/stats")
async def system_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    user_count = (await db.execute(select(func.count()).select_from(User))).scalar_one()
    vr_count = (await db.execute(select(func.count()).select_from(VerificationRecord))).scalar_one()
    report_count = (await db.execute(select(func.count()).select_from(MunicipalReport))).scalar_one()
    audit_count = (await db.execute(select(func.count()).select_from(AuditLog))).scalar_one()

    return {
        "users": user_count,
        "verification_queries": vr_count,
        "municipal_reports": report_count,
        "audit_events": audit_count,
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    repo = UserRepository(db)
    return await repo.list_all(skip=skip, limit=limit)


@router.patch("/users/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    from fastapi import HTTPException
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    repo = UserRepository(db)
    user = await repo.deactivate(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/audit-logs", response_model=list[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
