"""
PDF 리포트 생성 서비스 — WeasyPrint + Jinja2 기반
운트(Woon-T) 사주 진로 분석 리포트를 PDF로 출력
"""
from __future__ import annotations
import io
from datetime import date, datetime
from jinja2 import Environment, BaseLoader
from app.models.saju import SajuProfile, Report

# ── HTML 템플릿 ──────────────────────────────────────────────────────────
_REPORT_HTML = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans KR', sans-serif;
    background: #FAF8F2;
    color: #1A1A2E;
    font-size: 11pt;
    line-height: 1.7;
  }
  .cover {
    background: linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%);
    color: white;
    padding: 60px 50px;
    page-break-after: always;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .cover-logo { font-family: 'Noto Serif KR', serif; font-size: 14pt; color: #C9A84C; letter-spacing: 2px; }
  .cover-title { font-family: 'Noto Serif KR', serif; font-size: 28pt; font-weight: 700; margin: 60px 0 16px; line-height: 1.3; }
  .cover-subtitle { font-size: 12pt; color: rgba(255,255,255,0.6); margin-bottom: 50px; }
  .cover-persona { background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4); border-radius: 12px; padding: 20px 24px; display: inline-block; }
  .cover-persona-name { font-size: 20pt; font-weight: 700; color: #C9A84C; }
  .cover-persona-desc { font-size: 10pt; color: rgba(255,255,255,0.65); margin-top: 6px; }
  .cover-meta { font-size: 9pt; color: rgba(255,255,255,0.35); }
  .page { padding: 50px; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  .section-title {
    font-family: 'Noto Serif KR', serif;
    font-size: 16pt;
    font-weight: 700;
    color: #1A1A2E;
    border-bottom: 2px solid #C9A84C;
    padding-bottom: 8px;
    margin-bottom: 24px;
  }
  .pillars-grid { display: flex; gap: 12px; margin-bottom: 30px; }
  .pillar {
    flex: 1;
    background: white;
    border: 1px solid #E0DDD0;
    border-radius: 10px;
    padding: 16px 12px;
    text-align: center;
  }
  .pillar.day { border-color: #C9A84C; background: #FFFBF0; }
  .pillar-label { font-size: 8pt; color: #7A7060; margin-bottom: 10px; letter-spacing: 1px; }
  .pillar-stem { font-family: 'Noto Serif KR', serif; font-size: 24pt; font-weight: 700; line-height: 1; }
  .pillar-branch { font-family: 'Noto Serif KR', serif; font-size: 24pt; font-weight: 700; line-height: 1; margin-top: 8px; }
  .pillar-el { font-size: 8pt; color: #7A7060; margin-top: 4px; }
  .element-bar { margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .element-name { font-family: 'Noto Serif KR', serif; font-size: 14pt; font-weight: 700; width: 20px; }
  .element-track { flex: 1; background: #E8E5D8; border-radius: 4px; height: 10px; overflow: hidden; }
  .element-fill { height: 10px; border-radius: 4px; }
  .element-pct { font-size: 9pt; color: #7A7060; width: 40px; text-align: right; }
  .career-item {
    background: white;
    border: 1px solid #E0DDD0;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .career-rank {
    width: 32px; height: 32px; border-radius: 50%;
    background: #E8E5D8; color: #7A7060;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 11pt; flex-shrink: 0;
  }
  .career-rank.r1 { background: #C9A84C; color: white; }
  .career-title { font-weight: 500; font-size: 12pt; }
  .career-reason { font-size: 9pt; color: #7A7060; margin-top: 3px; }
  .career-score { font-size: 18pt; font-weight: 700; color: #C9A84C; margin-left: auto; }
  .ai-box {
    background: #F5F3EC;
    border-left: 4px solid #C9A84C;
    border-radius: 0 10px 10px 0;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .ai-label { font-size: 8pt; color: #7A7060; letter-spacing: 1px; margin-bottom: 8px; font-weight: 700; }
  .ai-content { font-size: 10.5pt; line-height: 1.8; }
  .strengths { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
  .strength-tag {
    background: white; border: 1px solid #C9A84C;
    border-radius: 20px; padding: 5px 14px;
    font-size: 9pt; color: #8B6914;
  }
  .one-liner {
    font-family: 'Noto Serif KR', serif;
    font-size: 16pt;
    font-weight: 700;
    color: #1A1A2E;
    text-align: center;
    background: #FFFBF0;
    border: 1px solid #C9A84C;
    border-radius: 12px;
    padding: 20px;
    margin: 24px 0;
  }
  .footer { text-align: center; font-size: 8pt; color: #B0AA99; margin-top: 40px; }
  .daeun-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  .daeun-table th { background: #1A1A2E; color: white; padding: 8px 12px; text-align: center; font-size: 9pt; font-weight: 500; }
  .daeun-table td { padding: 9px 12px; text-align: center; border-bottom: 1px solid #E0DDD0; font-size: 10pt; }
  .daeun-table .cur td { background: #FFFBF0; font-weight: 600; color: #8B6914; }
  .daeun-hanja { font-family: 'Noto Serif KR', serif; font-size: 16pt; font-weight: 700; }
</style>
</head>
<body>

<!-- 표지 -->
<div class="cover">
  <div>
    <div class="cover-logo">運 T · WOON-T</div>
  </div>
  <div>
    <div class="cover-title">사주 기반<br>맞춤형 진로 분석 리포트</div>
    <div class="cover-subtitle">나의 타고난 기운으로 찾는 최적의 커리어 로드맵</div>
    <div class="cover-persona">
      <div class="cover-persona-name">{{ persona_emoji }} {{ persona_name }}</div>
      <div class="cover-persona-desc">{{ ilgan }}({{ ilgan_element }})일간 · {{ gyeokguk }}</div>
    </div>
  </div>
  <div class="cover-meta">
    생년월일: {{ birth_date }} · 분석일: {{ analysis_date }} · Powered by Claude AI
  </div>
</div>

<!-- P1: 사주 원국 -->
<div class="page">
  <div class="section-title">01 사주 원국 (四柱八字)</div>
  <div class="pillars-grid">
    {% for p in pillars %}
    <div class="pillar {% if loop.index == 3 %}day{% endif %}">
      <div class="pillar-label">{{ p.label }}{% if loop.index == 3 %} ★일간{% endif %}</div>
      <div class="pillar-stem" style="color: {{ p.stem_color }}">{{ p.stem }}</div>
      <div class="pillar-branch" style="color: {{ p.branch_color }}">{{ p.branch }}</div>
      <div class="pillar-el">{{ p.stem_kr }}·{{ p.branch_kr }}</div>
    </div>
    {% endfor %}
  </div>

  <div class="section-title">02 오행(五行) 분포</div>
  {% for el in elements %}
  <div class="element-bar">
    <div class="element-name" style="color: {{ el.color }}">{{ el.name }}</div>
    <div class="element-track">
      <div class="element-fill" style="width: {{ el.pct }}%; background: {{ el.color }};"></div>
    </div>
    <div class="element-pct">{{ el.pct }}%</div>
  </div>
  {% endfor %}

  {% if one_liner %}
  <div class="one-liner">"{{ one_liner }}"</div>
  {% endif %}
</div>

<!-- P2: AI 진로 분석 -->
<div class="page">
  <div class="section-title">03 AI 진로 분석</div>

  {% if identity_summary %}
  <div class="ai-box">
    <div class="ai-label">나의 커리어 정체성</div>
    <div class="ai-content">{{ identity_summary }}</div>
  </div>
  {% endif %}

  {% if strengths %}
  <div class="ai-label" style="margin-bottom: 8px;">핵심 강점</div>
  <div class="strengths">
    {% for s in strengths %}<div class="strength-tag">{{ s }}</div>{% endfor %}
  </div>
  {% endif %}

  {% if career_primary %}
  <div class="section-title" style="margin-top: 24px;">04 직무 매칭 리포트</div>
  <div class="ai-box">
    <div class="ai-label">1순위 추천 직군</div>
    <div class="career-title" style="font-size: 14pt; font-weight: 700;">{{ career_primary.field }}</div>
    <div class="ai-content" style="margin-top: 8px;">{{ career_primary.why }}</div>
    <div class="strengths" style="margin-top: 12px;">
      {% for r in career_primary.specific_roles %}<div class="strength-tag">{{ r }}</div>{% endfor %}
    </div>
  </div>
  {% endif %}

  {% for c in career_matches %}
  <div class="career-item">
    <div class="career-rank {% if loop.index == 1 %}r1{% endif %}">{{ loop.index }}</div>
    <div>
      <div class="career-title">{{ c.title }}</div>
      <div class="career-reason">{{ c.reason }}</div>
    </div>
    <div class="career-score">{{ c.score }}</div>
  </div>
  {% endfor %}
</div>

<!-- P3: 대운 & 액션 플랜 -->
<div class="page">
  {% if daeun_list %}
  <div class="section-title">05 대운(大運) 흐름</div>
  <table class="daeun-table">
    <tr>
      <th>시작 나이</th><th>천간</th><th>지지</th><th>주도 오행</th>
    </tr>
    {% for d in daeun_list %}
    <tr {% if d.is_current %}class="cur"{% endif %}>
      <td>{{ d.start_age }}세 ~</td>
      <td><span class="daeun-hanja">{{ d.stem }}</span></td>
      <td><span class="daeun-hanja">{{ d.branch }}</span></td>
      <td>{{ d.element }}{% if d.is_current %} ◀ 현재{% endif %}</td>
    </tr>
    {% endfor %}
  </table>
  {% endif %}

  {% if situation_advice %}
  <div class="section-title" style="margin-top: 32px;">06 지금 당장 할 일 — 3단계 액션 플랜</div>
  <div class="ai-box">
    <div class="ai-content">{{ situation_advice }}</div>
  </div>
  {% endif %}

  {% if timing_insight %}
  <div class="ai-box">
    <div class="ai-label">커리어 타이밍 인사이트</div>
    <div class="ai-content">{{ timing_insight }}</div>
  </div>
  {% endif %}

  <div class="footer">
    운트(Woon-T) · 사주 명리학 × 현대 커리어 컨설팅 · {{ analysis_date }}
  </div>
</div>

</body>
</html>"""

_ELEMENT_COLORS = {"木": "#3D7A4A", "火": "#C94B3D", "土": "#8B6914", "金": "#7A8090", "水": "#2E5F8A"}
_jinja_env = Environment(loader=BaseLoader())


def _build_template_context(profile: SajuProfile, report: Report) -> dict:
    """Jinja2 템플릿용 컨텍스트 딕셔너리 생성"""
    from app.utils.constants import STEM_ELEMENT, BRANCH_ELEMENT, STEM_KR, BRANCH_KR, GYEOKGUK_PERSONA

    analysis = report.analysis_data or {}
    career_analysis = analysis.get("career_analysis", {})
    daeun_data = profile.daeun_data or []
    current_age = date.today().year - profile.birth_date.year

    # 사주 원국
    pillars_raw = [
        (profile.year_stem,  profile.year_branch,  "년주(年柱)"),
        (profile.month_stem, profile.month_branch, "월주(月柱)"),
        (profile.day_stem,   profile.day_branch,   "일주(日柱)"),
    ]
    if profile.hour_stem:
        pillars_raw.append((profile.hour_stem, profile.hour_branch, "시주(時柱)"))

    stem_kr_map  = {s: STEM_KR[i]  for i, s in enumerate(["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"])}
    branch_kr_map = {b: BRANCH_KR[i] for i, b in enumerate(["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"])}

    pillars = [
        {
            "label":        label,
            "stem":         stem,
            "branch":       branch,
            "stem_kr":      stem_kr_map.get(stem, ""),
            "branch_kr":    branch_kr_map.get(branch, ""),
            "stem_color":   _ELEMENT_COLORS.get(STEM_ELEMENT.get(stem, "土"), "#333"),
            "branch_color": _ELEMENT_COLORS.get(BRANCH_ELEMENT.get(branch, "土"), "#333"),
        }
        for stem, branch, label in pillars_raw
    ]

    # 오행
    el_data = {
        "木": profile.element_wood, "火": profile.element_fire, "土": profile.element_earth,
        "金": profile.element_metal, "水": profile.element_water,
    }
    elements = [
        {"name": el, "pct": round(score, 1), "color": _ELEMENT_COLORS[el]}
        for el, score in el_data.items()
    ]

    # 페르소나
    persona_info = GYEOKGUK_PERSONA.get(profile.gyeokguk or "", {})

    # 대운 — 현재 나이 하이라이트
    daeun_list = [
        {**d, "is_current": d["start_age"] <= current_age < d["start_age"] + 10}
        for d in daeun_data
    ]

    return {
        "birth_date":       profile.birth_date.strftime("%Y년 %m월 %d일"),
        "analysis_date":    datetime.now().strftime("%Y. %m. %d"),
        "ilgan":            profile.day_stem,
        "ilgan_element":    profile.ilgan_element,
        "gyeokguk":         profile.gyeokguk or "",
        "yongsin":          profile.yongsin or "",
        "persona_name":     persona_info.get("name", profile.persona_type or ""),
        "persona_emoji":    persona_info.get("emoji", "🌟"),
        "pillars":          pillars,
        "elements":         elements,
        "one_liner":        analysis.get("one_liner", ""),
        "identity_summary": analysis.get("identity_summary", ""),
        "strengths":        analysis.get("strengths", []),
        "career_primary":   career_analysis.get("primary"),
        "career_matches":   [],   # saju_engine에서 가져올 직무 매칭 (간략 버전)
        "daeun_list":       daeun_list,
        "situation_advice": analysis.get("situation_advice", ""),
        "timing_insight":   analysis.get("timing_insight", ""),
    }


def generate_pdf_bytes(profile: SajuProfile, report: Report) -> bytes:
    """WeasyPrint로 PDF 바이너리 생성 — Report + SajuProfile 인스턴스 필요"""
    try:
        from weasyprint import HTML
    except ImportError as e:
        raise RuntimeError("weasyprint가 설치되지 않았습니다: pip install weasyprint") from e

    ctx = _build_template_context(profile, report)
    template = _jinja_env.from_string(_REPORT_HTML)
    html_str = template.render(**ctx)

    buf = io.BytesIO()
    HTML(string=html_str).write_pdf(buf)
    return buf.getvalue()


def generate_pdf_bytes_from_data(
    profile_data: dict,
    analysis_data: dict,
) -> bytes:
    """
    DB 인스턴스 없이 딕셔너리로 PDF 생성 (테스트·미리보기용)
    profile_data: SajuProfile 필드를 dict으로
    analysis_data: Report.analysis_data
    """
    class _FakeProfile:
        def __init__(self, d: dict):
            for k, v in d.items():
                setattr(self, k, v)

    class _FakeReport:
        def __init__(self, a: dict):
            self.analysis_data = a

    return generate_pdf_bytes(_FakeProfile(profile_data), _FakeReport(analysis_data))  # type: ignore
