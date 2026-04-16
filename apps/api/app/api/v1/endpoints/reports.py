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
from app.services.munifix_engine import generate_report

log = structlog.get_logger()
router = APIRouter()


@router.post("/generate", response_model=ReportGenerateResponse, status_code=201)
async def generate_municipal_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report_data = generate_report(
        description=payload.description,
        location=payload.location,
        municipality=payload.municipality,
    )

    report = MunicipalReport(
        user_id=current_user.id,
        category=report_data["category"],
        urgency_score=report_data["urgency_score"],
        location=payload.location,
        description=payload.description,
        municipality=payload.municipality,
        suggested_department=report_data["suggested_department"],
        generated_report=report_data["generated_report"],
        status="draft",
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    await log_action(
        db,
        "REPORT_GENERATED",
        user_id=current_user.id,
        metadata={"report_id": report.id, "category": report.category, "urgency": report.urgency_score},
    )

    log.info("Municipal report generated", report_id=report.id, category=report.category)

    return ReportGenerateResponse(
        report_id=report.id,
        category=report.category,
        urgency_score=report.urgency_score,
        municipality=report.municipality,
        suggested_department=report.suggested_department,
        generated_report=report.generated_report,
        status=report.status,
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
