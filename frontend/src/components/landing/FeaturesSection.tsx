"use client";
import { useState } from "react";

const TABS = [
  {
    id: "saju",
    icon: "☯",
    label: "오행 분석",
    heading: "8글자 속에 숨겨진 나의 본질",
    desc: "생년월일시로 산출되는 사주팔자의 천간·지지를 분석해 木火土金水 오행의 강약을 수치화합니다. 단순한 점술이 아닌, 수천 년 검증된 명리학 알고리즘을 현대적으로 재해석했습니다.",
    points: ["60갑자 기반 만세력 정밀 계산", "일간·월지 가중 오행 점수", "격국·용신·대운 자동 도출"],
    visual: (
      <div className="flex flex-col gap-3">
        {[
          { label: "水 (수·지식)", pct: 82, color: "#2E5F8A" },
          { label: "木 (목·창의)", pct: 68, color: "#3D7A4A" },
          { label: "金 (금·분석)", pct: 55, color: "#7A8090" },
          { label: "火 (화·열정)", pct: 40, color: "#C94B3D" },
          { label: "土 (토·신뢰)", pct: 30, color: "#8B6914" },
        ].map((e) => (
          <div key={e.label}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-white/60">{e.label}</span>
              <span style={{ color: e.color }} className="font-bold">{e.pct}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${e.pct}%`, background: e.color }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "career",
    icon: "🤖",
    label: "AI 커리어",
    heading: "Claude AI가 설계하는 나만의 커리어 로드맵",
    desc: "오행 분석 결과를 현대 직무 언어로 번역합니다. 강점·보완점·최적 업무 환경·추천 직군·커리어 전환 타이밍까지 구체적인 액션 플랜을 제시합니다.",
    points: ["8대 직군 × 40+ 직무 매칭", "강점/보완 영역 상세 분석", "PDF 리포트 다운로드"],
    visual: (
      <div className="flex flex-col gap-2.5">
        {[
          { elem: "水", color: "#2E5F8A", bg: "rgba(46,95,138,.2)", title: "데이터·AI 엔지니어", match: "94%", desc: "분석력·논리" },
          { elem: "木", color: "#3D7A4A", bg: "rgba(61,122,74,.2)",  title: "UX 리서처",       match: "87%", desc: "창의·공감" },
          { elem: "金", color: "#7A8090", bg: "rgba(122,128,144,.2)", title: "전략 컨설턴트",   match: "81%", desc: "구조·실행" },
        ].map((j) => (
          <div key={j.title} className="flex items-center gap-3 bg-white/[0.05] border border-white/10
                                         rounded-xl px-3 py-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm font-bold flex-shrink-0"
              style={{ background: j.bg, color: j.color }}>{j.elem}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80 font-medium truncate">{j.title}</p>
              <p className="text-[10px] text-white/35">{j.desc}</p>
            </div>
            <span className="text-sm font-bold text-gold flex-shrink-0">{j.match}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "calendar",
    icon: "📅",
    label: "운세 캘린더",
    heading: "나의 기운이 강한 날, 조심할 날",
    desc: "일간 오행과 해당 날의 기운을 비교해 매일의 커리어 행운 지수를 산출합니다. 면접·계약·발표·휴식에 최적화된 날을 미리 파악하세요.",
    points: ["일별 커리어 행운 지수 0~100", "면접·계약 최적일 자동 표시", "이메일 알림 연동(Pro)"],
    visual: (
      <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-4">
        <div className="text-[10px] text-white/30 mb-3 tracking-wider">5월 운세</div>
        <div className="grid grid-cols-7 gap-1 text-[9px] text-center mb-1">
          {["일","월","화","수","목","금","토"].map(d => (
            <span key={d} className="text-white/30">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
            const lucky  = [3, 8, 14, 19, 25, 30].includes(d);
            const caution = [5, 12, 20, 27].includes(d);
            const today  = d === 21;
            return (
              <div key={d} className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-medium
                ${today   ? "bg-gold text-ink font-bold" :
                  lucky   ? "bg-water/30 text-blue-300" :
                  caution ? "bg-fire/20 text-red-300" :
                            "text-white/40"}`}>
                {d}
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 mt-3 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" />행운</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />주의</span>
        </div>
      </div>
    ),
  },
  {
    id: "consult",
    icon: "💬",
    label: "전문가 상담",
    heading: "AI + 전문가의 2중 검증",
    desc: "AI 분석 이후 궁금한 점은 검증된 명리학 전문가와 1:1 화상 상담으로 심화 분석을 받아보세요. 운트 전문가는 사주 명리학 자격증 보유 및 커리어 컨설팅 경력 3년 이상 필수입니다.",
    points: ["AI 리포트 기반 맞춤 상담", "30분 / 60분 선택", "녹화본 제공(60분 이상)"],
    visual: (
      <div className="flex flex-col gap-3">
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center font-serif text-lg">김</div>
            <div>
              <p className="text-xs text-white/80 font-medium">김명리 전문가</p>
              <p className="text-[10px] text-white/35">사주명리학 마스터 · 커리어 코치 12년</p>
            </div>
            <span className="ml-auto text-[10px] bg-wood/20 text-green-400 border border-wood/30 rounded-lg px-2 py-0.5">상담 가능</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-white/[0.04] rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-gold">30분</p>
              <p className="text-[10px] text-white/35">₩29,000</p>
            </div>
            <div className="flex-1 bg-gold/10 border border-gold/30 rounded-xl p-2.5 text-center">
              <p className="text-lg font-bold text-gold">60분</p>
              <p className="text-[10px] text-white/35">₩49,000</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-white/30 px-1">
          <span className="w-1 h-1 rounded-full bg-gold/50" />전문가 평점 평균 4.9 / 5.0
        </div>
      </div>
    ),
  },
];

export default function FeaturesSection() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <section id="features" className="bg-ink-2 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            핵심 기능
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            사주 명리학의 정수를 <span className="text-gold">현대적으로</span>
          </h2>
          <p className="text-sm text-white/40 max-w-md mx-auto">
            천년의 지혜와 최신 AI가 만나 나만의 커리어 나침반을 만들어냅니다
          </p>
        </div>

        {/* 탭 */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setActive(i)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium
                transition-all duration-200 cursor-pointer
                ${active === i
                  ? "bg-gold text-ink"
                  : "bg-white/[0.06] text-white/50 hover:text-white hover:bg-white/10 border border-white/10"
                }`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* 컨텐츠 */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* 왼쪽: 텍스트 */}
          <div className="animate-fade-in" key={tab.id}>
            <h3 className="font-serif text-2xl font-bold text-white mb-4 leading-snug">
              {tab.heading}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed mb-6">{tab.desc}</p>
            <ul className="flex flex-col gap-2.5">
              {tab.points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="w-4 h-4 rounded-full bg-gold/20 border border-gold/40
                                   flex items-center justify-center text-gold flex-shrink-0 text-[10px] font-bold">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* 오른쪽: 비주얼 */}
          <div className="bg-white/[0.04] border border-gold/15 rounded-3xl p-5 animate-fade-in" key={tab.id + "-vis"}>
            {tab.visual}
          </div>
        </div>
      </div>
    </section>
  );
}
