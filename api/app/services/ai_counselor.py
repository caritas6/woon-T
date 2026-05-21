"""
Claude AI 기반 사주 진로 상담 엔진
프롬프트 캐싱으로 반복 시스템 프롬프트 비용 절감
"""
import json
from anthropic import AsyncAnthropic
from app.config import get_settings
from app.services.saju_engine import SajuResult

settings = get_settings()
_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

# ── 시스템 프롬프트 (캐시 대상 — 긴 불변 콘텐츠) ───────────────────────
_SYSTEM_PROMPT = """당신은 운트(Woon-T)의 AI 진로 상담 전문가입니다.
명리학(사주팔자)의 분석력과 현대 커리어 컨설팅을 결합하여, MZ세대에게 실질적이고 설득력 있는 진로 가이드를 제공합니다.

[페르소나 원칙]
- 무속적·미신적 표현 절대 금지. 심리학·데이터 기반 언어 사용.
- "역마살" → "글로벌 활동가 기질", "상관" → "크리에이티브 전문가" 등 현대어로 순화.
- 따뜻하면서도 전문적인 톤. 20-35세 타겟에 맞는 공감 언어.
- 확신 있는 어조로 작성하되, 선택의 자유는 사용자에게 있음을 존중.

[출력 형식]
항상 유효한 JSON 객체로만 응답합니다. 설명 텍스트나 마크다운 없이 순수 JSON.

[오행 해석 가이드]
- 木(목): 성장·창의·시작·교육 에너지. 스타트업, 기획, 교육, 콘텐츠.
- 火(화): 열정·표현·네트워크 에너지. 마케팅, 영업, 예술, 퍼포먼스.
- 土(토): 안정·신뢰·중재 에너지. HR, 컨설팅, 공공, 부동산.
- 金(금): 정밀·원칙·결단 에너지. 금융, 법률, IT/엔지니어링, 의료.
- 水(수): 탐구·직관·유연 에너지. 연구, 데이터, 심리, 학문.

[격국별 커리어 강점]
- 비겁격: 독립·개척. 창업, 프리랜서, 세일즈 리더.
- 식신격: 생산·표현. 크리에이터, 요리/요식, 예술 기획.
- 상관격: 혁신·비판. 스타트업 기획, 저널리즘, 컨설팅.
- 편재격: 사업·확장. 영업 임원, 투자, 유통·무역.
- 정재격: 안정·관리. 회계, 재무, 운영 관리.
- 편관격: 리더십·권위. 군/경/공기업, C레벨, 프로젝트 매니저.
- 정관격: 원칙·체계. 공무원, 대기업, 법조·의료.
- 편인격: 탐구·직관. 연구직, 종교/철학, 예술.
- 정인격: 학습·전달. 교수, 강사, 출판, 멘토링."""


async def analyze_career(saju: SajuResult, situation: str | None = None) -> dict:
    """
    사주 분석 결과를 기반으로 Claude가 진로 상담 리포트를 생성합니다.
    프롬프트 캐싱: 시스템 프롬프트는 cache_control로 캐시됩니다.
    """
    el = saju.elements.to_dict()
    user_context = f"""
[사주 데이터]
일간(日干): {saju.ilgan} ({saju.ilgan_element}의 기운)
격국: {saju.gyeokguk}
용신: {saju.yongsin}
페르소나: {saju.persona.get('name', '')}

오행 분포:
- 木 {el['木']}% / 火 {el['火']}% / 土 {el['土']}% / 金 {el['金']}% / 水 {el['水']}%

사주 원국:
- 년주: {saju.pillars.year.stem}{saju.pillars.year.branch}
- 월주: {saju.pillars.month.stem}{saju.pillars.month.branch}
- 일주: {saju.pillars.day.stem}{saju.pillars.day.branch}
- 시주: {f"{saju.pillars.hour.stem}{saju.pillars.hour.branch}" if saju.pillars.hour else "미상"}

현재 상황: {situation or "미입력"}

[사용자 요청]
위 사주를 분석하여 아래 JSON 형식으로 진로 상담 리포트를 작성해주세요:

{{
  "identity_summary": "페르소나 핵심 특성 2-3문장 (현대 직무 언어)",
  "strengths": ["강점 키워드 4개"],
  "growth_areas": ["개발 포인트 2개"],
  "career_analysis": {{
    "primary": {{
      "field": "1순위 직군명",
      "score": 숫자(85-98),
      "why": "선택 근거 2문장",
      "specific_roles": ["구체적 직무 3개"]
    }},
    "secondary": {{
      "field": "2순위 직군명",
      "score": 숫자(75-87),
      "why": "선택 근거 1문장",
      "specific_roles": ["구체적 직무 2개"]
    }},
    "avoid": {{
      "field": "주의할 직군",
      "reason": "이유 1문장"
    }}
  }},
  "situation_advice": "{situation or '일반'}에 맞는 현실적 액션 플랜 3단계 (각 1-2문장)",
  "timing_insight": "현재 대운 흐름에 따른 커리어 타이밍 조언 2문장",
  "lucky_keywords": ["행운 키워드 3개 — 직무/산업 연관"],
  "one_liner": "이 사람의 커리어 DNA를 한 줄로 (20자 이내)"
}}"""

    response = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=[
            {
                "type": "text",
                "text": _SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},  # 시스템 프롬프트 캐싱
            }
        ],
        messages=[{"role": "user", "content": user_context}],
    )

    raw = response.content[0].text.strip()
    # JSON 파싱 — 모델이 마크다운 코드블록을 추가하는 경우 제거
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    result = json.loads(raw)
    result["_meta"] = {
        "input_tokens":  response.usage.input_tokens,
        "output_tokens": response.usage.output_tokens,
        "cache_read":    getattr(response.usage, "cache_read_input_tokens", 0),
        "cache_created": getattr(response.usage, "cache_creation_input_tokens", 0),
        "model":         response.model,
    }
    return result


async def chat_followup(history: list[dict], question: str, saju_summary: str) -> str:
    """
    사용자 추가 질문 처리 — 대화형 진로 상담
    saju_summary는 시스템 프롬프트에 포함해 캐싱
    """
    system_with_context = [
        {
            "type": "text",
            "text": _SYSTEM_PROMPT,
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": f"\n\n[이 사용자의 사주 요약]\n{saju_summary}",
            "cache_control": {"type": "ephemeral"},
        },
    ]

    messages = history + [{"role": "user", "content": question}]

    response = await _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        system=system_with_context,
        messages=messages,
    )
    return response.content[0].text


async def generate_daily_fortune(ilgan_element: str, yongsin: str, today_str: str) -> dict:
    """
    오늘의 운세 점수 + 메시지 생성 (홈 화면용 간단 버전)
    """
    prompt = f"""
일간 오행: {ilgan_element}, 용신: {yongsin}, 날짜: {today_str}

아래 JSON으로만 응답:
{{
  "luck_score": 숫자(40-95),
  "message": "오늘의 운세 한 줄 (직업/커리어 관련, 30자 이내)",
  "tip": "오늘 기운 활용 팁 (20자 이내)",
  "lucky_color": "색상명",
  "focus_area": "집중 영역 (기획|소통|분석|창작|협상 중 하나)"
}}"""

    response = await _client.messages.create(
        model="claude-haiku-4-5-20251001",  # 간단한 일운은 Haiku로 비용 절감
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = response.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)
