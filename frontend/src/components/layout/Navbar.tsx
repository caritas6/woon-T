"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const isLanding = pathname === "/";

  function handleLogout() {
    localStorage.clear();
    clearAuth();
    router.push("/");
  }

  return (
    <nav className="bg-ink border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center
                          font-serif text-sm font-bold text-ink flex-shrink-0">
            運
          </div>
          <div>
            <span className="font-serif text-lg text-white font-bold leading-none">운트</span>
            <span className="block text-[8px] text-gold/50 tracking-widest leading-none mt-0.5">
              WOON-T · MY LUCK &amp; TALENT
            </span>
          </div>
        </Link>

        {/* 메뉴 */}
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

        {/* 우측 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard"
                className="text-xs text-white/60 hover:text-gold transition-colors">
                {user.nickname ?? user.email.split("@")[0]}
              </Link>
              <button onClick={handleLogout}
                className="text-xs text-white/40 hover:text-white/70 transition-colors">
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
      </div>
    </nav>
  );
}
