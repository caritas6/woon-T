/**
 * POST /api/v1/career/analyze
 * 사주 프로필 기반 Claude AI 커리어 심층 분석
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const REPORTS_DIR  = join(process.cwd(), "data", "reports");
const PROFILES_DIR = join(process.cwd(), "data", "profiles");

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export async function POST(req: Request) {
  try {
    const { saju_profile_id, situation } = await req.json() as {
      saju_profile_id?: string;
      situation?: string;
    };

    if (!saju_profile_id) {
      return Response.json({ detail: "saju_profile_id가 필요합니다." }, { status: 422 });
    }

    // ── 사주 프로필 로드 ─────────────────────────────────────────────────
    const profilePath = join(PROFILES_DIR, `${saju_profile_id}.json`);
    if (!existsSync(profilePath)) {
      return Response.json({ detail: "사주 프로필을 찾을 수 없습니다." }, { status: 404 });
    }
    const profile = JSON.parse(readFileSync(profilePath, "utf-8"));

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ detail: "AI 분석 서비스가 설정되지 않았습니다." }, { status: 503 });
    }

    // ── 사주 데이터 요약 ─────────────────────────────────────────────────
    const survey = profile.survey as {
      currentField?:   string;
      careerYears?:    string;
      interestFields?: string[];
      mainConcern?:    string;
      strengths?:      string[];
      additionalNote?: string;
    } | null | undefined;

    const surveySection = survey ? `

[사전 설문 응답]
- 현재 직군: ${survey.currentField || "미입력"}
- 경력 연수: ${survey.careerYears || "미입력"}
- 관심/희망 분야: ${survey.interestFields?.join(", ") || "미입력"}
- 주요 커리어 고민: ${survey.mainConcern || "미입력"}
- 본인이 생각하는 강점: ${survey.strengths?.join(", ") || "미입력"}${
  survey.additionalNote ? `\n- 추가 메모: ${survey.additionalNote}` : ""
}` : "";

    const sajuSummary = `
사주팔자:
- 년주: ${profile.year?.stem}${profile.year?.branch} (${profile.year?.stem_kr}${profile.year?.branch_kr})
- 월주: ${profile.month?.stem}${profile.month?.branch} (${profile.month?.stem_kr}${profile.month?.branch_kr})
- 일주: ${profile.day?.stem}${profile.day?.branch} (${profile.day?.stem_kr}${profile.day?.branch_kr})
- 시주: ${profile.hour ? `${profile.hour.stem}${profile.hour.branch}` : "미입력"}
- 일간: ${profile.ilgan} (${profile.ilgan_element})
- 격국: ${profile.gyeokguk}
- 용신: ${profile.yongsin}
오행 분포: 木${profile.elements?.["木"] ?? 0}% 火${profile.elements?.["火"] ?? 0}% 土${profile.elements?.["土"] ?? 0}% 金${profile.elements?.["金"] ?? 0}% 水${profile.elements?.["水"] ?? 0}%
현재 상황: ${situation ?? profile.situation ?? "일반"}${surveySection}
    `.trim();

    // ── Claude API 호출 ──────────────────────────────────────────────────
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":         "application/json",
        "x-api-key":            apiKey,
        "anthropic-version":    "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-3-5-haiku-20241022",
        max_tokens: 1500,
        system: `당신은 사주명리학과 현대 커리어 컨설팅을 결합한 AI 진로 상담사입니다.
사용자의 사주 데이터와 사전 설문 응답을 함께 분석하여 실용적이고 개인화된 커리어 인사이트를 제공합니다.
사전 설문 데이터가 있으면 사주와 교차 분석하여 더 구체적이고 맞춤화된 조언을 제공하세요.
특히 의뢰인의 현재 직군, 관심 분야, 강점, 고민을 사주 분석과 연결하여 실질적인 진로 방향을 제시하세요.
반드시 아래 JSON 형식으로만 응답하세요. 마크다운 없이 순수 JSON만 출력하세요.`,
        messages: [
          {
            role: "user",
            content: `다음 사주 데이터를 분석하여 커리어 인사이트를 JSON으로 제공해주세요:

${sajuSummary}

응답 JSON 형식:
{
  "one_liner": "이 사람을 한 문장으로 표현 (20자 이내)",
  "identity_summary": "사주 기반 정체성 요약 (100자 이내)",
  "strengths": ["강점1", "강점2", "강점3"],
  "growth_areas": ["보완점1", "보완점2", "보완점3"],
  "career_analysis": {
    "primary": {
      "field": "1순위 커리어 분야",
      "score": 88,
      "why": "선택 이유 (50자 이내)",
      "specific_roles": ["구체적 직무1", "직무2", "직무3"]
    },
    "secondary": {
      "field": "2순위 커리어 분야",
      "score": 82,
      "why": "선택 이유 (50자 이내)",
      "specific_roles": ["구체적 직무1", "직무2"]
    },
    "avoid": {
      "field": "주의할 커리어 분야",
      "reason": "이유 (40자 이내)"
    }
  },
  "situation_advice": "현재 상황에 맞는 조언 (80자 이내)",
  "timing_insight": "커리어 타이밍 인사이트 (80자 이내)",
  "lucky_keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
}`,
          },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error("[career/analyze] Claude API error:", claudeRes.status, errText);
      return Response.json({ detail: "AI 분석 중 오류가 발생했습니다." }, { status: 502 });
    }

    const claudeData = await claudeRes.json() as {
      content: { type: string; text: string }[];
    };
    const rawText = claudeData.content?.[0]?.text ?? "{}";

    // JSON 파싱 (```json 블록 제거 후)
    const jsonStr = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let analysis: unknown;
    try {
      analysis = JSON.parse(jsonStr);
    } catch {
      console.error("[career/analyze] JSON parse error:", jsonStr.slice(0, 200));
      return Response.json({ detail: "AI 응답 파싱 오류입니다." }, { status: 502 });
    }

    // ── 리포트 저장 ──────────────────────────────────────────────────────
    const report_id = randomUUID();
    const report = {
      report_id,
      status:       "done",
      analysis,
      created_at:   new Date().toISOString(),
      completed_at: new Date().toISOString(),
    };
    ensureDir(REPORTS_DIR);
    writeFileSync(join(REPORTS_DIR, `${report_id}.json`), JSON.stringify(report, null, 2), "utf-8");

    return Response.json(report);

  } catch (err) {
    console.error("[career/analyze]", err);
    return Response.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
