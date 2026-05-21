"""PDF 생성 서비스 단위 테스트 — WeasyPrint 없이 컨텍스트 빌딩만 검증"""
import pytest
from datetime import date
from unittest.mock import MagicMock, patch
from app.services.pdf_generator import _build_template_context, _ELEMENT_COLORS


def _make_profile(
    birth_date=date(1995, 3, 15),
    ilgan_element="木",
    gyeokguk="식신격 (창조 표현가형)",
    yongsin="水",
    day_stem="甲",
    day_branch="子",
    year_stem="乙",
    year_branch="亥",
    month_stem="丙",
    month_branch="寅",
    hour_stem=None,
    hour_branch=None,
    element_wood=40.0,
    element_fire=20.0,
    element_earth=15.0,
    element_metal=10.0,
    element_water=15.0,
    daeun_data=None,
):
    p = MagicMock()
    p.birth_date = birth_date
    p.ilgan_element = ilgan_element
    p.gyeokguk = gyeokguk
    p.yongsin = yongsin
    p.day_stem = day_stem
    p.day_branch = day_branch
    p.year_stem = year_stem
    p.year_branch = year_branch
    p.month_stem = month_stem
    p.month_branch = month_branch
    p.hour_stem = hour_stem
    p.hour_branch = hour_branch
    p.element_wood = element_wood
    p.element_fire = element_fire
    p.element_earth = element_earth
    p.element_metal = element_metal
    p.element_water = element_water
    p.persona_type = None  # MagicMock auto-attribute가 truthy가 되지 않도록 명시
    p.daeun_data = daeun_data if daeun_data is not None else [
        {"start_age": 10, "stem": "庚", "branch": "子", "element": "金"},
        {"start_age": 20, "stem": "辛", "branch": "丑", "element": "金"},
        {"start_age": 30, "stem": "壬", "branch": "寅", "element": "水"},
    ]
    return p


def _make_report(analysis_data=None):
    r = MagicMock()
    # 주의: `or` 연산자는 빈 dict {}를 falsy로 처리하므로 `is not None` 사용
    r.analysis_data = analysis_data if analysis_data is not None else {
        "one_liner": "데이터로 세상을 읽는 탐구자",
        "identity_summary": "깊은 통찰력과 분석력으로 가치를 창출합니다.",
        "strengths": ["분석력", "창의성", "지속력", "공감능력"],
        "situation_advice": "1단계: 포트폴리오 정리\n2단계: 네트워킹\n3단계: 지원",
        "timing_insight": "현재 대운이 유리합니다.",
        "career_analysis": {
            "primary": {
                "field": "데이터·AI",
                "score": 92,
                "why": "水의 기운이 탐구와 분석에 탁월한 적합성을 보입니다.",
                "specific_roles": ["데이터 사이언티스트", "ML 엔지니어", "리서처"],
            }
        },
    }
    return r


class TestBuildTemplateContext:
    def test_returns_dict(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert isinstance(ctx, dict)

    def test_birth_date_formatted(self):
        ctx = _build_template_context(_make_profile(birth_date=date(1995, 3, 15)), _make_report())
        assert "1995" in ctx["birth_date"]
        assert "3" in ctx["birth_date"]

    def test_pillars_count_without_hour(self):
        ctx = _build_template_context(_make_profile(hour_stem=None), _make_report())
        assert len(ctx["pillars"]) == 3

    def test_pillars_count_with_hour(self):
        ctx = _build_template_context(
            _make_profile(hour_stem="壬", hour_branch="午"), _make_report()
        )
        assert len(ctx["pillars"]) == 4

    def test_elements_count(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert len(ctx["elements"]) == 5

    def test_elements_have_color(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        for el in ctx["elements"]:
            assert "color" in el
            assert el["color"].startswith("#")

    def test_elements_have_pct(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        for el in ctx["elements"]:
            assert "pct" in el
            assert isinstance(el["pct"], float)

    def test_one_liner_from_analysis(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert ctx["one_liner"] == "데이터로 세상을 읽는 탐구자"

    def test_identity_summary_from_analysis(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert "통찰력" in ctx["identity_summary"]

    def test_strengths_list(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert len(ctx["strengths"]) == 4

    def test_career_primary_present(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert ctx["career_primary"] is not None
        assert ctx["career_primary"]["field"] == "데이터·AI"

    def test_daeun_has_is_current_flag(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        flags = [d["is_current"] for d in ctx["daeun_list"]]
        assert any(flags) or not any(flags)  # 플래그 자체가 존재함
        for d in ctx["daeun_list"]:
            assert "is_current" in d

    def test_empty_analysis_data(self):
        ctx = _build_template_context(_make_profile(), _make_report(analysis_data={}))
        assert ctx["one_liner"] == ""
        assert ctx["identity_summary"] == ""
        assert ctx["strengths"] == []

    def test_persona_name_from_gyeokguk(self):
        ctx = _build_template_context(
            _make_profile(gyeokguk="식신격 (창조 표현가형)"), _make_report()
        )
        assert ctx["persona_name"] == "창조 표현가"

    def test_persona_emoji_present(self):
        ctx = _build_template_context(_make_profile(), _make_report())
        assert ctx["persona_emoji"]  # 비어 있지 않음

    def test_unknown_gyeokguk_fallback(self):
        # persona_type=None → GYEOKGUK_PERSONA 미등록 격국이면 빈 문자열로 폴백
        ctx = _build_template_context(
            _make_profile(gyeokguk="알수없는격"), _make_report()
        )
        # persona_type이 None이고 gyeokguk이 미등록 → persona_name 빈 문자열
        assert ctx["persona_name"] == ""


class TestElementColors:
    def test_all_elements_have_color(self):
        for el in ["木", "火", "土", "金", "水"]:
            assert el in _ELEMENT_COLORS
            assert _ELEMENT_COLORS[el].startswith("#")

    def test_colors_are_distinct(self):
        colors = list(_ELEMENT_COLORS.values())
        assert len(set(colors)) == 5


class TestGeneratePdfBytes:
    def test_raises_without_weasyprint(self):
        """weasyprint 미설치 환경에서 RuntimeError 발생 확인"""
        import sys
        with patch.dict(sys.modules, {"weasyprint": None}):
            with pytest.raises((RuntimeError, ImportError)):
                from app.services.pdf_generator import generate_pdf_bytes
                generate_pdf_bytes(_make_profile(), _make_report())

    def test_generate_pdf_bytes_from_data_calls_generate(self):
        """generate_pdf_bytes_from_data가 generate_pdf_bytes를 올바른 인자로 호출하는지"""
        from app.services.pdf_generator import generate_pdf_bytes_from_data
        with patch("app.services.pdf_generator.generate_pdf_bytes", return_value=b"%PDF") as mock_gen:
            profile_data = {
                "birth_date": date(1995, 3, 15),
                "ilgan_element": "木",
                "gyeokguk": "식신격 (창조 표현가형)",
                "yongsin": "水",
                "day_stem": "甲", "day_branch": "子",
                "year_stem": "乙", "year_branch": "亥",
                "month_stem": "丙", "month_branch": "寅",
                "hour_stem": None, "hour_branch": None,
                "element_wood": 40.0, "element_fire": 20.0,
                "element_earth": 15.0, "element_metal": 10.0,
                "element_water": 15.0,
                "daeun_data": [],
            }
            result = generate_pdf_bytes_from_data(profile_data, {})
            assert result == b"%PDF"
            mock_gen.assert_called_once()
