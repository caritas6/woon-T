// 전역 로딩 상태 — 페이지 전환 시 Suspense 폴백으로 사용됩니다
export default function Loading() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 오행 오각형 스피너 */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-2 border-gold/20 border-t-gold animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-gold/10 border-t-gold/50 animate-spin-slow" />
          </div>
        </div>
        <p className="text-xs text-white/25 animate-pulse">운세를 불러오는 중…</p>
      </div>
    </div>
  );
}
