import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.database import get_db
from app.models.user import User
from app.models.saju import SajuProfile, Report
from app.schemas.career import CareerAnalyzeRequest, CareerReportOut, ChatRequest, ChatResponse, DailyFortuneOut
from app.services.saju_engine import calculate_saju
from app.services.ai_counselor import analyze_career, chat_followup, generate_daily_fortune
from app.services.email_service import send_analysis_done
from app.core.dependencies import get_current_user, require_pro

limiter = Limiter(key_func=get_remote_address)
from datetime import date

router = APIRouter(prefix="/career", tags=["진로 분석"])


async def _run_analysis(
    report_id: uuid.UUID,
    saju_profile: SajuProfile,
    situation: str | None,
    db: AsyncSession,
    user_email: str = "",
    user_nickname: str = "",
):
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
        await db.commit()

        # 분석 완료 이메일 (비블로킹 — 실패해도 메인 플로우에 영향 없음)
        if user_email:
            try:
                one_liner = analysis.get("one_liner", "사주 기반 진로 분석이 완료됐습니다.")
                await send_analysis_done(
                    to=user_email,
                    nickname=user_nickname,
                    report_id=str(report_id),
                    one_liner=one_liner,
                )
            except Exception:
                pass  # 이메일 실패는 무시

    except Exception as e:
        report.status = "failed"
        report.analysis_data = {"error": str(e)}
        await db.commit()


@router.post("/analyze", response_model=CareerReportOut, status_code=202)
@limiter.limit("3/minute")   # AI 비용 보호 — IP당 분당 3회
async def analyze(
    request: Request,
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

    background_tasks.add_task(
        _run_analysis,
        report.id,
        profile,
        body.situation,
        db,
        user.email,
        user.nickname or "",
    )

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
