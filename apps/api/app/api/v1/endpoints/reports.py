"""
Municipal report generation endpoints.
"""
import structlog
from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.dataset import AuditLog, MunicipalReport
from app.models.user import User
from app.schemas import MunicipalReportResponse, ReportGenerateRequest, ReportGenerateResponse
from app.services.audit_service import log_action
from app.services.munifix_engine import generate_report_ai

log = structlog.get_logger()
router = APIRouter()


@router.post("/generate", response_model=ReportGenerateResponse, status_code=201)
async def generate_municipal_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report_data = await generate_report_ai(
        description=payload.description,
        location=payload.location,
        municipality=payload.municipality,
        ward=payload.ward,
        households=payload.households_affected,
        severity=1, # base severity, AI will adjust
        language="English" # Could be dynamic later
    )

    report = MunicipalReport(
        user_id=current_user.id,
        category=report_data["category"],
        urgency_score=report_data["urgency_score"],
        location=payload.location,
        latitude=payload.latitude,
        longitude=payload.longitude,
        ward=payload.ward,
        households_affected=payload.households_affected,
        description=payload.description,
        municipality=payload.municipality,
        suggested_department=report_data["suggested_department"],
        generated_report=report_data["generated_report"],
        evidence_urls=payload.evidence_urls,
        is_anonymous=payload.is_anonymous,
        status="submitted",
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    # 3. Trigger Autonomous Agnet Operations (Semi-autonomous routing)
    from app.services.agent_system import AutonomousGovAgent
    await AutonomousGovAgent.process_new_complaint(db, report)

    await log_action(
        db,
        "REPORT_GENERATED",
        user_id=current_user.id,
        metadata={"report_id": report.id, "category": report.category, "urgency": report.urgency_score, "tracking_id": str(report.tracking_id)},
    )

    log.info("Municipal report generated", report_id=report.id, tracking_id=report.tracking_id)

    return ReportGenerateResponse(
        report_id=report.id,
        tracking_id=report.tracking_id,
        category=report.category,
        urgency_score=report.urgency_score,
        municipality=report.municipality,
        suggested_department=report.suggested_department,
        generated_report=report.generated_report,
        status=report.status,
        created_at=report.created_at,
    )


@router.get("/", response_model=list[MunicipalReportResponse])
async def list_my_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MunicipalReport)
        .where(MunicipalReport.user_id == current_user.id)
        .order_by(MunicipalReport.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/{report_id}", response_model=MunicipalReportResponse)
async def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(
        select(MunicipalReport).where(
            MunicipalReport.id == report_id,
            MunicipalReport.user_id == current_user.id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/feed", response_model=list[MunicipalReportResponse])
async def get_community_feed(
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    result = await db.execute(
        select(MunicipalReport)
        .order_by(MunicipalReport.created_at.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/track/{tracking_id}", response_model=MunicipalReportResponse)
async def get_report_by_tracking_id(
    tracking_id: str,
    db: AsyncSession = Depends(get_db),
):
    import uuid
    from fastapi import HTTPException
    try:
        t_id = uuid.UUID(tracking_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid tracking ID format")

    result = await db.execute(
        select(MunicipalReport).where(MunicipalReport.tracking_id == t_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/{report_id}/upvote", status_code=200)
async def upvote_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException
    result = await db.execute(
        select(MunicipalReport).where(MunicipalReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report.upvotes += 1
    await db.commit()
    return {"status": "success", "upvotes": report.upvotes}
