"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { sajuApi } from "@/lib/api";
import { useStore } from "@/store/useStore";
import type { SajuResult, Situation, SurveyData } from "@/types";

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

// ── 설문 선택지 ───────────────────────────────────────────────────────────

const SURVEY_CURRENT_FIELDS = [
  "미취업·구직중", "교육·학계", "디자인·광고·미디어",
  "IT·개발·데이터", "경영·기획·컨설팅", "마케팅·홍보·브랜딩",
  "금융·투자·회계", "의료·보건·복지", "예술·문화·콘텐츠", "기타",
];

const SURVEY_CAREER_YEARS = [
  "신입 (1년 미만)", "초급 (1~3년)", "중급 (3~7년)",
  "시니어 (7~15년)", "전문가 (15년+)",
];

const SURVEY_INTEREST_FIELDS = [
  "시각디자인·그래픽", "광고·마케팅·브랜딩", "영상·미디어콘텐츠",
  "교육·연구·학술", "IT·개발·UX", "창업·스타트업",
  "경영·전략·컨설팅", "문화·예술기획", "공공·사회·NGO", "글로벌·외국계",
];

const SURVEY_CONCERNS = [
  "직무/직군 전환", "커리어 성장 방향", "수입·처우 향상",
  "일·삶의 균형", "창업·독립", "취업·이직", "전문성 강화",
];

const SURVEY_STRENGTHS = [
  "창의적 사고", "논리적 분석", "대인관계·소통", "기술적 전문성",
  "리더십·추진력", "꼼꼼함·실행력", "학습능력·연구", "감성·예술적 감각",
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
  { icon: "📋", text: "설문 데이터 교차 분석 중…" },
  { icon: "✨", text: "맞춤 리포트 완성 중…" },
];

// ── 타입 ──────────────────────────────────────────────────────────────────

type StepType = "form" | "survey" | "loading" | "result";

interface FormData {
  name:      string;
  birthDate: string;
  birthHour: number | null;
  gender:    "M" | "F" | null;
  situation: Situation | null;
}

// ── 공통 유틸 ─────────────────────────────────────────────────────────────

/** 단일 선택 칩 */
function Chip({
  label, selected, onClick, small,
}: { label: string; selected: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full transition-all cursor-pointer border text-left
        ${small ? "text-[11px] px-3 py-1.5" : "text-xs px-3.5 py-2"}
        ${selected
          ? "bg-gold/15 border-gold/60 text-gold font-medium"
          : "bg-white/[0.04] border-white/12 text-white/55 hover:border-gold/35 hover:text-white"}`}
    >
      {label}
    </button>
  );
}

// ── 커스텀 시(時) 선택 드롭다운 ───────────────────────────────────────────────

function HourSelect({
  value, onChange,
}: { value: number | null; onChange: (v: number | null) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  const selected = HOUR_OPTIONS.find((o) => o.value === value) ?? HOUR_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3
                    text-sm text-left flex items-center justify-between
                    focus:outline-none transition-colors cursor-pointer
                    ${open ? "border-gold/50 text-white" : "border-white/15 text-white/70"}
                    hover:border-gold/40`}
      >
        <span>{selected.label}</span>
        <svg className={`w-4 h-4 text-white/30 transition-transform duration-200 flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#1e1e38] border border-gold/20
                        rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <ul className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
            {HOUR_OPTIONS.map((o) => {
              const isSelected = o.value === value;
              return (
                <li key={String(o.value)}>
                  <button
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer
                                ${isSelected
                                  ? "bg-gold/15 text-gold"
                                  : "text-white/65 hover:bg-white/[0.07] hover:text-white"}`}
                  >
                    {o.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Step 1: 기본 사주 입력 ────────────────────────────────────────────────

function StepForm({
  form, setForm, onNext, error,
}: {
  form: FormData;
  setForm: (f: Partial<FormData>) => void;
  onNext: () => void;
  error: string | null;
}) {
  const canNext =
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
            min="1920-01-01" max="2010-12-31"
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
          <HourSelect value={form.birthHour} onChange={(v) => setForm({ birthHour: v })} />
        </div>

        {/* 성별 */}
        <div>
          <label className="block text-xs text-white/40 mb-2 tracking-wider">
            성별 <span className="text-fire/70">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: "M", label: "남성 (男)" }, { v: "F", label: "여성 (女)" }].map((g) => (
              <button key={g.v} type="button"
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
              <button key={s.value} type="button"
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

        {error && (
          <div className="bg-fire/10 border border-fire/30 rounded-xl px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <button type="button" onClick={onNext} disabled={!canNext}
          className={`w-full py-4 rounded-full text-sm font-bold transition-all
            ${canNext
              ? "bg-gold text-ink hover:scale-[1.02] active:scale-95 cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
          다음 단계 →
        </button>

        <p className="text-center text-[11px] text-white/20">
          입력 정보는 분석 목적으로만 사용되며 암호화 저장됩니다
        </p>
      </div>
    </div>
  );
}

// ── Step 2: 심화 설문 ─────────────────────────────────────────────────────

function StepSurvey({
  survey, setSurvey, onSubmit, onBack,
}: {
  survey: SurveyData;
  setSurvey: (d: Partial<SurveyData>) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  function toggleMulti(key: "interestFields" | "strengths", val: string, max = 3) {
    const cur = survey[key];
    if (cur.includes(val)) {
      setSurvey({ [key]: cur.filter((v) => v !== val) });
    } else if (cur.length < max) {
      setSurvey({ [key]: [...cur, val] });
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
          더 <span className="text-gold">정확한 분석</span>을 위해
        </h1>
        <p className="text-sm text-white/40">
          모두 선택 사항입니다 · 답할수록 AI 분석이 정밀해집니다
        </p>
      </div>

      <div className="flex flex-col gap-5">

        {/* 현재 직군 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/35 tracking-wider mb-3">
            현재 직군 <span className="text-white/20 font-normal">(단일 선택)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_CURRENT_FIELDS.map((f) => (
              <Chip key={f} label={f} small
                selected={survey.currentField === f}
                onClick={() => setSurvey({ currentField: survey.currentField === f ? "" : f })}
              />
            ))}
          </div>
        </div>

        {/* 경력 연수 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/35 tracking-wider mb-3">
            경력 연수 <span className="text-white/20 font-normal">(단일 선택)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_CAREER_YEARS.map((y) => (
              <Chip key={y} label={y} small
                selected={survey.careerYears === y}
                onClick={() => setSurvey({ careerYears: survey.careerYears === y ? "" : y })}
              />
            ))}
          </div>
        </div>

        {/* 관심/희망 분야 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/35 tracking-wider">
              관심 · 희망 분야 <span className="text-white/20 font-normal">(최대 3개)</span>
            </p>
            <span className="text-[10px] text-gold/60">{survey.interestFields.length}/3</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SURVEY_INTEREST_FIELDS.map((f) => (
              <Chip key={f} label={f} small
                selected={survey.interestFields.includes(f)}
                onClick={() => toggleMulti("interestFields", f, 3)}
              />
            ))}
          </div>
        </div>

        {/* 주요 고민 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/35 tracking-wider mb-3">
            지금 가장 큰 고민 <span className="text-white/20 font-normal">(단일 선택)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SURVEY_CONCERNS.map((c) => (
              <Chip key={c} label={c} small
                selected={survey.mainConcern === c}
                onClick={() => setSurvey({ mainConcern: survey.mainConcern === c ? "" : c })}
              />
            ))}
          </div>
        </div>

        {/* 나의 강점 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-white/35 tracking-wider">
              나의 강점 <span className="text-white/20 font-normal">(최대 3개)</span>
            </p>
            <span className="text-[10px] text-gold/60">{survey.strengths.length}/3</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SURVEY_STRENGTHS.map((s) => (
              <Chip key={s} label={s} small
                selected={survey.strengths.includes(s)}
                onClick={() => toggleMulti("strengths", s, 3)}
              />
            ))}
          </div>
        </div>

        {/* 자유 입력 */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
          <p className="text-xs text-white/35 tracking-wider mb-3">
            추가로 알려주고 싶은 것 <span className="text-white/20 font-normal">(선택)</span>
          </p>
          <textarea
            value={survey.additionalNote}
            onChange={(e) => setSurvey({ additionalNote: e.target.value })}
            rows={3}
            maxLength={300}
            placeholder="고민, 특별한 상황, 원하는 분석 방향 등을 자유롭게 적어주세요"
            className="w-full bg-white/[0.05] border border-white/12 rounded-xl px-4 py-3
                       text-sm text-white placeholder-white/20 focus:outline-none
                       focus:border-gold/40 transition-colors resize-none"
          />
          <p className="text-right text-[10px] text-white/20 mt-1">
            {survey.additionalNote.length}/300
          </p>
        </div>

        {/* 완료 선택된 항목 요약 */}
        {(survey.currentField || survey.interestFields.length > 0 || survey.mainConcern) && (
          <div className="bg-gold/[0.05] border border-gold/20 rounded-2xl px-4 py-3">
            <p className="text-[10px] text-gold/60 mb-1.5">선택된 정보 요약</p>
            <div className="flex flex-wrap gap-1.5">
              {survey.currentField && (
                <span className="text-[10px] bg-gold/10 text-gold/80 px-2 py-0.5 rounded-full">
                  📍 {survey.currentField}
                </span>
              )}
              {survey.careerYears && (
                <span className="text-[10px] bg-gold/10 text-gold/80 px-2 py-0.5 rounded-full">
                  ⏱ {survey.careerYears}
                </span>
              )}
              {survey.interestFields.map((f) => (
                <span key={f} className="text-[10px] bg-gold/10 text-gold/80 px-2 py-0.5 rounded-full">
                  ✦ {f}
                </span>
              ))}
              {survey.mainConcern && (
                <span className="text-[10px] bg-gold/10 text-gold/80 px-2 py-0.5 rounded-full">
                  💭 {survey.mainConcern}
                </span>
              )}
              {survey.strengths.map((s) => (
                <span key={s} className="text-[10px] bg-gold/10 text-gold/80 px-2 py-0.5 rounded-full">
                  ⚡ {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={onSubmit}
            className="w-full py-4 rounded-full text-sm font-bold bg-gold text-ink
                       hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
            사주 분석 시작 →
          </button>
          <button type="button" onClick={onBack}
            className="text-center text-xs text-white/30 hover:text-white/60
                       transition-colors cursor-pointer py-1">
            ← 이전으로
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: 로딩 ──────────────────────────────────────────────────────────

function StepLoading({ phase }: { phase: number }) {
  const cur = LOADING_PHASES[Math.min(phase, LOADING_PHASES.length - 1)];
  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] animate-fade-in">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30
                          flex items-center justify-center font-serif text-xl text-gold">運</div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-3xl mb-3 animate-fade-in" key={cur.icon}>{cur.icon}</p>
        <p className="text-sm text-white/60 animate-fade-in" key={cur.text}>{cur.text}</p>
      </div>
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

// ── Step 4: 결과 ──────────────────────────────────────────────────────────

function StepResult({ result }: { result: SajuResult }) {
  const ilElem   = ELEM_META[result.ilgan_element];
  const yongElem = ELEM_META[result.yongsin];
  const elemEntries = (Object.entries(result.elements) as [string, number][])
    .sort((a, b) => b[1] - a[1]);
  const maxScore = Math.max(...elemEntries.map(([, v]) => v));

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <span className="text-xs text-gold/70 tracking-wider">분석 완료</span>
        <h2 className="font-serif text-2xl font-bold text-white mt-1">{result.persona.name}</h2>
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-serif text-white font-bold">
                  {result.persona.emoji} {result.persona.name}
                </span>
              </div>
              <p className="text-[10px] text-white/40 mb-2">
                일간 {result.ilgan} ({ilElem.name}) · 격국 {result.gyeokguk}
              </p>
              <p className="text-xs text-white/60 leading-relaxed">{result.persona.desc}</p>
            </div>
          </div>
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
            맞춤 커리어 매칭 (무료: 상위 2개)
          </p>
          <div className="flex flex-col gap-2.5">
            {result.career_matches.slice(0, 2).map((m, i) => {
              const meta = ELEM_META[elemEntries[i]?.[0] ?? "水"];
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
                  <span className="text-sm font-bold text-gold flex-shrink-0">{m.score}%</span>
                </div>
              );
            })}
          </div>

          {/* 블러 — 추가 항목 */}
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

        {/* 전체 결과 보기 */}
        <Link href={`/result/${result.profile_id}`}
          className="block bg-white/[0.05] border border-white/15 rounded-2xl p-4 text-center
                     hover:border-gold/30 transition-colors">
          <p className="text-xs text-white/60">사주팔자 · 오행 · 대운 타임라인 전체 보기 →</p>
        </Link>

        {/* CTA */}
        <div className="bg-gold/[0.07] border border-gold/25 rounded-2xl p-5 text-center">
          <p className="font-serif text-base font-bold text-white mb-1">전체 AI 커리어 리포트 받기</p>
          <p className="text-[11px] text-white/40 mb-4">
            격국·용신·대운 심층 분석 + 전 직무 매칭 + PDF 다운로드
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup" className="btn-primary !py-3 !px-7 text-xs">무료 회원가입 →</Link>
            <Link href="/login" className="btn-ghost !py-2.5 !px-5 text-xs">로그인</Link>
          </div>
        </div>

        <button onClick={() => window.location.reload()}
          className="text-center text-xs text-white/25 hover:text-white/50 transition-colors cursor-pointer py-2">
          다시 분석하기
        </button>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { user, setOnboarding, setSajuResult, setSurvey, onboarding, sajuResult, survey: savedSurvey } = useStore();

  const [step,  setStep]  = useState<StepType>("form");
  const [phase, setPhase] = useState(0);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  // 저장된 데이터가 현재 사용자(또는 비회원)의 것인지 확인
  const currentOwnerId = user?.id ?? null;
  const isOwnData = onboarding.ownerId === currentOwnerId;

  // 본인 데이터일 때만 폼 자동 채우기 — 다른 사람 데이터 차단
  const [form, setFormRaw] = useState<FormData>({
    name:      isOwnData ? (onboarding.name      || "") : "",
    birthDate: isOwnData ? (onboarding.birthDate || "") : "",
    birthHour: isOwnData ? (onboarding.birthHour ?? null) : null,
    gender:    isOwnData ? (onboarding.gender    ?? null) : null,
    situation: isOwnData ? ((onboarding.situation as Situation | null) ?? null) : null,
  });

  // 설문 상태 (본인 데이터일 때만 복원)
  const [surveyData, setSurveyData] = useState<SurveyData>(
    isOwnData && savedSurvey ? savedSurvey : {
      currentField:   "",
      careerYears:    "",
      interestFields: [],
      mainConcern:    "",
      strengths:      [],
      additionalNote: "",
    }
  );

  function setForm(data: Partial<FormData>) {
    setFormRaw((prev) => ({ ...prev, ...data }));
  }

  function updateSurvey(data: Partial<SurveyData>) {
    setSurveyData((prev) => ({ ...prev, ...data }));
  }

  // Step 1 완료 → Step 2 진입
  function handleNext() {
    if (!form.gender || !form.situation || !form.birthDate) return;
    setError(null);
    setOnboarding({
      ownerId:    currentOwnerId,   // 데이터 소유자 기록
      birthDate:  form.birthDate,
      birthHour:  form.birthHour,
      gender:     form.gender,
      situation:  form.situation,
      name:       form.name,
    });
    setStep("survey");
  }

  // Step 2 완료 → API 호출 + 로딩
  async function handleSubmit() {
    if (!form.gender || !form.situation || !form.birthDate) return;
    setError(null);
    setStep("loading");
    setPhase(0);

    // 설문 저장 (빈 항목이 있어도 저장)
    setSurvey(surveyData);

    const phaseTimer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, LOADING_PHASES.length - 1));
    }, 1000);

    try {
      const { data } = await sajuApi.quick(
        form.birthDate,
        form.gender,
        form.birthHour,
        form.situation,
        surveyData,
      );

      setSajuResult(data);
      setResult(data);
      await new Promise((r) => setTimeout(r, 500));
      setStep("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "분석 중 오류가 발생했습니다. 다시 시도해주세요.";
      setError(msg);
      setStep("form");
    } finally {
      clearInterval(phaseTimer);
    }
  }

  // 진행 단계 표시용 (헤더)
  const stepNum = step === "form" ? 1 : step === "survey" ? 2 : 3;

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

          {/* 진행 표시 */}
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            {["정보입력", "심화설문", "결과"].map((label, i) => {
              const n = i + 1;
              const active = n === stepNum;
              const done   = n < stepNum;
              return (
                <div key={label} className="flex items-center gap-1.5">
                  {i > 0 && <div className="w-6 h-px bg-white/10" />}
                  <div className="flex items-center gap-1">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all
                      ${active ? "bg-gold text-ink" : done ? "bg-gold/40 text-gold" : "bg-white/10 text-white/30"}`}>
                      {done ? "✓" : n}
                    </div>
                    <span className={active ? "text-white/70" : ""}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* 배경 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* 컨텐츠 */}
      <main className="flex-1 flex items-start justify-center px-6 py-10 relative z-10">
        <div className="w-full max-w-lg">

          {/* 이전 결과 배너 — 본인 데이터일 때만 표시 */}
          {step === "form" && sajuResult && isOwnData && (
            <Link href={`/result/${sajuResult.profile_id}`}
              className="flex items-center justify-between gap-3 mb-5
                         bg-gold/[0.08] border border-gold/30 rounded-2xl px-4 py-3
                         hover:bg-gold/[0.13] transition-all group">
              <div className="flex items-center gap-3">
                <span className="text-lg">{sajuResult.persona.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-gold">이전 분석 결과 있음</p>
                  <p className="text-[10px] text-white/40 mt-0.5">
                    일간 {sajuResult.ilgan} · {sajuResult.persona.name} · {sajuResult.gyeokguk}
                  </p>
                </div>
              </div>
              <span className="text-xs text-gold/60 group-hover:text-gold transition-colors flex-shrink-0">
                결과 보기 →
              </span>
            </Link>
          )}

          {step === "form" && (
            <StepForm form={form} setForm={setForm} onNext={handleNext} error={error} />
          )}
          {step === "survey" && (
            <StepSurvey
              survey={surveyData}
              setSurvey={updateSurvey}
              onSubmit={handleSubmit}
              onBack={() => setStep("form")}
            />
          )}
          {step === "loading" && <StepLoading phase={phase} />}
          {step === "result" && result && <StepResult result={result} />}
        </div>
      </main>
    </div>
  );
}
