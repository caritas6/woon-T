"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";

const EXPERTS = [
  {
    seal: "김", name: "김명리",
    title: "수석 명리학 전문가",
    career: "명리학 마스터 · 커리어 코치 12년",
    elem: { char: "水", color: "#2E5F8A", bg: "rgba(46,95,138,.2)" },
    spec: ["사주 심층 분석", "커리어 전환 전략", "대운 타이밍"],
    rating: 4.9, reviews: 412,
    available: true,
    slots: ["오전 10:00", "오전 11:00", "오후 2:00", "오후 4:00"],
  },
  {
    seal: "이", name: "이윤채",
    title: "AI 커리어 분석가",
    career: "데이터 사이언티스트 · HR테크 5년",
    elem: { char: "木", color: "#3D7A4A", bg: "rgba(61,122,74,.2)" },
    spec: ["데이터 기반 커리어 매칭", "IT 직군 전문", "스타트업 커리어"],
    rating: 4.8, reviews: 287,
    available: true,
    slots: ["오전 9:00", "오후 1:00", "오후 3:00", "오후 5:00"],
  },
  {
    seal: "박", name: "박도운",
    title: "경영 전략 컨설턴트",
    career: "전략 컨설팅 출신 · MBA 금융",
    elem: { char: "金", color: "#7A8090", bg: "rgba(122,128,144,.2)" },
    spec: ["금융·컨설팅 커리어", "이직 전략", "연봉 협상"],
    rating: 4.9, reviews: 198,
    available: false,
    slots: [],
  },
];

const DURATIONS = [
  { min: 30, price: 29000, label: "30분", desc: "핵심 사주 분석 + 직무 방향 제시" },
  { min: 60, price: 49000, label: "60분", desc: "심층 분석 + 커리어 로드맵 + 녹화본 제공" },
];

interface BookingState {
  expert: typeof EXPERTS[0] | null;
  duration: typeof DURATIONS[0] | null;
  date: string;
  slot: string;
}

export default function ConsultationPage() {
  const { user } = useStore();
  const [booking, setBooking] = useState<BookingState>({
    expert: null, duration: null, date: "", slot: "",
  });
  const [modal, setModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 오늘 이후 7일 날짜 생성
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().slice(0, 10);
  });

  function openModal(expert: typeof EXPERTS[0]) {
    setBooking((b) => ({ ...b, expert, slot: "", date: "" }));
    setModal(true);
  }

  function handleBook() {
    if (!booking.expert || !booking.duration || !booking.date || !booking.slot) return;
    setSubmitted(true);
    setTimeout(() => { setModal(false); setSubmitted(false); }, 2000);
  }

  const canBook = !!booking.duration && !!booking.date && !!booking.slot;

  return (
    <div className="min-h-screen bg-ink">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/90 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 h-13 flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center
                            font-serif text-[10px] font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-xs text-white/40 hover:text-gold transition-colors">
              대시보드 →
            </Link>
          ) : (
            <Link href="/login" className="text-xs text-white/40 hover:text-gold transition-colors">
              로그인
            </Link>
          )}
        </div>
      </header>

      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10">
        {/* 헤딩 */}
        <div className="text-center mb-10">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            전문가 상담
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-3">
            AI 분석 + <span className="text-gold">전문가 심화 상담</span>
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
            AI 리포트를 기반으로 검증된 명리학 전문가와 1:1 화상 상담을 진행합니다.<br/>
            더 깊은 인사이트와 구체적인 액션 플랜을 받아보세요.
          </p>
        </div>

        {/* 상담 방법 */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { step: "01", icon: "🔮", label: "사주 분석 완료", desc: "AI 리포트 생성" },
            { step: "02", icon: "📅", label: "전문가·시간 선택", desc: "원하는 전문가 예약" },
            { step: "03", icon: "💬", label: "화상 상담 진행", desc: "30분 / 60분" },
          ].map((s) => (
            <div key={s.step} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[9px] text-gold/50 tracking-widest">{s.step}</span>
              <p className="text-2xl my-1.5">{s.icon}</p>
              <p className="text-[11px] font-medium text-white/70">{s.label}</p>
              <p className="text-[9px] text-white/30 mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 전문가 카드 */}
        <div className="flex flex-col gap-4">
          {EXPERTS.map((e) => (
            <div key={e.name}
              className={`bg-white/[0.04] border rounded-3xl p-5 transition-colors
                ${e.available ? "border-white/10 hover:border-gold/25" : "border-white/[0.06] opacity-60"}`}>
              <div className="flex items-start gap-4">
                {/* 아바타 */}
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                                font-serif text-2xl font-bold flex-shrink-0"
                  style={{ background: e.elem.bg, color: e.elem.color,
                           border: `2px solid ${e.elem.color}40` }}>
                  {e.seal}
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base font-bold text-white">{e.name}</h3>
                      <p className="text-[11px] text-gold/70">{e.title}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{e.career}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {e.available ? (
                        <span className="text-[10px] bg-wood/20 text-green-400 border border-wood/30
                                         rounded-lg px-2 py-0.5">상담 가능</span>
                      ) : (
                        <span className="text-[10px] bg-white/5 text-white/25 border border-white/10
                                         rounded-lg px-2 py-0.5">예약 마감</span>
                      )}
                    </div>
                  </div>

                  {/* 평점 */}
                  <div className="flex items-center gap-3 mt-2.5 mb-3">
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-[10px] ${s <= Math.round(e.rating) ? "text-gold" : "text-white/20"}`}>★</span>
                      ))}
                    </div>
                    <span className="text-[10px] text-white/30">{e.rating} · 상담 {e.reviews}건</span>
                  </div>

                  {/* 전문 분야 */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {e.spec.map((s) => (
                      <span key={s} className="text-[10px] px-2.5 py-0.5 rounded-full
                                                border border-white/10 text-white/40">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* 요금 + 예약 */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex gap-2">
                      {DURATIONS.map((d) => (
                        <div key={d.min}
                          className="text-center bg-white/[0.04] border border-white/10 rounded-xl
                                     px-3 py-2">
                          <p className="text-xs font-bold text-white">{d.label}</p>
                          <p className="text-[10px] text-gold/80">₩{d.price.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => e.available && user && openModal(e)}
                      disabled={!e.available}
                      className={`text-xs font-medium px-5 py-2.5 rounded-full transition-all
                        ${e.available && user
                          ? "bg-gold text-ink hover:scale-105 cursor-pointer"
                          : !user
                          ? "bg-white/10 text-white/40 cursor-not-allowed"
                          : "bg-white/5 text-white/20 cursor-not-allowed"}`}>
                      {!user ? "로그인 후 예약" : e.available ? "예약하기" : "마감"}
                    </button>
                  </div>

                  {!user && e.available && (
                    <p className="text-[10px] text-white/25 mt-2">
                      <Link href="/login" className="text-gold/60 hover:text-gold">로그인</Link> 후 예약 가능합니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 안내 */}
        <div className="mt-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-[10px] text-white/25 tracking-wider mb-3">상담 안내</p>
          <ul className="flex flex-col gap-2">
            {[
              "모든 상담은 Zoom 화상 미팅으로 진행됩니다",
              "예약 후 이메일로 회의 링크가 발송됩니다",
              "취소는 상담 24시간 전까지 가능합니다",
              "Pro · Premium 회원은 30% · 50% 할인이 적용됩니다",
              "60분 이상 상담은 녹화본이 제공됩니다",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2 text-xs text-white/35">
                <span className="text-gold/40 flex-shrink-0 mt-0.5">·</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {/* 예약 모달 */}
      {modal && booking.expert && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          {/* 오버레이 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setModal(false)} />

          <div className="relative w-full max-w-md bg-ink-2 border border-gold/30 rounded-3xl p-6
                          shadow-2xl animate-fade-up">
            {submitted ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-serif text-lg font-bold text-white mb-2">예약 완료!</p>
                <p className="text-xs text-white/50">이메일로 예약 확인서가 발송됩니다</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-serif text-base font-bold text-white">
                    {booking.expert.name} 전문가 예약
                  </h2>
                  <button onClick={() => setModal(false)}
                    className="text-white/40 hover:text-white text-xl cursor-pointer leading-none">
                    ×
                  </button>
                </div>

                {/* 상담 시간 */}
                <div className="mb-4">
                  <p className="text-[10px] text-white/30 tracking-wider mb-2">상담 시간 선택</p>
                  <div className="grid grid-cols-2 gap-2">
                    {DURATIONS.map((d) => (
                      <button key={d.min}
                        onClick={() => setBooking((b) => ({ ...b, duration: d }))}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer
                          ${booking.duration?.min === d.min
                            ? "border-gold/50 bg-gold/10"
                            : "border-white/10 bg-white/[0.04] hover:border-gold/30"}`}>
                        <p className="text-sm font-bold text-white">{d.label}</p>
                        <p className="text-[10px] text-gold/80">₩{d.price.toLocaleString()}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{d.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div className="mb-4">
                  <p className="text-[10px] text-white/30 tracking-wider mb-2">날짜 선택</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {dateOptions.map((d) => {
                      const dt = new Date(d);
                      const wd = ["일","월","화","수","목","금","토"][dt.getDay()];
                      return (
                        <button key={d}
                          onClick={() => setBooking((b) => ({ ...b, date: d, slot: "" }))}
                          className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl
                                      border transition-all cursor-pointer text-[10px]
                            ${booking.date === d
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-white/45 hover:border-gold/30"}`}>
                          <span>{wd}</span>
                          <span className="font-bold text-xs mt-0.5">{dt.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 시간대 선택 */}
                {booking.date && (
                  <div className="mb-5">
                    <p className="text-[10px] text-white/30 tracking-wider mb-2">시간대 선택</p>
                    <div className="flex flex-wrap gap-2">
                      {booking.expert.slots.map((s) => (
                        <button key={s}
                          onClick={() => setBooking((b) => ({ ...b, slot: s }))}
                          className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer
                            ${booking.slot === s
                              ? "border-gold/50 bg-gold/10 text-gold"
                              : "border-white/10 text-white/45 hover:border-gold/30"}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 예약 요약 */}
                {canBook && (
                  <div className="bg-gold/[0.07] border border-gold/20 rounded-xl px-4 py-3 mb-4 text-xs">
                    <div className="flex justify-between text-white/60 mb-1">
                      <span>{booking.expert.name} 전문가 · {booking.duration!.label}</span>
                      <span className="font-bold text-gold">₩{booking.duration!.price.toLocaleString()}</span>
                    </div>
                    <p className="text-white/35">{booking.date} {booking.slot}</p>
                  </div>
                )}

                <button
                  onClick={handleBook}
                  disabled={!canBook}
                  className={`w-full py-3.5 rounded-full text-sm font-bold transition-all
                    ${canBook
                      ? "bg-gold text-ink hover:scale-[1.02] cursor-pointer"
                      : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
                  {canBook ? "결제 · 예약 확정하기" : "날짜·시간을 선택해 주세요"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
