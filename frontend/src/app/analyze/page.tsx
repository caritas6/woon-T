"use client";
import { useState } from "react";
import Link from "next/link";
import { sajuApi } from "@/lib/api";
import { useStore } from "@/store/useStore";
import type { SajuResult, Situation } from "@/types";

// ── 상수 ──────────────────────────────────────────────────────────────────

const HOUR_OPTIONS = [
  { value: null,  label: "모름 / 미입력" },
  { value: 23,    label: "자시 (子時)  23:00 ~ 01:00" },
  { value: 1,     label: "축시 (丑時)  01:00 ~ 03:00" },
  { value: 3,     label: "인시 (寅時)  03:00 ~ 05:00" },
  { value: 5,     label: "묘시 (卯時)  05:00 ~ 07:00" },
  { value: 7,     label: "진시 (辰時)  07:00 ~ 09:00" },
  { value: 9,     label: "사시 (巳時)  09:00 ~ 11:00" },
  { value: 11,    label: "오시 (午時)  11:00 ~ 13:00" },
  { value: 13,    label: "미시 (未時)  13:00 ~ 15:00" },
  { value: 15,    label: "신시 (申時)  15:00 ~ 17:00" },
  { value: 17,    label: "유시 (酉時)  17:00 ~ 19:00" },
  { value: 19,    label: "술시 (戌時)  19:00 ~ 21:00" },
  { value: 21,    label: "해시 (亥時)  21:00 ~ 23:00" },
];

const SITUATIONS: { value: Situation; label: string; desc: string }[] = [
  { value: "취업준비생", label: "취업준비생", desc: "처음 직무를 정하고 싶어요" },
  { value: "직장인",    label: "직장인",    desc: "커리어 방향을 점검하고 싶어요" },
  { value: "N잡러",     label: "N잡러",     desc: "나에게 맞는 부업을 찾고 있어요" },
  { value: "창업희망자", label: "창업희망자", desc: "창업 적합성을 확인하고 싶어요" },
];

const ELEM_META: Record<string, { color: string; bg: string; name: string }> = {
  "木": { color: "#3D7A4A", bg: "rgba(61,122,74,.2)",    name: "목(木)" },
  "火": { color: "#C94B3D", bg: "rgba(201,75,61,.2)",    name: "화(火)" },
  "土": { color: "#8B6914", bg: "rgba(139,105,20,.2)",   name: "토(土)" },
  "金": { color: "#7A8090", bg: "rgba(122,128,144,.2)",  name: "금(金)" },
  "水": { color: "#2E5F8A", bg: "rgba(46,95,138,.2)",    name: "수(水)" },
};

const LOADING_PHASES = [
  { icon: "📅", text: "사주팔자 계산 중…" },
  { icon: "☯",  text: "오행 강약 분석 중…" },
  { icon: "🎯", text: "격국·용신 도출 중…" },
  { icon: "🤖", text: "AI 커리어 분석 중…" },
  { icon: "✨", text: "리포트 완성 중…" },
];

// ── 타입 ──────────────────────────────────────────────────────────────────

interface FormData {
  name:      string;
  birthDate: string;
  birthHour: number | null;
  gender:    "M" | "F" | null;
  situation: Situation | null;
}

// ── Step 1: 입력 폼 ────────────────────────────────────────────────────────

function StepForm({
  form, setForm, onSubmit, loading, error,
}: {
  form: FormData;
  setForm: (f: Partial<FormData>) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}) {
  const canSubmit =
    form.birthDate.length === 10 &&
    form.gender !== null &&
    form.situation !== null;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
          나의 <span className="text-gold">사주</span>를 입력해주세요
        </h1>
        <p className="text-sm text-white/40">생년월일시를 기반으로 오행 분석을 시작합니다</p>
      </div>

      <div className="bg-white/[0.04] border border-gold/20 rounded-3xl p-6 md:p-8 flex flex-col gap-6">

        {/* 이름 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">이름 (선택)</label>
          <input
            type="text"
            placeholder="홍길동"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                       text-sm text-white placeholder-white/20 focus:outline-none
                       focus:border-gold/50 transition-colors"
          />
        </div>

        {/* 생년월일 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">
            생년월일 <span className="text-fire/70">*</span>
          </label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ birthDate: e.target.value })}
            min="1920-01-01"
            max="2010-12-31"
            className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                       text-sm text-white focus:outline-none focus:border-gold/50 transition-colors
                       [color-scheme:dark]"
          />
        </div>

        {/* 태어난 시 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">
            태어난 시 <span className="text-white/25">(모를 경우 생략)</span>
          </label>
          <select
            value={form.birthHour ?? "null"}
            onChange={(e) => setForm({ birthHour: e.target.value === "null" ? null : Number(e.target.value) })}
            className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                       text-sm text-white focus:outline-none focus:border-gold/50 transition-colors
                       [color-scheme:dark]">
            {HOUR_OPTIONS.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">
            성별 <span className="text-fire/70">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: "M", label: "남성 (男)" }, { v: "F", label: "여성 (女)" }].map((g) => (
              <button
                key={g.v}
                type="button"
                onClick={() => setForm({ gender: g.v as "M" | "F" })}
                className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                  ${form.gender === g.v
                    ? "bg-gold text-ink border-transparent"
                    : "bg-white/[0.04] border border-white/15 text-white/60 hover:border-gold/40 hover:text-white"}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* 현재 상황 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">
            현재 상황 <span className="text-fire/70">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {SITUATIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm({ situation: s.value })}
                className={`text-left px-3.5 py-3 rounded-xl text-xs transition-all cursor-pointer
                  ${form.situation === s.value
                    ? "bg-gold/15 border border-gold/50 text-gold"
                    : "bg-white/[0.04] border border-white/10 text-white/55 hover:border-gold/30 hover:text-white"}`}>
                <span className="font-medium block">{s.label}</span>
                <span className="text-[10px] opacity-60">{s.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-fire/10 border border-fire/30 rounded-xl px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 제출 */}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className={`w-full py-4 rounded-full text-sm font-bold transition-all
            ${canSubmit && !loading
              ? "bg-gold text-ink hover:scale-[1.02] active:scale-95 cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
          {loading ? "분석 중…" : "무료 사주 분석 시작 →"}
        </button>

        <p className="text-center text-[11px] text-white/20">
          입력 정보는 분석 목적으로만 사용되며 암호화 저장됩니다
        </p>
      </div>
    </div>
  );
}

// ── Step 2: 로딩 ──────────────────────────────────────────────────────────

function StepLoading({ phase }: { phase: number }) {
  const cur = LOADING_PHASES[Math.min(phase, LOADING_PHASES.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] animate-fade-in">
      {/* 오행 회전 */}
      <div className="relative w-28 h-28 mb-10">
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border border-gold/10 animate-[spin_6s_linear_infinite_reverse]" />
        {["木","火","土","金","水"].map((e, i) => {
          const angle = (i / 5) * 360;
          const rad   = (angle - 90) * (Math.PI / 180);
          const x = 50 + 38 * Math.cos(rad);
          const y = 50 + 38 * Math.sin(rad);
          const meta = ELEM_META[e];
          return (
            <div key={e}
              className="absolute w-7 h-7 rounded-full flex items-center justify-center
                         font-serif text-xs font-bold -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%`, background: meta.bg, color: meta.color }}>
              {e}
            </div>
          );
        })}
        {/* 중앙 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30
                          flex items-center justify-center font-serif text-xl text-gold">
            運
          </div>
        </div>
      </div>

      {/* 진행 메시지 */}
      <div className="text-center">
        <p className="text-3xl mb-3 animate-fade-in" key={cur.icon}>{cur.icon}</p>
        <p className="text-sm text-white/60 animate-fade-in" key={cur.text}>{cur.text}</p>
      </div>

      {/* 진행 점 */}
      <div className="flex gap-2 mt-8">
        {LOADING_PHASES.map((_, i) => (
          <div key={i}
            className={`h-1 rounded-full transition-all duration-500
              ${i <= phase ? "bg-gold w-6" : "bg-white/15 w-3"}`} />
        ))}
      </div>
    </div>
  );
}

// ── Step 3: 결과 ──────────────────────────────────────────────────────────

function StepResult({ result }: { result: SajuResult }) {
  const ilElem  = ELEM_META[result.ilgan_element];
  const yongElem = ELEM_META[result.yongsin];

  // 오행 점수 정렬
  const elemEntries = (Object.entries(result.elements) as [string, number][])
    .sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(...elemEntries.map(([, v]) => v));

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-xs text-gold/70 tracking-wider">분석 완료</span>
        <h2 className="font-serif text-2xl font-bold text-white mt-1">
          {result.persona.name}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* 페르소나 카드 */}
        <div className="bg-white/[0.04] border border-gold/20 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center
                            font-serif text-2xl font-bold flex-shrink-0"
              style={{ background: ilElem.bg, color: ilElem.color }}>
              {result.ilgan}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-base font-serif text-white font-bold">
                  {result.persona.emoji} {result.persona.name}
                </span>
              </div>
              <p className="text-[10px] text-white/40 mb-2">
                일간 {result.ilgan} ({ilElem.name}) · 격국 {result.gyeokguk}
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                {result.persona.desc}
              </p>
            </div>
          </div>

          {/* 특성 태그 */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {result.persona.traits.map((t) => (
              <span key={t} className="text-[10px] px-2.5 py-1 rounded-full
                                        bg-gold/10 border border-gold/25 text-gold/80">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 오행 점수 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-white/30 tracking-wider">오행 점수</p>
            <div className="flex items-center gap-1.5 text-[10px] text-white/30">
              용신
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: yongElem.bg, color: yongElem.color }}>
                {result.yongsin} {yongElem.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {elemEntries.map(([elem, score]) => {
              const meta = ELEM_META[elem];
              const pct  = maxScore > 0 ? (score / maxScore) * 100 : 0;
              return (
                <div key={elem}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/55">{meta.name}</span>
                    <span className="font-bold" style={{ color: meta.color }}>{score}</span>
                  </div>
                  <div className="h-2 bg-white/[0.07] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 커리어 매칭 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <p className="text-[10px] text-white/30 tracking-wider mb-3">
            상위 커리어 매칭 (무료: 상위 2개)
          </p>
          <div className="flex flex-col gap-2.5">
            {result.career_matches.map((m, i) => {
              const scoreElem = elemEntries[i]?.[0] ?? "水";
              const meta = ELEM_META[scoreElem];
              return (
                <div key={m.title}
                  className="flex items-center gap-3 bg-white/[0.04] border border-white/10
                             rounded-xl px-3.5 py-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center
                                  font-serif text-xs font-bold flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/85 truncate">{m.title}</p>
                    <p className="text-[10px] text-white/35 truncate">{m.reason}</p>
                  </div>
                  <span className="text-sm font-bold text-gold flex-shrink-0">
                    {m.score}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* 블러 처리된 추가 항목 (회원가입 유도) */}
          <div className="relative mt-2.5">
            <div className="flex flex-col gap-2.5 blur-sm opacity-40 pointer-events-none select-none">
              {[{ t: "전략 컨설턴트", s: "76%" }, { t: "마케팅 디렉터", s: "71%" }].map((j) => (
                <div key={j.t}
                  className="flex items-center gap-3 bg-white/[0.04] border border-white/10
                             rounded-xl px-3.5 py-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                  <div className="flex-1"><div className="h-3 bg-white/20 rounded w-32" /></div>
                  <span className="text-sm font-bold text-gold">{j.s}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-ink/80 border border-gold/30 rounded-xl px-4 py-2.5 text-center backdrop-blur-sm">
                <p className="text-xs text-white/70 mb-0.5">+ 더 많은 매칭 확인</p>
                <p className="text-[10px] text-gold/70">회원가입 후 전체 리포트 무료</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gold/[0.07] border border-gold/25 rounded-2xl p-5 text-center">
          <p className="font-serif text-base font-bold text-white mb-1">
            전체 AI 커리어 리포트 받기
          </p>
          <p className="text-[11px] text-white/40 mb-4">
            격국·용신·대운 심층 분석 + 전 직무 매칭 + PDF 다운로드
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="btn-primary !py-3 !px-7 text-xs">
              무료 회원가입 →
            </Link>
            <Link href="/login" className="btn-ghost !py-2.5 !px-5 text-xs">
              로그인
            </Link>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-center text-xs text-white/25 hover:text-white/50 transition-colors cursor-pointer py-2">
          다시 분석하기
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { setOnboarding, setSajuResult } = useStore();

  const [step,  setStep]  = useState<1 | 2 | 3>(1);
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [error,  setError]  = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setFormRaw] = useState<FormData>({
    name: "", birthDate: "", birthHour: null, gender: null, situation: null,
  });

  function setForm(data: Partial<FormData>) {
    setFormRaw((prev) => ({ ...prev, ...data }));
  }

  async function handleSubmit() {
    if (!form.gender || !form.situation || !form.birthDate) return;

    setError(null);
    setLoading(true);
    setStep(2);
    setPhase(0);

    // 로딩 페이즈 시뮬레이션
    const phaseTimer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, LOADING_PHASES.length - 1));
    }, 1000);

    try {
      setOnboarding({
        birthDate:  form.birthDate,
        birthHour:  form.birthHour,
        gender:     form.gender,
        situation:  form.situation,
        name:       form.name,
      });

      const { data } = await sajuApi.quick(
        form.birthDate,
        form.gender,
        form.birthHour,
        form.situation,
      );

      setSajuResult(data);
      setResult(data);
      // 최소 로딩 시간 보장
      await new Promise((r) => setTimeout(r, 500));
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다. 다시 시도해주세요.";
      setError(msg);
      setStep(1);
    } finally {
      clearInterval(phaseTimer);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      {/* 미니 헤더 */}
      <header className="border-b border-gold/15 py-4 px-6">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center
                            font-serif text-xs font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
          {step > 1 && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <div key={s}
                  className={`h-1 rounded-full transition-all duration-500
                    ${s <= step ? "bg-gold w-6" : "bg-white/15 w-3"}`} />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 배경 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* 컨텐츠 */}
      <main className="flex-1 flex items-start justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <StepForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
          {step === 2 && <StepLoading phase={phase} />}
          {step === 3 && result && <StepResult result={result} />}
        </div>
      </main>
    </div>
  );
}
