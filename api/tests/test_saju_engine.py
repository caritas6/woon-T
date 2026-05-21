"""
사주 엔진 단위 테스트
만세력 알고리즘의 핵심 계산 함수들을 검증
"""
import pytest
from datetime import date
from app.services.saju_engine import (
    calc_year_pillar,
    calc_month_pillar,
    calc_day_pillar,
    calc_hour_pillar,
    calc_elements,
    calc_ten_gods,
    calc_gyeokguk,
    calc_yongsin,
    calc_daeun,
    calculate_saju,
    FourPillars,
    ElementScore,
)
from app.utils.constants import STEM_ELEMENT, BRANCH_ELEMENT, HEAVENLY_STEMS, EARTHLY_BRANCHES


# ── 년주 ────────────────────────────────────────────────────────────────

class TestYearPillar:
    def test_2024_year(self):
        p = calc_year_pillar(2024)
        assert p.stem == "甲"
        assert p.branch == "辰"

    def test_1990_year(self):
        p = calc_year_pillar(1990)
        assert p.stem == "庚"
        assert p.branch == "午"

    def test_2000_year(self):
        p = calc_year_pillar(2000)
        assert p.stem == "庚"
        assert p.branch == "辰"

    def test_1984_year(self):
        # 갑자(甲子)년
        p = calc_year_pillar(1984)
        assert p.stem == "甲"
        assert p.branch == "子"

    def test_stem_is_heavenly(self):
        for year in range(2000, 2024):
            p = calc_year_pillar(year)
            assert p.stem in HEAVENLY_STEMS
            assert p.branch in EARTHLY_BRANCHES

    def test_60_cycle(self):
        # 60년 주기로 같은 간지 반복
        p1 = calc_year_pillar(1984)
        p2 = calc_year_pillar(2044)
        assert p1.stem == p2.stem
        assert p1.branch == p2.branch

    def test_stem_element(self):
        p = calc_year_pillar(2024)  # 甲 → 木
        assert p.stem_element == "木"

    def test_branch_element(self):
        p = calc_year_pillar(2024)  # 辰 → 土
        assert p.branch_element == "土"


# ── 일주 ────────────────────────────────────────────────────────────────

class TestDayPillar:
    def test_returns_valid_pillar(self):
        p = calc_day_pillar(date(1995, 5, 15))
        assert p.stem in HEAVENLY_STEMS
        assert p.branch in EARTHLY_BRANCHES

    def test_consecutive_days_differ(self):
        p1 = calc_day_pillar(date(2024, 1, 1))
        p2 = calc_day_pillar(date(2024, 1, 2))
        assert (p1.stem, p1.branch) != (p2.stem, p2.branch)

    def test_60_day_cycle(self):
        from datetime import timedelta
        d = date(2024, 1, 1)
        p1 = calc_day_pillar(d)
        p2 = calc_day_pillar(d + timedelta(days=60))
        assert p1.stem == p2.stem
        assert p1.branch == p2.branch


# ── 시주 ────────────────────────────────────────────────────────────────

class TestHourPillar:
    def test_hour_0_is_ja(self):
        p = calc_hour_pillar("甲", 0)
        assert p.branch == "子"

    def test_hour_23_is_ja(self):
        p = calc_hour_pillar("甲", 23)
        assert p.branch == "子"

    def test_hour_12_is_o(self):
        p = calc_hour_pillar("甲", 12)
        assert p.branch == "午"

    def test_hour_range(self):
        for hour in range(24):
            p = calc_hour_pillar("甲", hour)
            assert p.stem in HEAVENLY_STEMS
            assert p.branch in EARTHLY_BRANCHES


# ── 오행 계산 ────────────────────────────────────────────────────────────

class TestElementScore:
    def _make_pillars(self, year="甲子", month="丙寅", day="壬午", hour=None):
        from app.services.saju_engine import Pillar
        from app.utils.constants import STEM_KR, BRANCH_KR
        def make(stem, branch):
            si = HEAVENLY_STEMS.index(stem)
            bi = EARTHLY_BRANCHES.index(branch)
            return Pillar(stem=stem, branch=branch, stem_kr=STEM_KR[si], branch_kr=BRANCH_KR[bi])

        y = make(year[0], year[1])
        m = make(month[0], month[1])
        d = make(day[0], day[1])
        h = make(hour[0], hour[1]) if hour else None
        return FourPillars(year=y, month=m, day=d, hour=h)

    def test_total_roughly_100(self):
        pillars = self._make_pillars()
        el = calc_elements(pillars)
        total = el.wood + el.fire + el.earth + el.metal + el.water
        assert abs(total - 100.0) < 0.2

    def test_all_scores_non_negative(self):
        pillars = self._make_pillars()
        el = calc_elements(pillars)
        assert el.wood >= 0
        assert el.fire >= 0
        assert el.earth >= 0
        assert el.metal >= 0
        assert el.water >= 0

    def test_dominant_returns_element(self):
        el = ElementScore(wood=40, fire=10, earth=20, metal=15, water=15)
        assert el.dominant() == "木"

    def test_to_dict_keys(self):
        el = ElementScore(wood=20, fire=20, earth=20, metal=20, water=20)
        d = el.to_dict()
        assert set(d.keys()) == {"木", "火", "土", "金", "水"}


# ── 십신 ─────────────────────────────────────────────────────────────────

class TestTenGods:
    def test_same_stem_is_bigyeon(self):
        # 甲(木) vs 甲(木) — 같은 오행, 같은 음양 → 비견
        result = calc_ten_gods("甲", ["甲"])
        assert result["甲"] == "비견"

    def test_gyeop_jae(self):
        # 甲(木, 양) vs 乙(木, 음) → 겁재
        result = calc_ten_gods("甲", ["乙"])
        assert result["乙"] == "겁재"

    def test_sikshin(self):
        # 甲(木) 생 → 火, 丙(火, 양) → 식신
        result = calc_ten_gods("甲", ["丙"])
        assert result["丙"] == "식신"

    def test_jeong_gwan(self):
        # 甲(木, 양)을 극하는 庚(金, 양) → 양vs양 → 편관
        result = calc_ten_gods("甲", ["庚"])
        assert result["庚"] == "편관"

    def test_empty_targets(self):
        result = calc_ten_gods("甲", [])
        assert result == {}


# ── 격국 ─────────────────────────────────────────────────────────────────

class TestGyeokguk:
    def test_returns_string(self):
        pillars = FourPillars(
            year=calc_year_pillar(1990),
            month=calc_month_pillar(1990, 5, 10),
            day=calc_day_pillar(date(1990, 5, 10)),
        )
        el = calc_elements(pillars)
        g = calc_gyeokguk("甲", "寅", el)
        assert isinstance(g, str)
        assert len(g) > 0

    def test_known_gyeokguk_format(self):
        pillars = FourPillars(
            year=calc_year_pillar(1990),
            month=calc_month_pillar(1990, 5, 10),
            day=calc_day_pillar(date(1990, 5, 10)),
        )
        el = calc_elements(pillars)
        g = calc_gyeokguk("甲", "寅", el)
        assert "격" in g


# ── 용신 ─────────────────────────────────────────────────────────────────

class TestYongsin:
    def test_returns_element(self):
        el = ElementScore(wood=50, fire=20, earth=10, metal=10, water=10)
        ys = calc_yongsin("甲", el)
        assert ys in {"木", "火", "土", "金", "水"}

    def test_strong_ilgan_gets_controller(self):
        # 甲(木)이 매우 강하면 → 극하는 金이 용신
        el = ElementScore(wood=70, fire=10, earth=10, metal=5, water=5)
        ys = calc_yongsin("甲", el)
        assert ys == "金"  # 金이 木을 극함


# ── 대운 ─────────────────────────────────────────────────────────────────

class TestDaeun:
    def test_returns_8_periods(self):
        dw = calc_daeun(date(1990, 5, 10), "M", "甲", "寅")
        assert len(dw) == 8

    def test_start_ages_are_multiples_of_10(self):
        dw = calc_daeun(date(1990, 5, 10), "M", "甲", "寅")
        for d in dw:
            assert d.start_age % 10 == 0

    def test_all_stems_valid(self):
        dw = calc_daeun(date(1990, 5, 10), "F", "乙", "卯")
        for d in dw:
            assert d.stem in HEAVENLY_STEMS
            assert d.branch in EARTHLY_BRANCHES


# ── 통합: calculate_saju ────────────────────────────────────────────────

class TestCalculateSaju:
    def test_full_result_structure(self):
        result = calculate_saju(
            birth_date=date(1995, 3, 15),
            birth_hour=10,
            gender="F",
            situation="취업준비생",
        )
        assert result.ilgan in HEAVENLY_STEMS
        assert result.ilgan_element in {"木", "火", "土", "金", "水"}
        assert result.gyeokguk
        assert result.yongsin in {"木", "火", "土", "金", "水"}
        assert result.persona
        assert len(result.career_matches) >= 1
        assert len(result.daeun_list) == 8

    def test_without_birth_hour(self):
        result = calculate_saju(
            birth_date=date(1990, 1, 1),
            birth_hour=None,
            gender="M",
        )
        assert result.pillars.hour is None

    def test_with_birth_hour(self):
        result = calculate_saju(
            birth_date=date(1990, 1, 1),
            birth_hour=14,
            gender="M",
        )
        assert result.pillars.hour is not None
        assert result.pillars.hour.branch in EARTHLY_BRANCHES

    def test_career_matches_have_required_keys(self):
        result = calculate_saju(date(1998, 7, 7), 9, "F")
        for c in result.career_matches:
            assert "title" in c
            assert "score" in c
            assert "reason" in c

    def test_elements_sum_to_100(self):
        result = calculate_saju(date(2000, 6, 15), 8, "M")
        el = result.elements
        total = el.wood + el.fire + el.earth + el.metal + el.water
        assert abs(total - 100.0) < 0.5

    @pytest.mark.parametrize("year,month,day,gender", [
        (1980, 1, 1, "M"),
        (1990, 6, 15, "F"),
        (2000, 12, 31, "M"),
        (1975, 3, 20, "F"),
        (2005, 9, 9, "M"),
    ])
    def test_various_birthdates(self, year, month, day, gender):
        result = calculate_saju(date(year, month, day), None, gender)
        assert result.ilgan in HEAVENLY_STEMS
        assert result.persona is not None
