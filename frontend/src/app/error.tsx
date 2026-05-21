"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Sentry로 에러 전송 (instrumentation-client에서 초기화됨)
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="text-center max-w-sm relative z-10 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-fire/10 border border-fire/25 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚡</span>
        </div>

        <h1 className="font-serif text-2xl font-bold text-white mb-3">
          오류가 발생했습니다
        </h1>
        <p className="text-sm text-white/40 mb-2 leading-relaxed">
          예상치 못한 문제가 발생했습니다.
        </p>

        {error.digest && (
          <p className="text-[10px] font-mono text-white/20 mb-6">
            오류 코드: {error.digest}
          </p>
        )}

        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={unstable_retry}
            className="btn-primary cursor-pointer"
          >
            다시 시도하기
          </button>
          <Link href="/"
            className="text-xs text-white/30 hover:text-gold/60 transition-colors py-2">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
