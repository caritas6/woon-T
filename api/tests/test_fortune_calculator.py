"""운세 캘린더 계산 단위 테스트"""
import pytest
from datetime import date
from app.services.saju_engine import calculate_saju
from app.services.fortune_calculator import (
    get_monthly_calendar,
    get_yearly_daeun_overview,
    _harmony_score,
)


@pytest.fixture
def sample_saju():
    return calculate_saju(date(1995, 3, 15), 10, "F")


class TestHarmonyScore:
    def test_generate_is_positive(self):
        # 木 생 火 → 길(吉)
        assert _harmony_score("木", "火") > 0

    def test_control_is_negative(self):
        # 木 극 土 → 흉(凶)
        assert _harmony_score("木", "土") < 0

    def test_same_element_is_neutral_ish(self):
        score = _harmony_score("木", "木")
        assert -0.5 <= score <= 0.5

    def test_reverse_generate_positive(self):
        # 水 생 木 → 水가 木을 생함 → 길
        assert _harmony_score("水", "木") > 0


class TestMonthlyCalendar:
    def test_returns_all_days(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 5)
        assert len(cal["days"]) == 31

    def test_scores_in_range(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 1)
        for day in cal["days"]:
            assert 0 <= day["score"] <= 100

    def test_has_required_keys(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 3)
        assert "year" in cal
        assert "month" in cal
        assert "days" in cal
        assert "lucky_days" in cal
        assert "caution_days" in cal
        assert "events" in cal
        assert "monthly_avg" in cal

    def test_day_type_valid(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 6)
        valid_types = {"lucky", "good", "normal", "caution"}
        for day in cal["days"]:
            assert day["day_type"] in valid_types

    def test_lucky_days_are_subset_of_days(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 4)
        all_day_nums = {d["date"][-2:].lstrip("0") or "0" for d in cal["days"]}
        for lucky in cal["lucky_days"]:
            assert 1 <= lucky <= 30

    def test_february_has_28_or_29(self, sample_saju):
        cal = get_monthly_calendar(sample_saju, 2026, 2)
        assert len(cal["days"]) in (28, 29)

    @pytest.mark.parametrize("month", range(1, 13))
    def test_all_months(self, sample_saju, month):
        cal = get_monthly_calendar(sample_saju, 2026, month)
        assert len(cal["days"]) >= 28


class TestYearlyOverview:
    def test_has_required_keys(self, sample_saju):
        overview = get_yearly_daeun_overview(sample_saju, 2026)
        assert "year" in overview
        assert "outlook" in overview
        assert "summary" in overview
        assert "best_quarter" in overview

    def test_outlook_is_string(self, sample_saju):
        overview = get_yearly_daeun_overview(sample_saju, 2026)
        assert isinstance(overview["outlook"], str)
        assert len(overview["outlook"]) > 0

    def test_year_matches_input(self, sample_saju):
        overview = get_yearly_daeun_overview(sample_saju, 2030)
        assert overview["year"] == 2030
