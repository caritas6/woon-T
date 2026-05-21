"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { fortuneApi } from "@/lib/api";
import type { MonthlyCalendar } from "@/types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const DAY_TYPE_STYLE: Record<string, { dot: string; bg: string; text: string }> = {
  lucky:   { dot: "bg-blue-400",  bg: "bg-water/20",  text: "text-blue-300" },
  good:    { dot: "bg-green-400", bg: "bg-wood/15",   text: "text-green-300" },
  normal:  { dot: "",             bg: "",              text: "text-white/50" },
  caution: { dot: "bg-red-400",   bg: "bg-fire/15",   text: "text-red-300" },
};

function CalendarGrid({ calendar, today }: { calendar: MonthlyCalendar; today: number }) {
  // 해당 월 1일의 요일 계산
  const firstDay = new Date(calendar.year, calendar.month - 1, 1).getDay();
  const totalDays = new Date(calendar.year, calendar.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div key={d}
            className={`text-center text-[10px] py-1.5 font-medium
              ${i === 0 ? "text-red-400/60" : i === 6 ? "text-blue-400/60" : "text-white/25"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dayData  = calendar.days.find((d) => new Date(d.date).getDate() === day);
          const isToday  = day === today;
          const isPeak   = day === calendar.peak_date;
          const style    = dayData ? DAY_TYPE_STYLE[dayData.day_type] : DAY_TYPE_STYLE.normal;
          const isSun    = (firstDay + day - 1) % 7 === 0;
          const isSat    = (firstDay + day - 1) % 7 === 6;

          return (
            <div key={day}
              className={`relative flex flex-col items-center justify-start py-1.5 rounded-xl
                min-h-[48px] transition-all
                ${isToday ? "bg-gold/20 border border-gold/40" :
                  dayData?.day_type !== "normal" ? style.bg : ""}`}>
              <span className={`text-[11px] font-medium
                ${isToday  ? "text-gold font-bold" :
                  isSun     ? "text-red-400/70" :
                  isSat     ? "text-blue-400/70" :
                              style.text}`}>
                {day}
              </span>
              {dayData && dayData.day_type !== "normal" && (
                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${style.dot}`} />
              )}
              {dayData && (
                <span className="text-[8px] text-white/20 mt-0.5">{dayData.score}</span>
              )}
              {isPeak && (
                <span className="absolute -top-1 -right-1 text-[8px]">⭐</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, sajuResult } = useStore();

  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [cal,   setCal]   = useState<MonthlyCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fortuneApi.calendar(year, month)
      .then(({ data }) => setCal(data))
      .catch(() => setError("캘린더를 불러오지 못했습니다"))
      .finally(() => setLoading(false));
  }, [user, year, month]);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  }

  const today = year === now.getFullYear() && month === now.getMonth() + 1
    ? now.getDate() : -1;

  return (
    <div className="min-h-screen bg-ink">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-gold/15 bg-ink/90 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-6 h-13 flex items-center justify-between py-3">
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

      <main className="max-w-2xl mx-auto px-6 py-10 relative z-10">
        <div className="text-center mb-8">
          <div className="gold-tag mb-4 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            운세 캘린더
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            나의 <span className="text-gold">커리어 행운</span> 달력
          </h1>
          {sajuResult && (
            <p className="text-xs text-white/35 mt-1">
              일간 {sajuResult.ilgan} · 용신 {sajuResult.yongsin} 기반 분석
            </p>
          )}
        </div>

        {/* 비로그인 안내 */}
        {!user && (
          <div className="bg-gold/[0.07] border border-gold/25 rounded-2xl p-6 text-center mb-6">
            <p className="text-2xl mb-3">📅</p>
            <p className="font-serif text-base font-bold text-white mb-2">로그인이 필요합니다</p>
            <p className="text-xs text-white/40 mb-5 leading-relaxed">
              나의 사주 기반 월별 운세 캘린더를 확인하려면<br/>먼저 로그인해 주세요
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login" className="btn-primary !py-2.5 !px-6 text-xs">로그인</Link>
              <Link href="/signup" className="btn-ghost !py-2 !px-5 text-xs">회원가입</Link>
            </div>
          </div>
        )}

        {/* 사주 없음 안내 */}
        {user && !sajuResult && (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-center mb-6">
            <p className="text-2xl mb-3">🔮</p>
            <p className="text-sm text-white/60 mb-4">사주 분석 후 개인화된 운세 캘린더를 볼 수 있습니다</p>
            <Link href="/analyze" className="btn-primary !py-2.5 !px-6 text-xs">사주 분석 시작 →</Link>
          </div>
        )}

        {/* 캘린더 */}
        <div className="bg-white/[0.04] border border-gold/15 rounded-3xl p-5">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10
                         flex items-center justify-center text-white/50 hover:text-white
                         hover:border-gold/30 transition-all cursor-pointer text-sm">
              ‹
            </button>
            <div className="text-center">
              <p className="font-serif text-base font-bold text-white">
                {year}년 {month}월
              </p>
              {cal && (
                <p className="text-[10px] text-white/30 mt-0.5">
                  월 평균 행운지수 <span className="text-gold font-bold">{cal.monthly_avg}</span>
                </p>
              )}
            </div>
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10
                         flex items-center justify-center text-white/50 hover:text-white
                         hover:border-gold/30 transition-all cursor-pointer text-sm">
              ›
            </button>
          </div>

          {/* 내용 */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </div>
          )}
          {error && (
            <p className="text-center text-xs text-red-400 py-8">{error}</p>
          )}
          {cal && !loading && (
            <CalendarGrid calendar={cal} today={today} />
          )}
          {!user && !loading && (
            <div className="flex flex-col items-center justify-center py-10 opacity-40 select-none">
              <div className="grid grid-cols-7 gap-0.5 w-full blur-sm">
                {Array.from({ length: 35 }, (_, i) => (
                  <div key={i}
                    className={`h-10 rounded-lg flex items-center justify-center text-[11px]
                      ${i % 7 === 0 ? "text-red-400/50" : "text-white/30"}`}>
                    {i > 0 && i <= 31 ? i : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 범례 */}
        {(user || cal) && (
          <div className="flex gap-4 justify-center mt-4 flex-wrap">
            {[
              { dot: "bg-blue-400",  label: "행운일" },
              { dot: "bg-green-400", label: "좋은 날" },
              { dot: "bg-white/30",  label: "평범" },
              { dot: "bg-red-400",   label: "주의일" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-white/40">
                <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
            <div className="flex items-center gap-1 text-[10px] text-white/40">
              <span>⭐</span> 최고 행운일
            </div>
          </div>
        )}

        {/* 월 이벤트 */}
        {cal && cal.events.length > 0 && (
          <div className="mt-5 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] text-white/30 tracking-wider mb-3">이달의 주요 기운</p>
            <div className="flex flex-col gap-2">
              {cal.events.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-gold text-xs flex-shrink-0 mt-0.5">◆</span>
                  <div>
                    <p className="text-xs text-white/70 font-medium">{ev.title}</p>
                    <p className="text-[10px] text-white/35">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
