"""운세 캘린더 — 월간/일간 운세 계산 (대운·세운 기반)"""
from datetime import date, timedelta
from app.services.saju_engine import SajuResult
from app.utils.constants import STEM_ELEMENT, BRANCH_ELEMENT, ELEMENT_GENERATES, ELEMENT_CONTROLS


def _harmony_score(el1: str, el2: str) -> float:
    """두 오행의 상생(生)·상극(剋) 관계 → -1 ~ +1 점수"""
    if ELEMENT_GENERATES.get(el1) == el2:
        return 1.0    # el1이 el2를 생함 → 길(吉)
    if ELEMENT_GENERATES.get(el2) == el1:
        return 0.7    # el2가 el1을 생함 → 길(吉)
    if ELEMENT_CONTROLS.get(el1) == el2:
        return -0.5   # el1이 el2를 극함 → 흉(凶)
    if ELEMENT_CONTROLS.get(el2) == el1:
        return -0.8   # el2가 el1을 극함 → 흉(凶)
    return 0.2        # 중립


def _day_fortune_score(saju: SajuResult, check_date: date) -> dict:
    """특정 날의 운세 점수 (0~100)"""
    # 날짜 오행: 60갑자 순환에서 일간·일지 오행 계산
    from app.services.saju_engine import calc_day_pillar
    day_pillar = calc_day_pillar(check_date)
    day_el = STEM_ELEMENT[day_pillar.stem]

    yongsin_el = saju.yongsin
    ilgan_el   = saju.ilgan_element

    # 용신과의 관계 50%, 일간과의 관계 30%, 랜덤 변동 20%
    import hashlib
    seed = int(hashlib.md5(f"{check_date}{saju.ilgan}".encode()).hexdigest(), 16) % 100
    random_factor = (seed - 50) * 0.1

    yongsin_score = _harmony_score(yongsin_el, day_el) * 50
    ilgan_score   = _harmony_score(ilgan_el, day_el) * 30
    base = 55 + yongsin_score + ilgan_score + random_factor
    final_score = max(20, min(95, int(base)))

    # 날 유형 분류
    if final_score >= 80:
        day_type = "lucky"      # 길일 (초록 도트)
    elif final_score >= 65:
        day_type = "good"       # 좋은 날
    elif final_score <= 35:
        day_type = "caution"    # 주의일 (빨간 도트)
    else:
        day_type = "normal"

    return {
        "date": check_date.isoformat(),
        "score": final_score,
        "day_type": day_type,
        "day_element": day_el,
    }


def get_monthly_calendar(saju: SajuResult, year: int, month: int) -> dict:
    """월별 운세 캘린더 데이터 생성"""
    from calendar import monthrange
    _, last_day = monthrange(year, month)

    days = []
    lucky_days = []
    caution_days = []
    peak_score = 0
    peak_date = None

    for day in range(1, last_day + 1):
        d = date(year, month, day)
        fortune = _day_fortune_score(saju, d)
        days.append(fortune)

        if fortune["day_type"] == "lucky":
            lucky_days.append(day)
        elif fortune["day_type"] == "caution":
            caution_days.append(day)

        if fortune["score"] > peak_score:
            peak_score = fortune["score"]
            peak_date = day

    # 이달 핵심 이벤트
    events = []
    if lucky_days:
        events.append({
            "type": "interview",
            "title": "면접·미팅 추천일",
            "dates": lucky_days[:3],
            "desc": "에너지가 높고 대인관계 운이 좋은 날입니다.",
        })
    if peak_date:
        events.append({
            "type": "peak",
            "title": "이달 최고 행운일",
            "dates": [peak_date],
            "desc": f"이달 중 기운이 가장 높은 날. 중요한 결정을 이날로 맞추세요.",
        })
    if caution_days:
        events.append({
            "type": "caution",
            "title": "에너지 보충 필요일",
            "dates": caution_days[:2],
            "desc": "무리한 새 시작보다 정리·계획에 집중하세요.",
        })

    return {
        "year": year,
        "month": month,
        "days": days,
        "lucky_days": lucky_days,
        "caution_days": caution_days,
        "peak_date": peak_date,
        "peak_score": peak_score,
        "events": events,
        "monthly_avg": round(sum(d["score"] for d in days) / len(days), 1),
    }


def get_yearly_daeun_overview(saju: SajuResult, target_year: int) -> dict:
    """세운(歲運) 분석 — 특정 연도 흐름"""
    from app.services.saju_engine import calc_year_pillar
    year_pillar = calc_year_pillar(target_year)
    year_el = STEM_ELEMENT[year_pillar.stem]

    harmony = _harmony_score(saju.yongsin, year_el)
    if harmony >= 0.7:
        outlook = "대호운 (大好運)"
        summary = "용신과 세운이 상생합니다. 커리어의 큰 도약을 준비할 최적의 시기입니다."
    elif harmony >= 0.2:
        outlook = "호운 (好運)"
        summary = "전반적으로 안정적인 흐름입니다. 새로운 도전을 시도하기 좋습니다."
    elif harmony >= -0.3:
        outlook = "평운 (平運)"
        summary = "큰 변화보다 내실을 다지는 시기입니다. 역량 개발에 집중하세요."
    else:
        outlook = "주의운 (注意運)"
        summary = "에너지 소모가 클 수 있습니다. 무리한 이직·창업보다 준비에 집중하세요."

    return {
        "year": target_year,
        "year_stem": year_pillar.stem,
        "year_branch": year_pillar.branch,
        "year_element": year_el,
        "outlook": outlook,
        "summary": summary,
        "best_quarter": "Q2" if harmony > 0 else "Q4",
        "career_focus": _career_focus_for_element(year_el),
    }


def _career_focus_for_element(el: str) -> str:
    mapping = {
        "木": "기획·창업·교육 분야 도전에 유리",
        "火": "영업·마케팅·네트워킹 확장 시기",
        "土": "안정화·내부 정비·인맥 관리 집중",
        "金": "성과 정리·협상·투자 결정에 유리",
        "水": "학습·리서치·전략 수립에 최적",
    }
    return mapping.get(el, "균형 잡힌 커리어 관리")
