const EXPERTS = [
  {
    seal: "김",
    name: "김명리",
    title: "수석 명리학 전문가",
    career: "명리학 마스터 · 커리어 코치 12년",
    elem: { char: "水", color: "#2E5F8A", bg: "rgba(46,95,138,.15)" },
    spec: ["사주 심층 분석", "커리어 전환 전략", "대운 타이밍"],
    reviews: 412,
    rating: 4.9,
    quote: "명리학은 과거를 설명하는 학문이 아닙니다. 지금 이 순간 최선의 선택을 돕는 나침반입니다.",
  },
  {
    seal: "이",
    name: "이윤채",
    title: "AI 커리어 분석가",
    career: "데이터 사이언티스트 · HR테크 5년",
    elem: { char: "木", color: "#3D7A4A", bg: "rgba(61,122,74,.15)" },
    spec: ["데이터 기반 커리어 매칭", "IT 직군 전문", "스타트업 커리어"],
    reviews: 287,
    rating: 4.8,
    quote: "사주 데이터와 현대 커리어 데이터의 교차점에서 진짜 인사이트가 나옵니다.",
  },
  {
    seal: "박",
    name: "박도운",
    title: "경영 전략 컨설턴트",
    career: "전략 컨설팅 출신 · MBA 금융",
    elem: { char: "金", color: "#7A8090", bg: "rgba(122,128,144,.15)" },
    spec: ["금융·컨설팅 커리어", "이직 전략", "연봉 협상"],
    reviews: 198,
    rating: 4.9,
    quote: "타고난 기운을 알면 어떤 환경에서 최고의 성과를 낼 수 있는지 명확해집니다.",
  },
];

export default function ExpertsSection() {
  return (
    <section className="bg-ink py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            전문가 상담
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            검증된 전문가와 <span className="text-gold">1:1 심화 상담</span>
          </h2>
          <p className="text-sm text-white/40">
            명리학 자격증 보유 + 커리어 컨설팅 경력 3년 이상 검증
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {EXPERTS.map((e) => (
            <div key={e.name}
              className="bg-white/[0.04] border border-white/10 rounded-3xl p-5 flex flex-col
                         hover:border-gold/30 transition-colors duration-300">
              {/* 헤더 */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                                font-serif text-2xl font-bold flex-shrink-0"
                  style={{ background: e.elem.bg, color: e.elem.color,
                           border: `2px solid ${e.elem.color}40` }}>
                  {e.seal}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-base font-bold text-white">{e.name}</h3>
                  <p className="text-[11px] text-gold/80">{e.title}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{e.career}</p>
                </div>
              </div>

              {/* 평점 */}
              <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white/[0.04] rounded-xl">
                <div>
                  <span className="text-sm font-bold text-gold">{e.rating}</span>
                  <span className="text-[10px] text-white/30"> / 5.0</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-[10px] text-white/30">상담 {e.reviews}건</span>
                <div className="ml-auto flex">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={`text-[10px] ${s <= Math.round(e.rating) ? "text-gold" : "text-white/20"}`}>★</span>
                  ))}
                </div>
              </div>

              {/* 전문 분야 */}
              <div className="mb-4">
                <p className="text-[10px] text-white/25 tracking-wider mb-2">전문 분야</p>
                <div className="flex flex-wrap gap-1.5">
                  {e.spec.map((s) => (
                    <span key={s} className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/45">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* 인용구 */}
              <blockquote className="flex-1 border-l-2 border-gold/30 pl-3 mb-5">
                <p className="text-[11px] text-white/40 leading-relaxed italic">"{e.quote}"</p>
              </blockquote>

              {/* 주도 오행 */}
              <div className="flex items-center gap-2 mb-4 text-[10px] text-white/30">
                <span className="w-5 h-5 rounded-full flex items-center justify-center font-serif text-[11px] font-bold"
                  style={{ background: e.elem.bg, color: e.elem.color }}>
                  {e.elem.char}
                </span>
                {e.elem.char === "水" ? "수(水) 기운 전문" :
                 e.elem.char === "木" ? "목(木) 기운 전문" :
                                        "금(金) 기운 전문"}
              </div>

              <button className="text-center text-xs font-medium text-white/60 border border-white/15
                                 rounded-full py-2.5 hover:border-gold/40 hover:text-gold
                                 transition-all duration-200 cursor-pointer">
                상담 예약하기
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-8">
          Pro · Premium 회원은 전문가 상담 우선 예약 및 할인 혜택을 받습니다
        </p>
      </div>
    </section>
  );
}
