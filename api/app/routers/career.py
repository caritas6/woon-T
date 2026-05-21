import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.saju import SajuProfile, Report
from app.schemas.career import CareerAnalyzeRequest, CareerReportOut, ChatRequest, ChatResponse, DailyFortuneOut
from app.services.saju_engine import calculate_saju
from app.services.ai_counselor import analyze_career, chat_followup, generate_daily_fortune
from app.core.dependencies import get_current_user, require_pro
from datetime import date

router = APIRouter(prefix="/career", tags=["진로 분석"])


async def _run_analysis(report_id: uuid.UUID, saju_profile: SajuProfile, situation: str | None, db: AsyncSession):
    """백그라운드 AI 분석 태스크"""
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        return

    try:
        report.status = "processing"
        await db.commit()

        saju = calculate_saju(
            birth_date=saju_profile.birth_date,
            birth_hour=saju_profile.birth_hour,
            gender=saju_profile.gender,
            situation=situation,
        )

        analysis = await analyze_career(saju, situation)

        report.status = "done"
        report.analysis_data = analysis
        report.ai_tokens_used = (
            analysis.get("_meta", {}).get("input_tokens", 0)
            + analysis.get("_meta", {}).get("output_tokens", 0)
        )
        report.completed_at = datetime.now(timezone.utc)
    except Exception as e:
        report.status = "failed"
        report.analysis_data = {"error": str(e)}
    finally:
        await db.commit()


@router.post("/analyze", response_model=CareerReportOut, status_code=202)
async def analyze(
    body: CareerAnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    AI 진로 분석 요청 — 비동기 처리 (202 Accepted)
    결과는 GET /career/report/{report_id} 로 폴링
    FREE: 월 1회 / PRO: 무제한
    """
    profile_result = await db.execute(
        select(SajuProfile).where(
            SajuProfile.id == body.saju_profile_id,
            SajuProfile.user_id == user.id,
        )
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="사주 프로필을 찾을 수 없습니다")

    report = Report(
        user_id=user.id,
        saju_profile_id=profile.id,
        situation=body.situation,
        is_paid=user.subscription_tier.value != "free",
    )
    db.add(report)
    await db.flush()
    await db.refresh(report)

    background_tasks.add_task(_run_analysis, report.id, profile, body.situation, db)

    return CareerReportOut(
        report_id=str(report.id),
        status=report.status,
        created_at=report.created_at,
    )


@router.get("/report/{report_id}", response_model=CareerReportOut)
async def get_report(
    report_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """리포트 조회 (폴링용 — status가 done일 때 analysis 포함)"""
    result = await db.execute(
        select(Report).where(Report.id == report_id, Report.user_id == user.id)
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="리포트를 찾을 수 없습니다")

    return CareerReportOut(
        report_id=str(report.id),
        status=report.status,
        analysis=report.analysis_data,
        pdf_url=report.pdf_url,
        created_at=report.created_at,
        completed_at=report.completed_at,
    )


@router.get("/history", response_model=list[CareerReportOut])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Report)
        .where(Report.user_id == user.id)
        .order_by(Report.created_at.desc())
        .limit(20)
    )
    reports = result.scalars().all()
    return [
        CareerReportOut(
            report_id=str(r.id),
            status=r.status,
            pdf_url=r.pdf_url,
            created_at=r.created_at,
            completed_at=r.completed_at,
        )
        for r in reports
    ]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_pro),  # PRO 이상만 접근 가능
):
    """AI 진로 상담 대화 — PRO 전용"""
    result = await db.execute(
        select(Report).where(Report.id == body.report_id, Report.user_id == user.id)
    )
    report = result.scalar_one_or_none()
    if not report or report.status != "done":
        raise HTTPException(status_code=400, detail="완료된 리포트가 필요합니다")

    analysis = report.analysis_data or {}
    saju_summary = f"페르소나: {analysis.get('one_liner', '')}, 1순위 직군: {analysis.get('career_analysis', {}).get('primary', {}).get('field', '')}"

    reply = await chat_followup([], body.message, saju_summary)
    return ChatResponse(reply=reply, report_id=str(report.id))


@router.get("/today", response_model=DailyFortuneOut)
async def daily_fortune(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """오늘의 운세 점수 (홈 화면용)"""
    profile_result = await db.execute(
        select(SajuProfile)
        .where(SajuProfile.user_id == user.id, SajuProfile.is_primary == True)
        .limit(1)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="사주 프로필을 먼저 등록해주세요")

    fortune = await generate_daily_fortune(
        ilgan_element=profile.ilgan_element,
        yongsin=profile.yongsin or "水",
        today_str=date.today().isoformat(),
    )
    from app.utils.constants import ELEMENT_CAREERS
    fortune["recommended_jobs"] = ELEMENT_CAREERS.get(profile.ilgan_element, [])[:4]
    return DailyFortuneOut(**fortune)
