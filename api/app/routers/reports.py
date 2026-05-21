import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.saju import SajuProfile, Report
from app.services.pdf_generator import generate_pdf_bytes
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["리포트"])


@router.get("/{report_id}/pdf")
async def download_pdf(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """완료된 리포트를 PDF로 다운로드"""
    report_result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == user.id)
    )
    report = report_result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="리포트를 찾을 수 없습니다")
    if report.status != "done":
        raise HTTPException(status_code=400, detail="분석이 완료된 후 PDF를 다운로드할 수 있습니다")

    profile_result = await db.execute(
        select(SajuProfile).where(SajuProfile.id == report.saju_profile_id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="사주 프로필을 찾을 수 없습니다")

    pdf_bytes = generate_pdf_bytes(profile, report)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="woont-report-{report_id}.pdf"'},
    )
