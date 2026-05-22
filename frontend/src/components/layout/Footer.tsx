import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-gold/10 py-10 mt-auto">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* 브랜드 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center
                              font-serif text-xs font-bold text-ink">運</div>
              <span className="font-serif text-white font-bold">운트(Woon-T)</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed max-w-52">
              사주 명리학 × 현대 커리어 컨설팅<br/>
              나의 기운으로 찾는 최적의 커리어
            </p>
          </div>

          {/* 링크 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
            <div>
              <p className="text-white/30 mb-2 tracking-widest text-[10px] uppercase">서비스</p>
              {[
                { label: "무료 사주 분석", href: "/analyze" },
                { label: "진로 리포트",   href: "/dashboard" },
                { label: "운세 캘린더",   href: "/calendar" },
                { label: "전문가 상담",   href: "/consultation" },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="block text-white/50 hover:text-gold py-0.5 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <p className="text-white/30 mb-2 tracking-widest text-[10px] uppercase">회사</p>
              {[
                { label: "소개",    href: "/#features" },
                { label: "블로그",  href: "#" },
                { label: "채용",    href: "#" },
                { label: "파트너십", href: "#" },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="block text-white/50 hover:text-gold py-0.5 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <p className="text-white/30 mb-2 tracking-widest text-[10px] uppercase">법적</p>
              {[
                { label: "개인정보처리방침", href: "/privacy" },
                { label: "이용약관",       href: "/terms" },
                { label: "쿠키 정책",      href: "/privacy#cookies" },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                  className="block text-white/50 hover:text-gold py-0.5 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row
                        justify-between items-center gap-2">
          <p className="text-[11px] text-white/20">© 2026 운트(Woon-T). All rights reserved.</p>
          <p className="text-[11px] text-white/20">Powered by Claude AI · 사주 데이터는 암호화 저장됩니다</p>
        </div>
      </div>
    </footer>
  );
}
