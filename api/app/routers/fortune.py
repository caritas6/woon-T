from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date
from app.database import get_db
from app.models.user import User
from app.models.saju import SajuProfile
from app.services.saju_engine import calculate_saju
from app.services.fortune_calculator import get_monthly_calendar, get_yearly_daeun_overview
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/fortune", tags=["운세 캘린더"])


async def _get_primary_profile(user: User, db: AsyncSession) -> SajuProfile:
    result = await db.execute(
        select(SajuProfile)
        .where(SajuProfile.user_id == user.id, SajuProfile.is_primary == True)
        .limit(1)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="사주 프로필을 먼저 등록해주세요")
    return profile


@router.get("/calendar/{year}/{month}")
async def monthly_calendar(
    year: int,
    month: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """월간 운세 캘린더 — 길일/주의일 표시"""
    if not (1 <= month <= 12) or year < 2020 or year > 2050:
        raise HTTPException(status_code=400, detail="유효하지 않은 연도/월입니다")

    profile = await _get_primary_profile(user, db)
    saju = calculate_saju(
        birth_date=profile.birth_date,
        birth_hour=profile.birth_hour,
        gender=profile.gender,
    )
    return get_monthly_calendar(saju, year, month)


@router.get("/yearly/{year}")
async def yearly_overview(
    year: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """세운(歲運) 분석 — 특정 연도 커리어 흐름"""
    profile = await _get_primary_profile(user, db)
    saju = calculate_saju(
        birth_date=profile.birth_date,
        birth_hour=profile.birth_hour,
        gender=profile.gender,
    )
    return get_yearly_daeun_overview(saju, year)


@router.get("/daeun")
async def daeun_overview(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """대운(大運) 전체 흐름 — 10년 단위"""
    profile = await _get_primary_profile(user, db)
    if not profile.daeun_data:
        raise HTTPException(status_code=404, detail="대운 데이터가 없습니다")

    current_age = date.today().year - profile.birth_date.year
    current_daeun = next(
        (d for d in reversed(profile.daeun_data) if d["start_age"] <= current_age),
        profile.daeun_data[0] if profile.daeun_data else None,
    )

    return {
        "daeun_list": profile.daeun_data,
        "current_age": current_age,
        "current_daeun": current_daeun,
    }
