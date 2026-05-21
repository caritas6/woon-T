"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

const NAV_LINKS = [
  { href: "/#features", label: "기능" },
  { href: "/#pricing",  label: "요금제" },
  { href: "/calendar",  label: "운세 캘린더" },
  { href: "/consultation", label: "상담소" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useStore();
  const [open, setOpen] = useState(false);

  // 라우트 변경 시 메뉴 닫기
  useEffect(() => { setOpen(false); }, [pathname]);
  // 스크롤 시 메뉴 닫기
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [open]);

  function handleLogout() {
    localStorage.clear();
    clearAuth();
    router.push("/");
  }

  return (
    <>
      <nav className="bg-ink border-b border-gold/20 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center
                            font-serif text-sm font-bold text-ink">
              運
            </div>
            <div>
              <span className="font-serif text-lg text-white font-bold leading-none">운트</span>
              <span className="block text-[8px] text-gold/50 tracking-widest leading-none mt-0.5">
                WOON-T · MY LUCK &amp; TALENT
              </span>
            </div>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[11.5px] text-white/50 hover:text-gold transition-colors tracking-wide"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* 우측: 데스크톱 인증 + 모바일 햄버거 */}
          <div className="flex items-center gap-3">
            {/* 데스크톱 인증 버튼 */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard"
                    className="text-xs text-white/60 hover:text-gold transition-colors">
                    {user.nickname ?? user.email.split("@")[0]}
                  </Link>
                  <button onClick={handleLogout}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="text-xs text-white/60 hover:text-gold transition-colors">
                    로그인
                  </Link>
                  <Link href="/analyze"
                    className="btn-primary !py-2 !px-5 text-xs">
                    무료 분석 시작
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 햄버거 */}
            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
              aria-label="메뉴 열기">
              <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-200
                ${open ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-200
                ${open ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-white/60 rounded-full transition-all duration-200
                ${open ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* 모바일 드롭다운 메뉴 */}
      {open && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-ink border-b border-gold/20
                        shadow-2xl animate-fade-in">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-white/60 hover:text-gold py-2.5 border-b border-white/[0.06]
                           transition-colors last:border-none">
                {l.label}
              </Link>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              {user ? (
                <>
                  <Link href="/dashboard"
                    className="text-sm text-white/60 hover:text-gold transition-colors py-1">
                    {user.nickname ?? user.email.split("@")[0]} 대시보드
                  </Link>
                  <button onClick={handleLogout}
                    className="text-sm text-white/40 text-left py-1 cursor-pointer hover:text-white/60">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="text-center py-2.5 rounded-full border border-white/20
                               text-sm text-white/60 hover:border-gold/40 hover:text-gold transition-all">
                    로그인
                  </Link>
                  <Link href="/analyze" className="btn-primary text-center text-sm">
                    무료 분석 시작 →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 모바일 메뉴 배경 오버레이 */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/30 top-14"
          onClick={() => setOpen(false)} />
      )}
    </>
  );
}
