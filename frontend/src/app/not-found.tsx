import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="text-center max-w-sm relative z-10 animate-fade-in">
        {/* 404 표시 */}
        <div className="font-serif text-[120px] font-bold leading-none text-gold/15 select-none mb-2">
          404
        </div>

        {/* 아이콘 */}
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center mx-auto -mt-8 mb-6">
          <span className="text-2xl">☯</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white mb-3">
          길을 잃으셨군요
        </h1>
        <p className="text-sm text-white/40 mb-8 leading-relaxed">
          찾으시는 페이지가 이동되었거나 삭제됐습니다.<br />
          사주가 다른 길을 가리키고 있을지도 모릅니다.
        </p>

        <div className="flex flex-col gap-3 items-center">
          <Link href="/" className="btn-primary">
            홈으로 돌아가기 →
          </Link>
          <Link href="/analyze"
            className="text-xs text-white/30 hover:text-gold/60 transition-colors py-2">
            사주 분석 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
