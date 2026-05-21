import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-ink py-20 px-6 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,168,76,.06) 0%, transparent 70%)" }} />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        {/* 운 마크 */}
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center
                        font-serif text-3xl text-gold mx-auto mb-8">
          運
        </div>

        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
          지금 바로 나의<br/>
          <span className="text-gold">타고난 기운</span>을 확인하세요
        </h2>
        <p className="text-sm text-white/45 leading-relaxed mb-10 max-w-xl mx-auto">
          생년월일시만 입력하면 3분 안에 오행 분석과 커리어 방향을 확인할 수 있습니다.<br/>
          신용카드 불필요 · 무료로 시작
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-12">
          <Link href="/analyze" className="btn-primary text-base px-10 py-5">
            무료 사주 분석 시작 →
          </Link>
          <Link href="#features" className="btn-ghost text-sm">
            기능 먼저 보기
          </Link>
        </div>

        {/* 신뢰 지표 */}
        <div className="flex justify-center gap-8 flex-wrap">
          {[
            { num: "2.4만+", label: "분석 완료" },
            { num: "94%",   label: "만족도" },
            { num: "3분",   label: "분석 소요 시간" },
            { num: "무료",  label: "기본 분석" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <span className="font-serif text-xl text-white font-bold block">{s.num}</span>
              <span className="text-[10px] text-white/30 tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
