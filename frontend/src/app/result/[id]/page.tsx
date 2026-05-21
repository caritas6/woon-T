"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { careerApi, reportApi } from "@/lib/api";
import type { CareerReport, SajuResult, Pillar } from "@/types";

// ── 상수 ──────────────────────────────────────────────────────────────────

const ELEM: Record<string, { color: string; bg: string; name: string }> = {
  "木": { color: "#3D7A4A", bg: "rgba(61,122,74,.18)",    name: "목(木)" },
  "火": { color: "#C94B3D", bg: "rgba(201,75,61,.18)",    name: "화(火)" },
  "土": { color: "#8B6914", bg: "rgba(139,105,20,.18)",   name: "토(土)" },
  "金": { color: "#7A8090", bg: "rgba(122,128,144,.18)",  name: "금(金)" },
  "水": { color: "#2E5F8A", bg: "rgba(46,95,138,.18)",    name: "수(水)" },
};

const PILLAR_LABELS = ["년주(年柱)", "월주(月柱)", "일주(日柱)", "시주(時柱)"];

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────

function PillarCard({ pillar, label }: { pillar: Pillar | null; label: string }) {
  if (!pillar) {
    return (
      <div className="flex flex-col items-center gap-1 opacity-30">
        <span className="text-[9px] text-white/40 tracking-wider">{label}</span>
        <div className="w-14 h-20 rounded-xl border border-white/10 flex items-center justify-center text-white/20 text-xs">
          미입력
        </div>
      </div>
    );
  }
  const stemMeta   = ELEM[pillar.stem_element];
  const branchMeta = ELEM[pillar.branch_element];
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] text-white/35 tracking-wider">{label}</span>
      <div className="w-14 rounded-xl border border-white/15 overflow-hidden">
        <div className="py-3 flex flex-col items-center"
          style={{ background: stemMeta.bg }}>
          <span className="font-serif text-xl font-bold" style={{ color: stemMeta.color }}>
            {pillar.stem}
          </span>
          <span className="text-[9px] mt-0.5" style={{ color: stemMeta.color, opacity: 0.7 }}>
            {pillar.stem_kr}
          </span>
        </div>
        <div className="py-3 flex flex-col items-center border-t border-white/10"
          style={{ background: branchMeta.bg }}>
          <span className="font-serif text-xl font-bold" style={{ color: branchMeta.color }}>
            {pillar.branch}
          </span>
          <span className="text-[9px] mt-0.5" style={{ color: branchMeta.color, opacity: 0.7 }}>
            {pillar.branch_kr}
          </span>
        </div>
      </div>
    </div>
  );
}

function ElementBars({ elements, yongsin }: { elements: SajuResult["elements"]; yongsin: string }) {
  const entries = (Object.entries(elements) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className="flex flex-col gap-2.5">
      {entries.map(([e, score]) => {
        const meta = ELEM[e];
        const pct  = max > 0 ? (score / max) * 100 : 0;
        return (
          <div key={e}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5">
                <span className="font-serif font-bold" style={{ color: meta.color }}>{e}</span>
                <span className="text-white/45">{meta.name}</span>
                {e === yongsin && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full border"
                    style={{ borderColor: `${meta.color}60`, color: meta.color, background: meta.bg }}>
                    용신
                  </span>
                )}
              </span>
              <span className="font-bold" style={{ color: meta.color }}>{score}</span>
            </div>
            <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
              <div className="h-full rounded-full"
                style={{ width: `${pct}%`, background: meta.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DaeunTimeline({ list }: { list: SajuResult["daeun_list"] }) {
  const currentAge = new Date().getFullYear() - 1990; // approximate; real logic needs birthYear
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {list.slice(0, 8).map((d, i) => {
          const meta    = ELEM[d.element];
          const isCur   = d.start_age <= currentAge && currentAge < d.start_age + 10;
          return (
            <div key={i}
              className={`flex flex-col items-center gap-1.5 rounded-2xl px-3 py-3 min-w-[72px]
                border transition-all
                ${isCur
                  ? "border-gold/50 bg-gold/[0.08]"
                  : "border-white/10 bg-white/[0.03]"}`}>
              {isCur && (
                <span className="text-[8px] text-gold font-bold tracking-wider">현재</span>
              )}
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                              font-serif text-base font-bold"
                style={{ background: meta.bg, color: meta.color }}>
                {d.stem}
              </div>
              <div className="text-center">
                <p className="font-serif text-xs font-bold" style={{ color: meta.color }}>
                  {d.stem}{d.branch}
                </p>
                <p className="text-[9px] text-white/30 mt-0.5">
                  {d.start_age}~{d.start_age + 9}세
                </p>
                <p className="text-[9px] text-white/20">{d.relationship}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIAnalysis({ reportId, profileId, isLoggedIn }: {
  reportId: string | null;
  profileId: string;
  isLoggedIn: boolean;
}) {
  const [report,   setReport]   = useState<CareerReport | null>(null);
  const [localId,  setLocalId]  = useState<string | null>(reportId);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // 폴링
  useEffect(() => {
    if (!localId) return;
    if (report?.status === "done" || report?.status === "failed") return;

    const iv = setInterval(async () => {
      try {
        const { data } = await careerApi.getReport(localId);
        setReport(data);
        if (data.status === "done" || data.status === "failed") clearInterval(iv);
      } catch { /* ignore */ }
    }, 2500);

    return () => clearInterval(iv);
  }, [localId, report?.status]);

  async function startAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await careerApi.analyze(profileId);
      setLocalId(data.report_id);
      setReport(data);
    } catch {
      setError("분석 시작 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadPDF() {
    if (!localId) return;
    try {
      const { data } = await reportApi.downloadPdf(localId);
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `운트_커리어리포트_${new Date().toISOString().slice(0,10)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF 다운로드 중 오류가 발생했습니다.");
    }
  }

  // 비로그인
  if (!isLoggedIn) {
    return (
      <div className="bg-gold/[0.06] border border-gold/25 rounded-2xl p-6 text-center">
        <p className="text-2xl mb-3">🔒</p>
        <p className="font-serif text-base font-bold text-white mb-2">AI 커리어 분석 잠금</p>
        <p className="text-xs text-white/40 mb-5 leading-relaxed">
          회원가입 후 전체 AI 분석·강점·성장 영역·최적 타이밍을 무료로 확인하세요
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup" className="btn-primary !py-2.5 !px-6 text-xs">무료 회원가입 →</Link>
          <Link href="/login" className="btn-ghost !py-2 !px-5 text-xs">로그인</Link>
        </div>
      </div>
    );
  }

  // 분석 시작 전
  if (!localId && !loading) {
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-2xl mb-3">🤖</p>
        <p className="font-serif text-base font-bold text-white mb-2">AI 커리어 심층 분석</p>
        <p className="text-xs text-white/40 mb-5 leading-relaxed">
          Claude AI가 나의 사주 데이터를 현대 커리어 언어로 분석합니다<br/>
          (약 30~60초 소요)
        </p>
        <button onClick={startAnalysis}
          className="btn-primary !py-2.5 !px-6 text-xs cursor-pointer">
          AI 분석 시작 →
        </button>
        {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
      </div>
    );
  }

  // 로딩 / 처리중
  if (loading || report?.status === "pending" || report?.status === "processing") {
    return (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold
                        animate-spin mx-auto mb-4" />
        <p className="text-sm text-white/60">AI 분석 중… 잠시 기다려 주세요</p>
        <p className="text-[10px] text-white/25 mt-1">사주 데이터 + 커리어 데이터 교차 분석 중</p>
      </div>
    );
  }

  // 실패
  if (report?.status === "failed") {
    return (
      <div className="bg-fire/10 border border-fire/30 rounded-2xl p-5 text-center">
        <p className="text-sm text-red-300 mb-3">AI 분석 중 오류가 발생했습니다</p>
        <button onClick={startAnalysis} className="text-xs text-gold hover:text-gold-lt cursor-pointer">
          다시 시도
        </button>
      </div>
    );
  }

  // 분석 완료
  const a = report?.analysis;
  if (!a) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* 한 줄 요약 */}
      <div className="bg-gold/[0.08] border border-gold/25 rounded-2xl p-5">
        <p className="text-[10px] text-gold/60 tracking-wider mb-1">AI 분석 요약</p>
        <p className="font-serif text-base font-bold text-white leading-relaxed">"{a.one_liner}"</p>
        <p className="text-xs text-white/45 mt-3 leading-relaxed">{a.identity_summary}</p>
      </div>

      {/* 강점 / 성장 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-wood/[0.06] border border-wood/20 rounded-2xl p-4">
          <p className="text-[10px] text-green-400/70 tracking-wider mb-3">✦ 강점 영역</p>
          <ul className="flex flex-col gap-2">
            {a.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-white/65">
                <span className="text-green-400/60 mt-0.5 flex-shrink-0">→</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-water/[0.06] border border-water/20 rounded-2xl p-4">
          <p className="text-[10px] text-blue-400/70 tracking-wider mb-3">✦ 보완 영역</p>
          <ul className="flex flex-col gap-2">
            {a.growth_areas.map((g) => (
              <li key={g} className="flex items-start gap-2 text-xs text-white/65">
                <span className="text-blue-400/60 mt-0.5 flex-shrink-0">→</span>
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 커리어 분석 */}
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] text-white/30 tracking-wider mb-4">커리어 분석</p>
        <div className="flex flex-col gap-3">
          {/* 주요 */}
          <div className="bg-gold/[0.07] border border-gold/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gold">1순위 · {a.career_analysis.primary.field}</span>
              <span className="text-sm font-bold text-gold">{a.career_analysis.primary.score}%</span>
            </div>
            <p className="text-xs text-white/55 mb-2 leading-relaxed">{a.career_analysis.primary.why}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.career_analysis.primary.specific_roles.map((r) => (
                <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-gold/80">
                  {r}
                </span>
              ))}
            </div>
          </div>
          {/* 보조 */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/70">2순위 · {a.career_analysis.secondary.field}</span>
              <span className="text-sm font-bold text-white/60">{a.career_analysis.secondary.score}%</span>
            </div>
            <p className="text-xs text-white/45 mb-2 leading-relaxed">{a.career_analysis.secondary.why}</p>
            <div className="flex flex-wrap gap-1.5">
              {a.career_analysis.secondary.specific_roles.map((r) => (
                <span key={r} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/15 text-white/50">
                  {r}
                </span>
              ))}
            </div>
          </div>
          {/* 주의 */}
          <div className="bg-fire/[0.05] border border-fire/15 rounded-xl p-3">
            <span className="text-[10px] text-red-400/70">주의 직군 · {a.career_analysis.avoid.field}</span>
            <p className="text-xs text-white/35 mt-1">{a.career_analysis.avoid.reason}</p>
          </div>
        </div>
      </div>

      {/* 상황 조언 + 타이밍 */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/30 tracking-wider mb-2">현 상황 조언</p>
          <p className="text-xs text-white/60 leading-relaxed">{a.situation_advice}</p>
        </div>
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
          <p className="text-[10px] text-white/30 tracking-wider mb-2">커리어 타이밍</p>
          <p className="text-xs text-white/60 leading-relaxed">{a.timing_insight}</p>
        </div>
      </div>

      {/* 행운 키워드 */}
      <div className="flex flex-wrap gap-2">
        {a.lucky_keywords.map((k) => (
          <span key={k} className="text-xs px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold/80">
            # {k}
          </span>
        ))}
      </div>

      {/* PDF 다운로드 */}
      <button onClick={downloadPDF}
        className="w-full py-3 rounded-full border border-gold/30 text-gold/80 text-xs font-medium
                   hover:bg-gold/10 transition-all cursor-pointer">
        📄 PDF 리포트 다운로드
      </button>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function ResultPage() {
  const params     = useParams();
  const router     = useRouter();
  const id         = params?.id as string;

  const { sajuResult, user }  = useStore();
  const { setActiveReport }    = useStore();

  // id가 저장된 결과와 다르면 분석 페이지로
  useEffect(() => {
    if (sajuResult && sajuResult.profile_id !== id) {
      router.replace(`/result/${sajuResult.profile_id}`);
    }
  }, [sajuResult, id, router]);

  if (!sajuResult) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔮</p>
          <h1 className="font-serif text-2xl font-bold text-white mb-3">분석 결과를 찾을 수 없습니다</h1>
          <p className="text-sm text-white/40 mb-6">먼저 사주 분석을 진행해 주세요</p>
          <Link href="/analyze" className="btn-primary">무료 사주 분석 시작 →</Link>
        </div>
      </div>
    );
  }

  const { persona, ilgan, ilgan_element, gyeokguk, yongsin,
          elements, career_matches, daeun_list, year, month, day, hour } = sajuResult;
  const ilMeta = ELEM[ilgan_element];
  const ySMeta = ELEM[yongsin];

  return (
    <div className="min-h-screen bg-ink">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-ink/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-13 flex items-center justify-between py-3">
          <button onClick={() => router.back()}
            className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer flex items-center gap-1.5">
            ← 뒤로
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center
                            font-serif text-[10px] font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold hidden sm:block">운트(Woon-T)</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-white/40 hover:text-gold transition-colors">
            대시보드 →
          </Link>
        </div>
      </header>

      {/* 배경 */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10 flex flex-col gap-6">

        {/* ① 페르소나 헤더 */}
        <div className="bg-white/[0.04] border rounded-3xl p-6"
          style={{ borderColor: `${ilMeta.color}30` }}>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center
                            font-serif text-3xl font-bold flex-shrink-0"
              style={{ background: ilMeta.bg, color: ilMeta.color, border: `2px solid ${ilMeta.color}40` }}>
              {ilgan}
            </div>
            <div className="flex-1">
              <p className="text-2xl mb-1">{persona.emoji}</p>
              <h1 className="font-serif text-xl font-bold text-white">{persona.name}</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${ilMeta.color}40`, color: ilMeta.color, background: ilMeta.bg }}>
                  일간 {ilgan} · {ilMeta.name}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/15 text-white/45">
                  {gyeokguk}
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${ySMeta.color}40`, color: ySMeta.color, background: ySMeta.bg }}>
                  용신 {yongsin} · {ySMeta.name}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-4 leading-relaxed">{persona.desc}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {persona.traits.map((t) => (
              <span key={t} className="text-[10px] px-2.5 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold/80">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ② 사주팔자 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
          <p className="text-[10px] text-white/30 tracking-wider mb-4">사주팔자 (四柱八字)</p>
          <div className="flex justify-center gap-3">
            <PillarCard pillar={year}  label={PILLAR_LABELS[0]} />
            <PillarCard pillar={month} label={PILLAR_LABELS[1]} />
            <PillarCard pillar={day}   label={PILLAR_LABELS[2]} />
            <PillarCard pillar={hour}  label={PILLAR_LABELS[3]} />
          </div>
        </div>

        {/* ③ 오행 점수 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
          <p className="text-[10px] text-white/30 tracking-wider mb-4">오행 강약 (五行强弱)</p>
          <ElementBars elements={elements} yongsin={yongsin} />
        </div>

        {/* ④ 커리어 매칭 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-white/30 tracking-wider">커리어 매칭</p>
            {!user && (
              <Link href="/signup"
                className="text-[10px] text-gold/70 hover:text-gold transition-colors">
                전체 보기 →
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {career_matches.map((m, i) => {
              const entries = Object.entries(elements) as [string, number][];
              const topElem = entries.sort((a, b) => b[1] - a[1])[i % entries.length]?.[0] ?? "水";
              const meta    = ELEM[topElem];
              return (
                <div key={m.title}
                  className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08]
                             rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center
                                  font-serif text-xs font-bold flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">{m.title}</p>
                    <p className="text-[10px] text-white/35 mt-0.5 truncate">{m.reason}</p>
                  </div>
                  <span className="text-base font-bold text-gold flex-shrink-0">{m.score}%</span>
                </div>
              );
            })}
            {!user && (
              <div className="flex items-center justify-center py-3 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-white/30">
                  + {3}개 더 확인하려면{" "}
                  <Link href="/signup" className="text-gold/70 hover:text-gold">회원가입</Link>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ⑤ 대운 타임라인 */}
        {daeun_list.length > 0 && (
          <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
            <p className="text-[10px] text-white/30 tracking-wider mb-4">대운 흐름 (大運)</p>
            <DaeunTimeline list={daeun_list} />
          </div>
        )}

        {/* ⑥ AI 커리어 분석 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-5">
          <p className="text-[10px] text-white/30 tracking-wider mb-4">AI 커리어 심층 분석</p>
          <AIAnalysis
            reportId={null}
            profileId={sajuResult.profile_id}
            isLoggedIn={!!user}
          />
        </div>

        {/* 하단 여백 */}
        <div className="h-4" />
      </main>
    </div>
  );
}
