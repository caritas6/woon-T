"use client";
import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  {
    q: "일을 시작할 때 나는?",
    opts: [
      { label: "데이터를 먼저 수집하고 분석한다", elem: "水" },
      { label: "직관에 따라 빠르게 착수한다", elem: "火" },
      { label: "체계적인 계획을 세운다", elem: "金" },
      { label: "팀원들과 아이디어를 나눈다", elem: "木" },
      { label: "신중하게 리스크를 검토한다", elem: "土" },
    ],
  },
  {
    q: "나의 가장 큰 강점은?",
    opts: [
      { label: "복잡한 것을 단순하게 정리하는 능력", elem: "水" },
      { label: "사람들에게 에너지와 영감을 주는 것", elem: "火" },
      { label: "끝까지 완수하는 실행력", elem: "金" },
      { label: "새로운 아이디어를 끊임없이 내는 것", elem: "木" },
      { label: "신뢰를 쌓고 관계를 유지하는 능력", elem: "土" },
    ],
  },
  {
    q: "이상적인 업무 환경은?",
    opts: [
      { label: "조용하고 집중할 수 있는 공간", elem: "水" },
      { label: "역동적이고 변화가 많은 환경", elem: "火" },
      { label: "명확한 목표와 프로세스가 있는 곳", elem: "金" },
      { label: "자유롭게 실험하고 창조할 수 있는 곳", elem: "木" },
      { label: "안정적이고 예측 가능한 환경", elem: "土" },
    ],
  },
  {
    q: "어려운 결정 앞에서 나는?",
    opts: [
      { label: "근거 자료를 모아 논리적으로 판단", elem: "水" },
      { label: "느낌을 믿고 과감하게 결정", elem: "火" },
      { label: "원칙과 기준에 맞는 선택을 한다", elem: "金" },
      { label: "여러 가능성을 탐색한 후 선택", elem: "木" },
      { label: "주변의 의견을 충분히 수렴한다", elem: "土" },
    ],
  },
  {
    q: "커리어에서 가장 중요한 것은?",
    opts: [
      { label: "전문성과 깊은 지식", elem: "水" },
      { label: "사회적 영향력과 인정", elem: "火" },
      { label: "명확한 성과와 보상", elem: "金" },
      { label: "성장과 새로운 도전", elem: "木" },
      { label: "안정성과 지속 가능성", elem: "土" },
    ],
  },
];

const ELEMENT_INFO: Record<string, { color: string; bg: string; title: string; desc: string; jobs: string[] }> = {
  水: { color: "#2E5F8A", bg: "rgba(46,95,138,.15)", title: "수(水) — 지혜와 분석의 기운",
        desc: "논리적이고 탐구적인 당신은 복잡한 데이터 속에서 인사이트를 찾아냅니다.",
        jobs: ["데이터 사이언티스트", "AI 엔지니어", "리서처", "전략기획"] },
  火: { color: "#C94B3D", bg: "rgba(201,75,61,.15)", title: "화(火) — 열정과 리더십의 기운",
        desc: "카리스마 넘치는 당신은 사람들에게 영감을 주고 변화를 이끌어냅니다.",
        jobs: ["마케터", "세일즈", "스타트업 창업", "PR/브랜드"] },
  金: { color: "#7A8090", bg: "rgba(122,128,144,.15)", title: "금(金) — 실행과 완성의 기운",
        desc: "체계적이고 완벽주의적인 당신은 어떤 일이든 끝까지 완수합니다.",
        jobs: ["금융 분석", "컨설팅", "법률", "엔지니어"] },
  木: { color: "#3D7A4A", bg: "rgba(61,122,74,.15)", title: "목(木) — 창의와 성장의 기운",
        desc: "유연하고 창의적인 당신은 새로운 아이디어로 조직에 생명력을 불어넣습니다.",
        jobs: ["UX 디자이너", "기획자", "콘텐츠 크리에이터", "교육"] },
  土: { color: "#8B6914", bg: "rgba(139,105,20,.15)", title: "토(土) — 신뢰와 안정의 기운",
        desc: "믿음직하고 균형 잡힌 당신은 팀의 든든한 중심이 됩니다.",
        jobs: ["HR/조직 개발", "운영 관리", "공공 서비스", "헬스케어"] },
};

export default function ElementQuiz() {
  const [step, setStep] = useState<"intro" | number | "result">("intro");
  const [answers, setAnswers] = useState<string[]>([]);

  function pick(elem: string) {
    const next = [...answers, elem];
    setAnswers(next);
    if (typeof step === "number" && step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep("result");
    }
  }

  function restart() {
    setAnswers([]);
    setStep("intro");
  }

  // 결과 계산
  const result = (() => {
    if (step !== "result") return null;
    const counts: Record<string, number> = { 水: 0, 火: 0, 金: 0, 木: 0, 土: 0 };
    answers.forEach((a) => { counts[a] = (counts[a] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  })();

  const curQ = typeof step === "number" ? QUESTIONS[step] : null;
  const info = result ? ELEMENT_INFO[result] : null;

  return (
    <section className="bg-ink py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            오행 자가진단
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            나의 기운을 <span className="text-gold">먼저</span> 파악해보세요
          </h2>
          <p className="text-sm text-white/40">5문항으로 나의 주도적인 오행 원소를 알아봅니다</p>
        </div>

        <div className="bg-white/[0.04] border border-gold/20 rounded-3xl p-6 md:p-8">
          {/* 인트로 */}
          {step === "intro" && (
            <div className="text-center animate-fade-in">
              <div className="text-6xl mb-5">☯</div>
              <h3 className="font-serif text-xl font-bold text-white mb-3">오행 원소 자가진단</h3>
              <p className="text-sm text-white/50 mb-8 leading-relaxed">
                5가지 질문에 솔직하게 답하면 나의 주도적인 오행 기운과<br/>
                어울리는 커리어 방향을 바로 확인할 수 있습니다.
              </p>
              <button onClick={() => setStep(0)}
                className="btn-primary">
                진단 시작하기 →
              </button>
            </div>
          )}

          {/* 질문 */}
          {curQ && (
            <div className="animate-fade-in" key={typeof step === "number" ? step : "q"}>
              {/* 진행 바 */}
              <div className="flex items-center gap-3 mb-7">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-500"
                    style={{ width: `${((typeof step === "number" ? step : 0) / QUESTIONS.length) * 100}%` }} />
                </div>
                <span className="text-[11px] text-white/30 flex-shrink-0">
                  {typeof step === "number" ? step + 1 : 0} / {QUESTIONS.length}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-white mb-5">{curQ.q}</h3>
              <div className="flex flex-col gap-2.5">
                {curQ.opts.map((o) => (
                  <button key={o.label} onClick={() => pick(o.elem)}
                    className="text-left px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03]
                               text-sm text-white/65 hover:border-gold/50 hover:text-white hover:bg-white/[0.07]
                               transition-all duration-150 cursor-pointer">
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 결과 */}
          {step === "result" && info && result && (
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center
                              font-serif text-3xl font-bold"
                style={{ background: info.bg, color: info.color, border: `2px solid ${info.color}40` }}>
                {result}
              </div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">{info.title}</h3>
              <p className="text-sm text-white/55 mb-6 leading-relaxed">{info.desc}</p>

              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 mb-6 text-left">
                <p className="text-[10px] text-white/30 tracking-wider mb-2.5">어울리는 직무</p>
                <div className="flex flex-wrap gap-2">
                  {info.jobs.map((j) => (
                    <span key={j} className="text-xs border rounded-full px-3 py-1"
                      style={{ borderColor: `${info.color}50`, color: info.color, background: info.bg }}>
                      {j}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-white/30 mb-5">
                정확한 사주 분석으로 더 깊은 커리어 인사이트를 받아보세요
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/analyze" className="btn-primary">
                  무료 사주 분석 시작 →
                </Link>
                <button onClick={restart}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                  다시 하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
