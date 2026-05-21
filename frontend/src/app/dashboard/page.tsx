"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store/useStore";

export default function DashboardPage() {
  const router      = useRouter();
  const { user, sajuResult, clearAuth } = useStore();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  function handleLogout() {
    localStorage.clear();
    clearAuth();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* 헤더 */}
      <header className="border-b border-gold/15 py-4 px-6 sticky top-0 z-10 bg-ink">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center
                            font-serif text-xs font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/40">{user.nickname ?? user.email.split("@")[0]}</span>
            <button onClick={handleLogout}
              className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10">
        {/* 환영 */}
        <div className="mb-8">
          <div className="gold-tag mb-4 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            {user.subscription_tier === "free" ? "무료 플랜" : user.subscription_tier === "pro" ? "Pro" : "Premium"}
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            안녕하세요, {user.nickname ?? user.email.split("@")[0]}님 👋
          </h1>
          <p className="text-sm text-white/40 mt-1">나의 기운을 확인하고 커리어를 설계하세요</p>
        </div>

        {/* 사주 분석 여부 */}
        {sajuResult ? (
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* 페르소나 */}
            <div className="bg-white/[0.04] border border-gold/20 rounded-2xl p-5">
              <p className="text-[10px] text-white/30 tracking-wider mb-3">나의 사주 페르소나</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{sajuResult.persona.emoji}</div>
                <div>
                  <p className="font-serif text-base font-bold text-white">{sajuResult.persona.name}</p>
                  <p className="text-[11px] text-gold/70">일간 {sajuResult.ilgan} · {sajuResult.gyeokguk}</p>
                </div>
              </div>
            </div>

            {/* 상위 직무 */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
              <p className="text-[10px] text-white/30 tracking-wider mb-3">최적 직무 매칭</p>
              {sajuResult.career_matches.slice(0, 2).map((m, i) => (
                <div key={m.title} className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-white/70">{i + 1}. {m.title}</span>
                  <span className="text-xs font-bold text-gold">{m.score}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gold/[0.07] border border-gold/25 rounded-2xl p-6 mb-6 text-center">
            <p className="font-serif text-base font-bold text-white mb-2">아직 사주 분석을 하지 않으셨군요</p>
            <p className="text-xs text-white/40 mb-4">생년월일시를 입력해 나만의 커리어 로드맵을 확인하세요</p>
            <Link href="/analyze" className="btn-primary !py-3 !px-7 text-xs">
              무료 사주 분석 시작 →
            </Link>
          </div>
        )}

        {/* 퀵 링크 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/analyze",      icon: "☯",  label: "사주 분석" },
            { href: "/calendar",     icon: "📅", label: "운세 캘린더" },
            { href: "/consultation", icon: "💬", label: "전문가 상담" },
            { href: "/",             icon: "🏠",  label: "홈으로" },
          ].map((l) => (
            <Link key={l.href} href={l.href}
              className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center
                         hover:border-gold/30 hover:bg-white/[0.07] transition-all">
              <span className="text-2xl block mb-1.5">{l.icon}</span>
              <span className="text-xs text-white/55">{l.label}</span>
            </Link>
          ))}
        </div>

        {/* Pro 업그레이드 배너 */}
        {user.subscription_tier === "free" && (
          <div className="mt-6 bg-gradient-to-r from-gold/[0.08] to-transparent
                          border border-gold/20 rounded-2xl p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-1">Pro로 업그레이드</p>
              <p className="text-[11px] text-white/40">
                전체 커리어 매칭 · 운세 캘린더 · AI 채팅 · PDF 리포트
              </p>
            </div>
            <Link href="/#pricing"
              className="flex-shrink-0 bg-gold text-ink text-xs font-bold
                         px-4 py-2 rounded-full hover:scale-105 transition-transform">
              ₩9,900/월
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
