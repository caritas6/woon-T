/**
 * /api/v1/saju/quick — 사주 빠른 분석 Route Handler
 * Python 만세력 엔진(api/app/services/saju_engine.py)의 TypeScript 포팅
 * 백엔드(FastAPI) 없이 Next.js 서버에서 직접 실행됩니다.
 */
import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ── 천간 / 지지 ──────────────────────────────────────────────────────────────
const HEAVENLY_STEMS  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
const EARTHLY_BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
const STEM_KR   = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const BRANCH_KR = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;

// ── 오행 매핑 ────────────────────────────────────────────────────────────────
const STEM_ELEMENT: Record<string, string> = {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土",
  "己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
};
const BRANCH_ELEMENT: Record<string, string> = {
  "子":"水","丑":"土","寅":"木","卯":"木","辰":"土",
  "巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水",
};

// ── 지장간 (余氣 → 中氣 → 正氣 순서, 마지막이 正氣/本氣) ──────────────────────
// 格局은 hidden[-1] (正氣)를 기준으로 결정
const BRANCH_HIDDEN_STEMS: Record<string, string[]> = {
  "子":["壬","癸"],      // 壬余, 癸正(水)
  "丑":["癸","辛","己"], // 癸余, 辛中, 己正(土)
  "寅":["戊","丙","甲"], // 戊余, 丙中, 甲正(木)
  "卯":["甲","乙"],      // 甲余, 乙正(木)
  "辰":["乙","癸","戊"], // 乙余, 癸中, 戊正(土)
  "巳":["戊","庚","丙"], // 戊余, 庚中, 丙正(火)
  "午":["丙","丁"],      // 丙余, 丁正(火)
  "未":["丁","乙","己"], // 丁余, 乙中, 己正(土)
  "申":["戊","壬","庚"], // 戊余, 壬中, 庚正(金)
  "酉":["庚","辛"],      // 庚余, 辛正(金)
  "戌":["辛","丁","戊"], // 辛余, 丁中, 戊正(土)
  "亥":["甲","壬"],      // 甲余, 壬正(水)
};

// ── 오행 생극 ────────────────────────────────────────────────────────────────
const ELEMENT_GENERATES:    Record<string,string> = {"木":"火","火":"土","土":"金","金":"水","水":"木"};
const ELEMENT_CONTROLS:     Record<string,string> = {"木":"土","火":"金","土":"水","金":"木","水":"火"};
const ELEMENT_GENERATED_BY: Record<string,string> = Object.fromEntries(
  Object.entries(ELEMENT_GENERATES).map(([k,v]) => [v,k])
);
const ELEMENT_CONTROLLED_BY: Record<string,string> = Object.fromEntries(
  Object.entries(ELEMENT_CONTROLS).map(([k,v]) => [v,k])
);

// ── 십신 ──────────────────────────────────────────────────────────────────────
type RelKey = `${"same"|"gen"|"ctrl"|"by_ctrl"|"by_gen"}_${"true"|"false"}`;
const TEN_GODS_MAP: Record<RelKey, string> = {
  "same_true":"비견","same_false":"겁재",
  "gen_true":"식신","gen_false":"상관",
  "ctrl_true":"편재","ctrl_false":"정재",
  "by_ctrl_true":"편관","by_ctrl_false":"정관",
  "by_gen_true":"편인","by_gen_false":"정인",
};

// ── 격국 페르소나 ─────────────────────────────────────────────────────────────
const GYEOKGUK_PERSONA: Record<string, { name:string; emoji:string; desc:string; traits:string[] }> = {
  "비겁격 (독립 개척가형)": { name:"독립 개척가", emoji:"🦅", desc:"강한 독립심과 추진력으로 새로운 길을 개척합니다.", traits:["자기주도적","경쟁적","목표지향"] },
  "식신격 (창조 표현가형)": { name:"창조 표현가", emoji:"🎨", desc:"풍부한 표현력과 창의성으로 새로운 가치를 만들어냅니다.", traits:["창의적","표현력","안정 추구"] },
  "상관격 (혁신 반항아형)": { name:"혁신 반항아", emoji:"⚡", desc:"기존 틀을 깨는 혁신적 사고로 변화를 이끕니다.", traits:["혁신적","비판적 사고","자유분방"] },
  "편재격 (비즈니스 사냥꾼형)": { name:"비즈니스 사냥꾼", emoji:"💼", desc:"뛰어난 사업감각과 네트워킹으로 기회를 포착합니다.", traits:["사업가적","네트워킹","유연성"] },
  "정재격 (안정 수호자형)": { name:"안정 수호자", emoji:"🏛️", desc:"철저한 계획과 성실함으로 안정적 성과를 만듭니다.", traits:["성실","계획적","재무감각"] },
  "편관격 (전략 지휘관형)": { name:"전략 지휘관", emoji:"⚔️", desc:"강력한 리더십과 전략적 사고로 조직을 이끕니다.", traits:["리더십","전략적","결단력"] },
  "정관격 (정통 리더형)":   { name:"정통 리더",   emoji:"👑", desc:"원칙과 신뢰를 바탕으로 조직에서 인정받습니다.", traits:["원칙주의","신뢰","체계적"] },
  "편인격 (탐구 전문가형)": { name:"탐구 전문가", emoji:"🔬", desc:"깊은 사색과 탐구로 전문 분야를 개척합니다.", traits:["탐구적","직관적","독창적"] },
  "정인격 (지식 멘토형)":   { name:"지식 멘토",   emoji:"📚", desc:"풍부한 지식과 따뜻한 인품으로 사람들을 이끕니다.", traits:["학구적","포용력","인도주의"] },
};

// ── 오행별 직군 (각 오행 8개 — 용신+일간 조합으로 최대 6개 노출) ───────────────
const ELEMENT_CAREERS: Record<string, { title:string; score:number; reason:string }[]> = {
  "木":[
    { title:"디자인교육·교수",           score:96, reason:"성장과 창조를 이끄는 인재 육성 에너지" },
    { title:"광고·브랜드전략 교육",      score:91, reason:"창의적 커뮤니케이션 기획과 전수" },
    { title:"미디어콘텐츠 기획·교육",   score:88, reason:"새로운 미디어 언어를 개척하는 木의 기운" },
    { title:"크리에이티브 디렉션",       score:85, reason:"콘텐츠 성장 방향을 이끄는 리더십" },
    { title:"스타트업·에듀테크 창업",    score:82, reason:"교육과 기술을 결합하는 개척 에너지" },
    { title:"출판·아카데믹 저술",        score:79, reason:"지식의 성장과 체계적 전파" },
    { title:"코칭·멘토링",               score:76, reason:"타인의 성장을 돕는 木의 본성" },
    { title:"전시기획·문화예술교육",     score:73, reason:"예술 성장을 지원하는 문화 기획" },
  ],
  "火":[
    { title:"시각디자인·그래픽디자인",   score:96, reason:"열정적 표현과 강렬한 시각 에너지" },
    { title:"광고·크리에이티브 제작",    score:93, reason:"화(火)의 설득력과 임팩트 있는 메시지" },
    { title:"영상·미디어콘텐츠 제작",    score:90, reason:"동적 에너지와 감성적 스토리텔링" },
    { title:"아트디렉션·비주얼 리더십",  score:87, reason:"비주얼 총괄과 미적 방향 제시" },
    { title:"UX·UI 디자인",             score:84, reason:"사용자 감성 설계와 인터랙션" },
    { title:"마케팅·브랜딩",             score:81, reason:"트렌드 감각과 대중 소통력" },
    { title:"미디어아트·인터랙티브",     score:78, reason:"기술과 예술을 융합하는 창의성" },
    { title:"패션·뷰티·라이프스타일",    score:75, reason:"감성과 트렌드의 시각적 결합" },
  ],
  "土":[
    { title:"대학교수·연구자",            score:94, reason:"안정된 기반 위에서 지식을 전수하는 土" },
    { title:"디자인연구소·정책연구",      score:90, reason:"균형 잡힌 시각으로 디자인 생태계 구축" },
    { title:"광고·미디어 교육행정",      score:87, reason:"조직 안에서 콘텐츠 체계를 세우는 힘" },
    { title:"공간·환경디자인",            score:84, reason:"균형과 안정감을 시각화하는 토(土)" },
    { title:"컨설팅·크리에이티브 자문",  score:81, reason:"신뢰감과 균형 잡힌 전문 시각" },
    { title:"공공디자인·행정",            score:78, reason:"공공 가치를 시각화하는 디자인 기획" },
    { title:"전시·박물관·큐레이션",       score:75, reason:"문화적 안정감과 지식 보존·전시" },
    { title:"사회적 기업·디자인NGO",      score:72, reason:"공동체 가치와 디자인의 결합" },
  ],
  "金":[
    { title:"시각·광고디자인 연구·학술",  score:94, reason:"날카로운 분석력과 비평적 사고" },
    { title:"영상미디어 기술·프로덕션",   score:91, reason:"정밀한 기술 설계와 제작 완성도" },
    { title:"산업·제품·패키지디자인",     score:88, reason:"정밀한 설계와 구조적 조형 감각" },
    { title:"전시·갤러리 큐레이션",       score:85, reason:"심미적 기준과 선별 능력" },
    { title:"UX리서치·데이터 시각화",     score:82, reason:"정확한 분석과 시각적 인사이트" },
    { title:"브랜드 아이덴티티 전략",     score:79, reason:"정밀한 원칙과 일관된 시스템 설계" },
    { title:"법무·저작권·디자인 IP",      score:76, reason:"창작물 보호와 원칙주의" },
    { title:"IT·테크 UX 엔지니어링",      score:73, reason:"디지털 정밀성과 구조적 설계" },
  ],
  "水":[
    { title:"디자인학·시각문화 연구",     score:95, reason:"심층적 사유와 창의 통찰의 학문적 탐구" },
    { title:"광고·미디어 연구·학술",      score:92, reason:"수(水)의 통찰력으로 미디어 흐름 분석" },
    { title:"영상미디어콘텐츠 연구",      score:89, reason:"스토리·흐름·패턴을 꿰뚫는 탐구 기질" },
    { title:"UX리서치·HCI 연구",          score:86, reason:"인간 행동 패턴 인식과 심층 통찰" },
    { title:"심리·감성디자인 연구",       score:83, reason:"공감 능력과 인간 중심 직관" },
    { title:"사진·영상·다큐멘터리",       score:80, reason:"직관적 포착과 서사적 감성" },
    { title:"철학·미학·비주얼컬처 저술",  score:77, reason:"깊은 사유를 시각 언어로 표현" },
    { title:"아트&테크 융합 프로젝트",    score:74, reason:"경계를 넘나드는 수(水)의 유연성" },
  ],
};

// ── 월주 천간 기준점 (五虎遁年起月法) ────────────────────────────────────────
// 甲/己年→丙起(2), 乙/庚年→戊起(4), 丙/辛年→庚起(6), 丁/壬年→壬起(8), 戊/癸年→甲起(0)
const MONTH_STEM_OFFSET: Record<string,number> = {
  "甲":2,"乙":4,"丙":6,"丁":8,"戊":0,"己":2,"庚":4,"辛":6,"壬":8,"癸":0,
};

// ── 절기 근사일 (월별 절기 진입 일자) ──────────────────────────────────────────
// 1월=小寒(6일), 2월=立春(4일), 3월=驚蟄(6일), 4월=清明(5일), 5월=立夏(6일),
// 6월=芒種(6일), 7월=小暑(7일), 8월=立秋(8일), 9월=白露(8일), 10월=寒露(8일),
// 11월=立冬(8일), 12월=大雪(7일)
const SOLAR_TERM_DAY = [6,4,6,5,6,6,7,8,8,8,8,7] as const;

// ── 유틸 ─────────────────────────────────────────────────────────────────────
/** JS의 음수 모듈로 처리 */
function mod(n: number, m: number): number { return ((n % m) + m) % m; }

/** 천간/지지 음양 — 짝수 인덱스 = 양(陽) */
function isYang(char: string): boolean {
  const si = HEAVENLY_STEMS.indexOf(char as typeof HEAVENLY_STEMS[number]);
  if (si >= 0) return si % 2 === 0;
  const bi = EARTHLY_BRANCHES.indexOf(char as typeof EARTHLY_BRANCHES[number]);
  return bi % 2 === 0;
}

// ── 사주 기둥 계산 ────────────────────────────────────────────────────────────
interface Pillar {
  stem: string; branch: string;
  stem_kr: string; branch_kr: string;
  stem_element: string; branch_element: string;
}

function makePillar(stemIdx: number, branchIdx: number): Pillar {
  const si = mod(stemIdx,   10);
  const bi = mod(branchIdx, 12);
  const stem   = HEAVENLY_STEMS[si];
  const branch = EARTHLY_BRANCHES[bi];
  return {
    stem, branch,
    stem_kr:   STEM_KR[si],
    branch_kr: BRANCH_KR[bi],
    stem_element:   STEM_ELEMENT[stem],
    branch_element: BRANCH_ELEMENT[branch],
  };
}

function calcYearPillar(year: number): Pillar {
  return makePillar((year - 4) % 10, (year - 4) % 12);
}

function calcMonthPillar(year: number, month: number, day: number): Pillar {
  const yearStem = HEAVENLY_STEMS[mod(year - 4, 10)];
  const base = MONTH_STEM_OFFSET[yearStem];
  // 2월(입춘 이후)=寅月 기준: adj=0 → solar month 2 → adjMonth = month - 2
  // 절기 정밀 보정 필요 시 SOLAR_TERM_DAY 활용 가능 (현재 간략화)
  const adjMonth = month - 2;
  return makePillar(base + adjMonth, 2 + adjMonth);
}

function calcDayPillar(year: number, month: number, day: number): Pillar {
  const base = new Date(Date.UTC(1900, 0, 1));  // 1900-01-01
  const birth = new Date(Date.UTC(year, month - 1, day));
  const delta = Math.round((birth.getTime() - base.getTime()) / 86_400_000);
  // 1900-01-01 = 甲戌日 → 60갑자 순열 인덱스 10 (甲戌: 甲=0, 戌=10, 순열10번째)
  const idx = mod(10 + delta, 60);
  return makePillar(idx % 10, idx % 12);
}

function calcHourPillar(dayStem: string, hour: number): Pillar {
  const branchIdx = (hour === 23 || hour === 0) ? 0 : mod(Math.floor((hour + 1) / 2), 12);
  const stemOffsets: Record<string,number> = {
    "甲":0,"乙":2,"丙":4,"丁":6,"戊":8,"己":0,"庚":2,"辛":4,"壬":6,"癸":8,
  };
  const base = stemOffsets[dayStem] ?? 0;
  return makePillar(base + branchIdx, branchIdx);
}

// ── 오행 점수 ─────────────────────────────────────────────────────────────────
function calcElements(
  year: Pillar, month: Pillar, day: Pillar, hour: Pillar | null
): Record<string, number> {
  const scores: Record<string,number> = {"木":0,"火":0,"土":0,"金":0,"水":0};
  const pillarsWithWeights: [Pillar, number, number][] = [
    [year,  1.0, 1.0],
    [month, 1.0, 1.3],
    [day,   1.5, 1.0],
    ...(hour ? [[hour, 1.0, 1.0] as [Pillar, number, number]] : []),
  ];
  for (const [p, sw, bw] of pillarsWithWeights) {
    scores[p.stem_element]   += sw;
    scores[p.branch_element] += bw;
  }
  const total = Object.values(scores).reduce((a,b) => a+b, 0) || 1;
  return Object.fromEntries(
    Object.entries(scores).map(([k,v]) => [k, Math.round(v / total * 1000) / 10])
  );
}

// ── 십신 ──────────────────────────────────────────────────────────────────────
function calcTenGods(ilgan: string, targets: string[]): Record<string,string> {
  const ilEl   = STEM_ELEMENT[ilgan];
  const ilYang = isYang(ilgan);
  const result: Record<string,string> = {};

  for (const t of targets) {
    if (!(t in STEM_ELEMENT)) continue;
    const tEl   = STEM_ELEMENT[t];
    const tYang = isYang(t);
    const sameParity = ilYang === tYang;

    let rel: string;
    if (tEl === ilEl)                             rel = "same";
    else if (ELEMENT_GENERATES[ilEl]  === tEl)   rel = "gen";
    else if (ELEMENT_CONTROLS[ilEl]   === tEl)   rel = "ctrl";
    else if (ELEMENT_CONTROLS[tEl]    === ilEl)  rel = "by_ctrl";
    else if (ELEMENT_GENERATES[tEl]   === ilEl)  rel = "by_gen";
    else                                          rel = "same";

    const key = `${rel}_${sameParity}` as RelKey;
    result[t] = TEN_GODS_MAP[key] ?? "비견";
  }
  return result;
}

// ── 격국 ──────────────────────────────────────────────────────────────────────
function calcGyeokguk(ilgan: string, monthBranch: string): string {
  const hidden = BRANCH_HIDDEN_STEMS[monthBranch] ?? [];
  if (hidden.length === 0) return "비겁격 (독립 개척가형)";

  const mainStem = hidden[hidden.length - 1];
  const tg = calcTenGods(ilgan, [mainStem]);
  const god = tg[mainStem] ?? "비견";

  const map: Record<string,string> = {
    "비견":"비겁격 (독립 개척가형)","겁재":"비겁격 (독립 개척가형)",
    "식신":"식신격 (창조 표현가형)","상관":"상관격 (혁신 반항아형)",
    "편재":"편재격 (비즈니스 사냥꾼형)","정재":"정재격 (안정 수호자형)",
    "편관":"편관격 (전략 지휘관형)","정관":"정관격 (정통 리더형)",
    "편인":"편인격 (탐구 전문가형)","정인":"정인격 (지식 멘토형)",
  };
  return map[god] ?? "비겁격 (독립 개척가형)";
}

// ── 용신 ──────────────────────────────────────────────────────────────────────
function calcYongsin(ilgan: string, elements: Record<string,number>): string {
  const ilEl   = STEM_ELEMENT[ilgan];
  const ilScore = elements[ilEl] ?? 0;
  const avg = Object.values(elements).reduce((a,b) => a+b, 0) / 5;
  return ilScore > avg * 1.3
    ? ELEMENT_CONTROLLED_BY[ilEl]
    : ELEMENT_GENERATED_BY[ilEl];
}

// ── 대운 ──────────────────────────────────────────────────────────────────────

/**
 * 기운세수(起運歲數) 계산
 * - 방향 기준: 연간(年干) 음양 + 성별
 *     甲丙戊庚壬年(양) + 남 → 순행 | 양 + 여 → 역행
 *     乙丁己辛癸年(음) + 남 → 역행 | 음 + 여 → 순행
 * - 순행: 생일 → 다음 절기까지 날수 ÷ 3 (버림)
 * - 역행: (생일 − 해당/이전 절기) ÷ 3 (버림)
 */
function calcDaeunStart(
  year: number, month: number, day: number, gender: string
): { startAge: number; forward: boolean } {
  const yearStemIdx = mod(year - 4, 10);
  const isYangYear  = yearStemIdx % 2 === 0;
  const forward = (gender === "M" && isYangYear) || (gender === "F" && !isYangYear);

  const birth = new Date(Date.UTC(year, month - 1, day));
  let diff: number;

  if (forward) {
    const nm = month < 12 ? month + 1 : 1;
    const ny = month < 12 ? year : year + 1;
    const nextTerm = new Date(Date.UTC(ny, nm - 1, SOLAR_TERM_DAY[nm - 1]));
    diff = Math.round((nextTerm.getTime() - birth.getTime()) / 86_400_000);
  } else {
    const termDay = SOLAR_TERM_DAY[month - 1];
    if (day >= termDay) {
      const curTerm = new Date(Date.UTC(year, month - 1, termDay));
      diff = Math.round((birth.getTime() - curTerm.getTime()) / 86_400_000);
    } else {
      const pm = month > 1 ? month - 1 : 12;
      const py = month > 1 ? year : year - 1;
      const prevTerm = new Date(Date.UTC(py, pm - 1, SOLAR_TERM_DAY[pm - 1]));
      diff = Math.round((birth.getTime() - prevTerm.getTime()) / 86_400_000);
    }
  }

  return { startAge: Math.max(Math.floor(diff / 3), 1), forward };
}

function calcDaeun(
  year: number, month: number, day: number,
  gender: string, monthStem: string, monthBranch: string
): { start_age:number; stem:string; branch:string; element:string; relationship:string }[] {
  const { startAge, forward } = calcDaeunStart(year, month, day, gender);
  const msi = HEAVENLY_STEMS.indexOf(monthStem as typeof HEAVENLY_STEMS[number]);
  const mbi = EARTHLY_BRANCHES.indexOf(monthBranch as typeof EARTHLY_BRANCHES[number]);

  return Array.from({ length: 11 }, (_, i) => {
    const step = i + 1;
    const si = mod(msi + (forward ? step : -step), 10);
    const bi = mod(mbi + (forward ? step : -step), 12);
    const stem   = HEAVENLY_STEMS[si];
    const branch = EARTHLY_BRANCHES[bi];
    return {
      start_age: startAge + (step - 1) * 10,
      stem, branch,
      element: STEM_ELEMENT[stem],
      relationship: "중립",
    };
  });
}

// ── 메인 핸들러 ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      birth_date:  string;
      gender:      "M" | "F";
      birth_hour?: number | null;
      situation?:  string;
      survey?:     {
        currentField:   string;
        careerYears:    string;
        interestFields: string[];
        mainConcern:    string;
        strengths:      string[];
        additionalNote: string;
      } | null;
    };

    const { birth_date, gender, birth_hour = null, survey = null } = body;

    // 입력 검증
    if (!birth_date || !gender) {
      return NextResponse.json({ detail: "birth_date와 gender는 필수입니다." }, { status: 422 });
    }
    const [y, m, d] = birth_date.split("-").map(Number);
    if (!y || !m || !d) {
      return NextResponse.json({ detail: "birth_date 형식이 올바르지 않습니다 (YYYY-MM-DD)." }, { status: 422 });
    }

    // ── 사주팔자 계산 ────────────────────────────────────────────────────────
    const yearPillar  = calcYearPillar(y);
    const monthPillar = calcMonthPillar(y, m, d);   // 절기일 포함
    const dayPillar   = calcDayPillar(y, m, d);
    const hourPillar  = (birth_hour !== null && birth_hour !== undefined)
      ? calcHourPillar(dayPillar.stem, birth_hour)
      : null;

    // ── 오행 점수 ────────────────────────────────────────────────────────────
    const elements = calcElements(yearPillar, monthPillar, dayPillar, hourPillar);

    // ── 일간 ────────────────────────────────────────────────────────────────
    const ilgan        = dayPillar.stem;
    const ilganElement = STEM_ELEMENT[ilgan];

    // ── 격국·용신 ────────────────────────────────────────────────────────────
    const gyeokguk = calcGyeokguk(ilgan, monthPillar.branch);
    const yongsin  = calcYongsin(ilgan, elements);

    // ── 십신 (연간·월간·시간) ────────────────────────────────────────────────
    const stemTargets = [yearPillar.stem, monthPillar.stem];
    if (hourPillar) stemTargets.push(hourPillar.stem);
    const tenGods = calcTenGods(ilgan, stemTargets);

    // ── 페르소나 ─────────────────────────────────────────────────────────────
    const personaBase = GYEOKGUK_PERSONA[gyeokguk] ?? {
      name:"탐험가", emoji:"🌟", desc:"독특한 기운을 지닌 인재형입니다.", traits:[],
    };
    const persona = {
      ...personaBase,
      ilgan,
      ilgan_element: ilganElement,
      gyeokguk,
    };

    // ── 직무 매칭 (용신 상위 4 + 일간 보조 2, 중복 제거) ────────────────────
    const primaryCareers   = (ELEMENT_CAREERS[yongsin]     ?? []).slice(0, 4);
    const secondaryCareers = (ELEMENT_CAREERS[ilganElement] ?? [])
      .filter((c) => !primaryCareers.some((p) => p.title === c.title))
      .slice(0, 2)
      .map((c) => ({ ...c, score: Math.max(c.score - 5, 60) })); // 보조 오행은 5점 하향
    const careerMatches = [...primaryCareers, ...secondaryCareers];

    // ── 대운 ────────────────────────────────────────────────────────────────
    const daeunList = calcDaeun(y, m, d, gender, monthPillar.stem, monthPillar.branch);

    // ── 응답 ────────────────────────────────────────────────────────────────
    const result = {
      profile_id:   crypto.randomUUID(),
      year:         yearPillar,
      month:        monthPillar,
      day:          dayPillar,
      hour:         hourPillar,
      elements,
      ilgan,
      ilgan_element: ilganElement,
      gyeokguk,
      yongsin,
      persona,
      career_matches: careerMatches,
      daeun_list:     daeunList,
      ten_gods:       tenGods,
    };

    // ── 사주 프로필 파일 저장 (career/analyze에서 조회용) ────────────────
    // Vercel 서버리스: /tmp 사용 (로컬: data/profiles)
    try {
      const dir = process.env.VERCEL
        ? "/tmp/profiles"
        : join(process.cwd(), "data", "profiles");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(
        join(dir, `${result.profile_id}.json`),
        JSON.stringify({ ...result, birth_date, gender, birth_hour, survey }, null, 2),
        "utf-8"
      );
    } catch { /* 저장 실패는 무시 — 응답에는 영향 없음 */ }

    return NextResponse.json(result);

  } catch (err) {
    console.error("[/api/v1/saju/quick]", err);
    return NextResponse.json(
      { detail: "사주 계산 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
