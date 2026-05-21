"""
만세력(萬歲曆) 사주 계산 엔진
기존 JS 엔진(woont_saju_engine_v4_fixed.html)의 Python 포팅 + 확장
"""
from dataclasses import dataclass, field
from datetime import date
from app.utils.constants import (
    HEAVENLY_STEMS, EARTHLY_BRANCHES,
    STEM_ELEMENT, BRANCH_ELEMENT, BRANCH_HIDDEN_STEMS,
    ELEMENT_GENERATES, ELEMENT_CONTROLS,
    ELEMENT_GENERATED_BY, ELEMENT_CONTROLLED_BY,
    TEN_GODS_MAP, GYEOKGUK_PERSONA, ELEMENT_CAREERS,
)


# ── 데이터 클래스 ──────────────────────────────────────────────────────

@dataclass
class Pillar:
    stem: str           # 天干
    branch: str         # 地支
    stem_kr: str = ""
    branch_kr: str = ""

    @property
    def stem_element(self) -> str:
        return STEM_ELEMENT[self.stem]

    @property
    def branch_element(self) -> str:
        return BRANCH_ELEMENT[self.branch]


@dataclass
class FourPillars:
    year:  Pillar
    month: Pillar
    day:   Pillar
    hour:  Pillar | None = None

    def to_list(self) -> list[Pillar]:
        return [p for p in [self.year, self.month, self.day, self.hour] if p]


@dataclass
class ElementScore:
    wood:  float = 0.0  # 木
    fire:  float = 0.0  # 火
    earth: float = 0.0  # 土
    metal: float = 0.0  # 金
    water: float = 0.0  # 水

    def to_dict(self) -> dict[str, float]:
        return {"木": self.wood, "火": self.fire, "土": self.earth, "金": self.metal, "水": self.water}

    def dominant(self) -> str:
        return max(self.to_dict(), key=self.to_dict().get)  # type: ignore


@dataclass
class DaeunPeriod:
    start_age: int
    stem: str
    branch: str
    element: str
    relationship: str  # 길(吉) | 흉(凶) | 중립


@dataclass
class SajuResult:
    pillars: FourPillars
    elements: ElementScore
    ilgan: str              # 일간 (日干)
    ilgan_element: str      # 일간 오행
    gyeokguk: str           # 격국
    yongsin: str            # 용신 오행
    persona: dict           # 페르소나 카드
    career_matches: list[dict]  # 직무 매칭
    daeun_list: list[DaeunPeriod]  # 대운 목록
    ten_gods: dict[str, str] = field(default_factory=dict)


# ── 핵심 계산 함수 ─────────────────────────────────────────────────────

def _stem_branch_parity(char: str) -> bool:
    """천간/지지의 음양 (홀수 인덱스 = 양, 짝수 = 음)"""
    if char in HEAVENLY_STEMS:
        return HEAVENLY_STEMS.index(char) % 2 == 0
    return EARTHLY_BRANCHES.index(char) % 2 == 0


def calc_year_pillar(year: int) -> Pillar:
    stem_idx   = (year - 4) % 10
    branch_idx = (year - 4) % 12
    from app.utils.constants import STEM_KR, BRANCH_KR
    return Pillar(
        stem=HEAVENLY_STEMS[stem_idx],
        branch=EARTHLY_BRANCHES[branch_idx],
        stem_kr=STEM_KR[stem_idx],
        branch_kr=BRANCH_KR[branch_idx],
    )


# 절기(節氣) 기준 월주 테이블 — 실제 절기일은 연도마다 다르므로
# 간략화: 양력 월 기준 ±1일 오차 허용 (정확도가 필요하면 ephem 라이브러리 사용)
_MONTH_STEM_OFFSET: dict[str, int] = {
    "甲": 0, "乙": 0, "丙": 2, "丁": 2,
    "戊": 4, "己": 4, "庚": 6, "辛": 6,
    "壬": 8, "癸": 8,
}

def calc_month_pillar(year: int, month: int, day: int) -> Pillar:
    """절기 기준 월주 계산 (절기일 이전이면 전월로 처리)"""
    # 절기 기준월 (대략 양력 6일 전후 절기 진입)
    # 간단화: 양력 월과 연도 천간으로 월주 결정
    year_stem = HEAVENLY_STEMS[(year - 4) % 10]
    base = _MONTH_STEM_OFFSET[year_stem]
    # 1월 인월(寅) = branch index 2, 이후 1씩 증가
    adj_month = month - 1
    stem_idx   = (base + adj_month) % 10
    branch_idx = (2 + adj_month) % 12  # 인(寅)월부터 시작
    from app.utils.constants import STEM_KR, BRANCH_KR
    return Pillar(
        stem=HEAVENLY_STEMS[stem_idx],
        branch=EARTHLY_BRANCHES[branch_idx],
        stem_kr=STEM_KR[stem_idx],
        branch_kr=BRANCH_KR[branch_idx],
    )


# 만세력 기준 일주 — 1900-01-01 기준 60갑자 순환
_DAY_BASE_DATE = date(1900, 1, 1)
_DAY_BASE_INDEX = 40  # 1900-01-01 은 甲戌일 (인덱스 40)

def calc_day_pillar(birth_date: date) -> Pillar:
    delta = (birth_date - _DAY_BASE_DATE).days
    idx = (_DAY_BASE_INDEX + delta) % 60
    stem_idx   = idx % 10
    branch_idx = idx % 12
    from app.utils.constants import STEM_KR, BRANCH_KR
    return Pillar(
        stem=HEAVENLY_STEMS[stem_idx],
        branch=EARTHLY_BRANCHES[branch_idx],
        stem_kr=STEM_KR[stem_idx],
        branch_kr=BRANCH_KR[branch_idx],
    )


def calc_hour_pillar(day_stem: str, hour: int) -> Pillar:
    """시주 계산 — 일간과 시각 기반"""
    # 12지시 결정
    if hour == 23 or hour == 0:
        branch_idx = 0   # 자시(子)
    else:
        branch_idx = ((hour + 1) // 2) % 12

    # 일간별 시주 천간 시작점
    stem_offsets = {"甲": 0, "乙": 2, "丙": 4, "丁": 6, "戊": 8,
                    "己": 0, "庚": 2, "辛": 4, "壬": 6, "癸": 8}
    base = stem_offsets.get(day_stem, 0)
    stem_idx = (base + branch_idx) % 10
    from app.utils.constants import STEM_KR, BRANCH_KR
    return Pillar(
        stem=HEAVENLY_STEMS[stem_idx],
        branch=EARTHLY_BRANCHES[branch_idx],
        stem_kr=STEM_KR[stem_idx],
        branch_kr=BRANCH_KR[branch_idx],
    )


def calc_elements(pillars: FourPillars) -> ElementScore:
    """천간·지지 오행 분포 계산 (가중치: 일간 1.5배, 월지 1.3배)"""
    scores: dict[str, float] = {"木": 0, "火": 0, "土": 0, "金": 0, "水": 0}
    weights = [(1.0, 1.0), (1.0, 1.3), (1.5, 1.0), (1.0, 1.0)]  # year/month/day/hour

    for pillar, (sw, bw) in zip(pillars.to_list(), weights):
        scores[STEM_ELEMENT[pillar.stem]] += sw
        scores[BRANCH_ELEMENT[pillar.branch]] += bw

    total = sum(scores.values()) or 1
    pct = {k: round(v / total * 100, 1) for k, v in scores.items()}
    return ElementScore(
        wood=pct["木"], fire=pct["火"], earth=pct["土"],
        metal=pct["金"], water=pct["水"],
    )


def calc_ten_gods(ilgan: str, targets: list[str]) -> dict[str, str]:
    """일간 기준 십신 계산"""
    il_el = STEM_ELEMENT[ilgan]
    il_yang = _stem_branch_parity(ilgan)
    result = {}
    for t in targets:
        if t not in STEM_ELEMENT:
            continue
        t_el = STEM_ELEMENT[t]
        t_yang = _stem_branch_parity(t)
        same_parity = (il_yang == t_yang)
        if t_el == il_el:
            rel = "same"
        elif ELEMENT_GENERATES[il_el] == t_el:
            rel = "gen"
        elif ELEMENT_CONTROLS[il_el] == t_el:
            rel = "ctrl"
        elif ELEMENT_CONTROLS[t_el] == il_el:
            rel = "by_ctrl"
        elif ELEMENT_GENERATES[t_el] == il_el:
            rel = "by_gen"
        else:
            rel = "same"
        result[t] = TEN_GODS_MAP.get((rel, same_parity), "비견")
    return result


def calc_gyeokguk(ilgan: str, month_branch: str, elements: ElementScore) -> str:
    """격국 판단 — 월지 지장간 기준"""
    il_el = STEM_ELEMENT[ilgan]
    hidden = BRANCH_HIDDEN_STEMS.get(month_branch, [])
    if not hidden:
        return "비겁격 (독립 개척가형)"

    # 월지 정기(正氣: 마지막 지장간) 기준 격국
    main_stem = hidden[-1]
    ten_gods = calc_ten_gods(ilgan, [main_stem])
    god = ten_gods.get(main_stem, "비견")
    gyeokguk_map = {
        "비견": "비겁격 (독립 개척가형)", "겁재": "비겁격 (독립 개척가형)",
        "식신": "식신격 (창조 표현가형)", "상관": "상관격 (혁신 반항아형)",
        "편재": "편재격 (비즈니스 사냥꾼형)", "정재": "정재격 (안정 수호자형)",
        "편관": "편관격 (전략 지휘관형)", "정관": "정관격 (정통 리더형)",
        "편인": "편인격 (탐구 전문가형)", "정인": "정인격 (지식 멘토형)",
    }
    return gyeokguk_map.get(god, "비겁격 (독립 개척가형)")


def calc_yongsin(ilgan: str, elements: ElementScore) -> str:
    """용신 산출 — 일간 오행과 오행 균형 기반 간략 알고리즘"""
    il_el = STEM_ELEMENT[ilgan]
    scores = elements.to_dict()

    # 일간 오행이 강하면 억제하는 오행, 약하면 생하는 오행이 용신
    il_score = scores[il_el]
    avg = sum(scores.values()) / 5

    if il_score > avg * 1.3:
        # 신강(身强) — 일간을 억제(剋)하는 오행이 용신
        # 甲木 신강 → 金이 木을 克 → 용신 金
        return ELEMENT_CONTROLLED_BY[il_el]
    else:
        # 신약(身弱) — 일간을 생(生)해주는 오행이 용신
        return ELEMENT_GENERATED_BY[il_el]


def calc_daeun(birth_date: date, gender: str, month_stem: str, month_branch: str) -> list[DaeunPeriod]:
    """대운 계산 — 성별·월간 음양 기준 순행/역행"""
    month_stem_idx   = HEAVENLY_STEMS.index(month_stem)
    month_branch_idx = EARTHLY_BRANCHES.index(month_branch)
    yang_stem = month_stem_idx % 2 == 0
    forward = (gender == "M" and yang_stem) or (gender == "F" and not yang_stem)

    daeun_list = []
    for i in range(1, 9):  # 대운 8개
        stem_idx   = (month_stem_idx + (i if forward else -i)) % 10
        branch_idx = (month_branch_idx + (i if forward else -i)) % 12
        stem   = HEAVENLY_STEMS[stem_idx]
        branch = EARTHLY_BRANCHES[branch_idx]
        el = STEM_ELEMENT[stem]
        daeun_list.append(DaeunPeriod(
            start_age=i * 10,
            stem=stem,
            branch=branch,
            element=el,
            relationship="중립",
        ))
    return daeun_list


# ── 메인 엔트리포인트 ──────────────────────────────────────────────────

def calculate_saju(
    birth_date: date,
    birth_hour: int | None,
    gender: str,
    situation: str | None = None,
) -> SajuResult:
    """사주 전체 분석 실행"""
    y, m, d = birth_date.year, birth_date.month, birth_date.day

    year_p  = calc_year_pillar(y)
    month_p = calc_month_pillar(y, m, d)
    day_p   = calc_day_pillar(birth_date)
    hour_p  = calc_hour_pillar(day_p.stem, birth_hour) if birth_hour is not None else None

    pillars  = FourPillars(year=year_p, month=month_p, day=day_p, hour=hour_p)
    elements = calc_elements(pillars)

    ilgan    = day_p.stem
    il_el    = STEM_ELEMENT[ilgan]
    gyeokguk = calc_gyeokguk(ilgan, month_p.branch, elements)
    yongsin  = calc_yongsin(ilgan, elements)

    # 십신 (연간·월간·시간 대상)
    stems_for_tg = [year_p.stem, month_p.stem]
    if hour_p:
        stems_for_tg.append(hour_p.stem)
    ten_gods = calc_ten_gods(ilgan, stems_for_tg)

    # 페르소나
    persona = GYEOKGUK_PERSONA.get(gyeokguk, {
        "name": "탐험가", "emoji": "🌟", "desc": "독특한 기운을 지닌 인재형입니다.", "traits": []
    })
    persona = {**persona, "ilgan": ilgan, "ilgan_element": il_el, "gyeokguk": gyeokguk}

    # 직무 매칭 — 용신 오행 우선, 일간 오행 보조
    primary_careers = ELEMENT_CAREERS.get(yongsin, [])
    secondary_careers = [
        c for c in ELEMENT_CAREERS.get(il_el, [])
        if not any(p["title"] == c["title"] for p in primary_careers)
    ]
    career_matches = (primary_careers + secondary_careers)[:6]

    # 대운
    daeun_list = calc_daeun(birth_date, gender, month_p.stem, month_p.branch)

    return SajuResult(
        pillars=pillars,
        elements=elements,
        ilgan=ilgan,
        ilgan_element=il_el,
        gyeokguk=gyeokguk,
        yongsin=yongsin,
        persona=persona,
        career_matches=career_matches,
        daeun_list=daeun_list,
        ten_gods=ten_gods,
    )
