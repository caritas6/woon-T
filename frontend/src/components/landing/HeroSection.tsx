"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const STATS = [
  { num: "2.4만+", label: "분석 완료" },
  { num: "94%",   label: "만족도" },
  { num: "8대",   label: "직군 매칭" },
  { num: "AI",    label: "진로 분석" },
];

const DEMO_JOBS = [
  { elem: "水", color: "#2E5F8A", bg: "rgba(46,95,138,.25)", title: "데이터·AI", match: "94%" },
  { elem: "金", color: "#7A8090", bg: "rgba(122,128,144,.25)", title: "금융·투자", match: "88%" },
  { elem: "木", color: "#3D7A4A", bg: "rgba(61,122,74,.25)",  title: "기획·전략", match: "82%" },
];

export default function HeroSection() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let v = 0;
      const iv = setInterval(() => { v += 2; setScore(v); if (v >= 76) clearInterval(iv); }, 20);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-ink relative overflow-hidden py-20 md:py-28 px-6">
      {/* 배경 그리드 */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* 배경 원 */}
      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full"
        style={{ background: "rgba(201,168,76,.06)" }} />
      <div className="absolute -bottom-10 -left-16 w-60 h-60 rounded-full"
        style={{ background: "rgba(46,95,138,.08)" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* 왼쪽: 텍스트 */}
          <div className="flex-1 text-center lg:text-left">
            <div className="gold-tag mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
              AI 사주 진로 분석 플랫폼
            </div>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-[52px] font-bold text-white
                           leading-[1.2] mb-5 tracking-tight">
              나의 <span className="text-gold">타고난 기운</span>으로<br/>
              찾는 최적의<br/>
              <span className="relative inline-block">
                커리어 로드맵
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gold rounded-full" />
              </span>
            </h1>

            <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              사주 명리학의 오행 분석으로 나의 강점과 적합한 직무를 파악하고,<br/>
              AI가 현대적 커리어 언어로 진로를 설계해 드립니다.
            </p>

            <div className="flex gap-3 justify-center lg:justify-start flex-wrap mb-12">
              <Link href="/analyze" className="btn-primary">
                무료 사주 분석 시작 →
              </Link>
              <Link href="#features" className="btn-ghost">
                기능 살펴보기
              </Link>
            </div>

            {/* 통계 */}
            <div className="flex gap-0 justify-center lg:justify-start">
              {STATS.map((s, i) => (
                <div key={s.label} className={`px-4 sm:px-6 text-center ${i < STATS.length - 1 ? "border-r border-white/10" : ""}`}>
                  <span className="font-serif text-xl sm:text-2xl text-white font-bold block">{s.num}</span>
                  <span className="text-[9px] sm:text-[10px] text-white/35 tracking-wider mt-1 block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 오른쪽: 데모 카드 */}
          <div className="w-full max-w-[340px] flex-shrink-0">
            <div className="bg-white/[0.04] border border-gold/20 rounded-3xl p-5">
              {/* 노치 */}
              <div className="w-16 h-1 rounded-full bg-white/10 mx-auto mb-5" />

              {/* 오늘의 운세 스코어 */}
              <div className="bg-gold/[0.08] border border-gold/20 rounded-2xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-white/35 tracking-wider">TODAY</span>
                  <span className="text-[9px] bg-wood/20 border border-wood/40 rounded-lg px-2 py-0.5 text-green-400">
                    행운 상승 중
                  </span>
                </div>
                <div className="font-serif text-5xl text-gold font-bold leading-none mb-1">
                  {score}
                </div>
                <p className="text-[10px] text-white/40 mb-3">오늘의 커리어 행운 지수</p>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-1000"
                    style={{ width: `${score}%` }} />
                </div>
              </div>

              {/* 직무 추천 */}
              <div className="flex flex-col gap-2">
                {DEMO_JOBS.map((j) => (
                  <div key={j.title}
                    className="bg-white/[0.04] border border-white/[0.07] rounded-xl
                               px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center
                                      font-serif text-xs font-bold"
                        style={{ background: j.bg, color: j.color }}>
                        {j.elem}
                      </div>
                      <span className="text-xs text-white/75 font-medium">{j.title}</span>
                    </div>
                    <span className="text-xs font-bold text-gold">{j.match}</span>
                  </div>
                ))}
              </div>

              {/* 탭바 */}
              <div className="flex justify-around mt-4 pt-3 border-t border-white/[0.06]">
                {["🏠 홈", "🔮 사주", "📅 캘린더", "💬 상담"].map((t, i) => (
                  <span key={t} className={`text-[9px] flex flex-col items-center gap-0.5
                    ${i === 0 ? "text-gold" : "text-white/30"}`}>
                    <span className="text-base">{t.split(" ")[0]}</span>
                    {t.split(" ")[1]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
