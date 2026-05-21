import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.models.saju import SajuProfile
from app.schemas.saju import SajuCalculateRequest, SajuResultOut, PillarOut, DaeunOut
from app.services.saju_engine import calculate_saju, Pillar, DaeunPeriod
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/saju", tags=["사주 분석"])


def _pillar_to_out(p: Pillar) -> PillarOut:
    return PillarOut(
        stem=p.stem, branch=p.branch,
        stem_kr=p.stem_kr, branch_kr=p.branch_kr,
        stem_element=p.stem_element, branch_element=p.branch_element,
    )


def _daeun_to_out(d: DaeunPeriod) -> DaeunOut:
    return DaeunOut(
        start_age=d.start_age, stem=d.stem, branch=d.branch,
        element=d.element, relationship=d.relationship,
    )


@router.post("/calculate", response_model=SajuResultOut)
async def calculate(
    body: SajuCalculateRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """사주 계산 및 저장 — 로그인 필수"""
    result = calculate_saju(
        birth_date=body.birth_date,
        birth_hour=body.birth_hour,
        gender=body.gender,
        situation=body.situation,
    )
    el = result.elements

    # DB 저장
    profile = SajuProfile(
        user_id=user.id,
        birth_date=body.birth_date,
        birth_hour=body.birth_hour,
        gender=body.gender,
        situation=body.situation,
        year_stem=result.pillars.year.stem,
        year_branch=result.pillars.year.branch,
        month_stem=result.pillars.month.stem,
        month_branch=result.pillars.month.branch,
        day_stem=result.pillars.day.stem,
        day_branch=result.pillars.day.branch,
        hour_stem=result.pillars.hour.stem if result.pillars.hour else None,
        hour_branch=result.pillars.hour.branch if result.pillars.hour else None,
        element_wood=el.wood, element_fire=el.fire, element_earth=el.earth,
        element_metal=el.metal, element_water=el.water,
        ilgan_element=result.ilgan_element,
        gyeokguk=result.gyeokguk,
        yongsin=result.yongsin,
        persona_type=result.persona.get("name"),
        daeun_data=[
            {"start_age": d.start_age, "stem": d.stem, "branch": d.branch, "element": d.element}
            for d in result.daeun_list
        ],
    )
    db.add(profile)
    await db.flush()
    await db.refresh(profile)

    return SajuResultOut(
        profile_id=str(profile.id),
        year=_pillar_to_out(result.pillars.year),
        month=_pillar_to_out(result.pillars.month),
        day=_pillar_to_out(result.pillars.day),
        hour=_pillar_to_out(result.pillars.hour) if result.pillars.hour else None,
        elements=el.to_dict(),
        ilgan=result.ilgan,
        ilgan_element=result.ilgan_element,
        gyeokguk=result.gyeokguk,
        yongsin=result.yongsin,
        persona=result.persona,
        career_matches=result.career_matches,
        daeun_list=[_daeun_to_out(d) for d in result.daeun_list],
        ten_gods=result.ten_gods,
    )


@router.post("/quick", response_model=SajuResultOut)
async def quick_calculate(body: SajuCalculateRequest):
    """비회원용 빠른 사주 계산 — 저장 없음 (프리미엄 기능 티저)"""
    result = calculate_saju(
        birth_date=body.birth_date,
        birth_hour=body.birth_hour,
        gender=body.gender,
    )
    el = result.elements
    # 비회원: 직무 매칭 2개만 노출 (나머지는 회원가입 유도)
    limited_careers = result.career_matches[:2]
    return SajuResultOut(
        profile_id="guest",
        year=_pillar_to_out(result.pillars.year),
        month=_pillar_to_out(result.pillars.month),
        day=_pillar_to_out(result.pillars.day),
        hour=_pillar_to_out(result.pillars.hour) if result.pillars.hour else None,
        elements=el.to_dict(),
        ilgan=result.ilgan,
        ilgan_element=result.ilgan_element,
        gyeokguk=result.gyeokguk,
        yongsin=result.yongsin,
        persona=result.persona,
        career_matches=limited_careers,
        daeun_list=[],
        ten_gods={},
    )


@router.get("/profiles", response_model=list[dict])
async def list_profiles(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """내 사주 프로필 목록"""
    result = await db.execute(
        select(SajuProfile)
        .where(SajuProfile.user_id == user.id)
        .order_by(SajuProfile.created_at.desc())
    )
    profiles = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "birth_date": p.birth_date.isoformat(),
            "gender": p.gender,
            "persona_type": p.persona_type,
            "ilgan_element": p.ilgan_element,
            "is_primary": p.is_primary,
            "created_at": p.created_at.isoformat(),
        }
        for p in profiles
    ]
