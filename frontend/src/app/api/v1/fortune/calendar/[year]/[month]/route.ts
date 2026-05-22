/**
 * GET /api/v1/fortune/calendar/[year]/[month]
 * 일진(日辰) 60갑자 기반 월별 운세 캘린더 생성
 */

// ── 60갑자 상수 ──────────────────────────────────────────────────────────────
const HEAVENLY_STEMS   = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;

const STEM_ELEMENT: Record<string, string> = {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土",
  "己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
};

/** 천간별 기본 행운 점수 */
const STEM_BASE: Record<string, number> = {
  "甲":82,"乙":78,"丙":88,"丁":84,"戊":76,
  "己":72,"庚":80,"辛":76,"壬":90,"癸":86,
};
/** 지지별 점수 보정 */
const BRANCH_MOD: Record<string, number> = {
  "子":5,"丑":-3,"寅":4,"卯":6,"辰":-2,
  "巳":3,"午":8,"未":-4,"申":2,"酉":4,"戌":-5,"亥":6,
};

/** 특별 길흉 조합 */
const AUSPICIOUS = new Set(["甲子","丙午","壬子","庚午","甲午","壬午","庚子","丙子"]);
const CAUTION    = new Set(["戊戌","己丑","己未","辛丑","辛未","癸丑","癸未"]);

function mod(n: number, m: number) { return ((n % m) + m) % m; }

/** 일주 계산 (1900-01-01 = 甲戌日 = idx 10) */
function dayPillar(year: number, month: number, day: number) {
  const delta = Math.round(
    (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 1)) / 86_400_000
  );
  const idx = mod(10 + delta, 60);
  return { stem: HEAVENLY_STEMS[idx % 10], branch: EARTHLY_BRANCHES[idx % 12] };
}

type DayType = "lucky" | "good" | "normal" | "caution";
interface DayFortune {
  date: string; score: number; day_type: DayType; day_element: string;
}

const EVENT_MSGS: Record<string, { title: string; desc: string }[]> = {
  "木": [
    { title:"성장의 달",   desc:"새로운 프로젝트 시작과 인맥 확장에 유리한 시기" },
    { title:"창의 에너지", desc:"기획·교육·콘텐츠 분야에서 두각을 나타낼 수 있음" },
  ],
  "火": [
    { title:"열정의 달",   desc:"적극적인 자기표현과 영업·발표에 좋은 기운" },
    { title:"인기 상승기", desc:"마케팅·브랜딩·대외 활동이 빛을 발하는 시기" },
  ],
  "土": [
    { title:"안정의 달",   desc:"기반을 다지고 꾸준한 노력이 결실을 맺는 시기" },
    { title:"신뢰 구축기", desc:"HR·컨설팅·조직관리에서 성과를 낼 수 있음" },
  ],
  "金": [
    { title:"결단의 달",   desc:"중요한 결정과 협상·계약에 좋은 기운" },
    { title:"정밀 집중기", desc:"금융·법률·IT 분야에서 집중력이 높아지는 시기" },
  ],
  "水": [
    { title:"지혜의 달",   desc:"깊은 통찰과 연구·분석 작업에 에너지가 집중됨" },
    { title:"직관 강화기", desc:"데이터·R&D·상담 분야에서 영감이 풍부해지는 시기" },
  ],
};

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const { year: ys, month: ms } = await ctx.params;
    const year  = parseInt(ys,  10);
    const month = parseInt(ms, 10);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return Response.json({ detail: "올바르지 않은 년월입니다." }, { status: 422 });
    }

    const totalDays = new Date(year, month, 0).getDate();
    const days: DayFortune[] = [];

    for (let day = 1; day <= totalDays; day++) {
      const { stem, branch } = dayPillar(year, month, day);
      const pair = `${stem}${branch}`;

      let score = (STEM_BASE[stem] ?? 78) + (BRANCH_MOD[branch] ?? 0);
      if (AUSPICIOUS.has(pair)) score += 8;
      if (CAUTION.has(pair))    score -= 10;

      // 날짜 기반 결정론적 미세 변동 (-4 ~ +4)
      score += ((year * 31 + month * 7 + day * 13) % 9) - 4;
      score  = Math.min(99, Math.max(40, score));

      const day_type: DayType =
        score >= 87 ? "lucky"   :
        score >= 76 ? "good"    :
        score >= 65 ? "normal"  : "caution";

      days.push({
        date:        `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`,
        score,
        day_type,
        day_element: STEM_ELEMENT[stem] ?? "土",
      });
    }

    const lucky_days   = days.filter(d => d.day_type === "lucky").map(d => new Date(d.date).getDate());
    const caution_days = days.filter(d => d.day_type === "caution").map(d => new Date(d.date).getDate());
    const peak         = days.reduce((a, b) => a.score > b.score ? a : b);
    const peak_date    = new Date(peak.date).getDate();
    const peak_score   = peak.score;
    const monthly_avg  = Math.round(days.reduce((s, d) => s + d.score, 0) / days.length);

    const mElement = STEM_ELEMENT[dayPillar(year, month, 1).stem] ?? "土";
    const evMsgs   = EVENT_MSGS[mElement] ?? EVENT_MSGS["土"];
    const events   = evMsgs.map((ev, i) => ({
      type:  i === 0 ? "fortune" : "career",
      title: ev.title,
      dates: lucky_days.slice(0, 3),
      desc:  ev.desc,
    }));

    return Response.json({ year, month, days, lucky_days, caution_days, peak_date, peak_score, events, monthly_avg });
  } catch (err) {
    console.error("[fortune/calendar]", err);
    return Response.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
