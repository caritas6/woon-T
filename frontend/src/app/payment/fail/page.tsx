"use client";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function FailContent() {
  const params  = useSearchParams();
  const code    = params.get("code") ?? "";
  const message = params.get("message") ?? "결제가 취소되었거나 오류가 발생했습니다.";

  const isUserCancel = code === "PAY_PROCESS_CANCELED" || message.includes("취소");

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center animate-fade-in">
        <p className="text-5xl mb-5">{isUserCancel ? "🚫" : "⚠️"}</p>
        <h1 className="font-serif text-2xl font-bold text-white mb-2">
          {isUserCancel ? "결제가 취소되었습니다" : "결제에 실패했습니다"}
        </h1>
        <p className="text-sm text-white/40 mb-2 leading-relaxed">{message}</p>
        {code && (
          <p className="text-[11px] text-white/20 mb-8 font-mono">오류 코드: {code}</p>
        )}

        {!isUserCancel && (
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-6 text-left">
            <p className="text-[10px] text-white/25 tracking-wider mb-2">자주 있는 원인</p>
            <ul className="flex flex-col gap-1.5">
              {[
                "카드 한도 초과 또는 잔액 부족",
                "카드사 일시적 오류",
                "결제 정보 불일치",
              ].map((t) => (
                <li key={t} className="text-xs text-white/40 flex items-center gap-2">
                  <span className="text-white/20">·</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/payment" className="btn-primary">
            {isUserCancel ? "요금제 다시 보기" : "결제 다시 시도"}
          </Link>
          <Link href="/dashboard"
            className="text-xs text-white/30 hover:text-white/60 transition-colors py-2">
            대시보드로 돌아가기
          </Link>
        </div>

        <p className="text-[10px] text-white/15 mt-8">
          문제가 지속되면{" "}
          <a href="mailto:hello@woon-t.com" className="text-gold/50 hover:text-gold">
            hello@woon-t.com
          </a>
          으로 문의해 주세요
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    }>
      <FailContent />
    </Suspense>
  );
}
