"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

const PLAN_NAMES: Record<string, string> = {
  pro_monthly:     "Pro 월간",
  pro_yearly:      "Pro 연간",
  premium_monthly: "Premium",
};

function SuccessContent() {
  const params     = useSearchParams();
  const planId     = params.get("planId") ?? "";
  const orderId    = params.get("orderId") ?? "";
  const paymentKey = params.get("paymentKey") ?? "";
  const amount     = params.get("amount") ?? "0";
  const isMock     = params.get("mock") === "true";

  const [status,  setStatus]  = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function confirm() {
      try {
        if (!isMock) {
          await api.post("/payments/toss/confirm", {
            payment_key: paymentKey,
            order_id:    orderId,
            amount:      Number(amount),
          });
        }
        setStatus("done");
      } catch {
        setStatus("error");
        setMessage("결제 확인 중 오류가 발생했습니다. 고객센터에 문의해 주세요.");
      }
    }
    const t = setTimeout(confirm, 800);
    return () => clearTimeout(t);
  }, [isMock, paymentKey, orderId, amount]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold
                          animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/50">결제 확인 중…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-4xl mb-4">❌</p>
          <h1 className="font-serif text-xl font-bold text-white mb-3">결제 확인 실패</h1>
          <p className="text-sm text-white/40 mb-6">{message}</p>
          <Link href="/payment" className="btn-primary">다시 시도</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gold/15 border border-gold/30
                          flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">업그레이드 완료!</h1>
          <p className="text-sm text-white/50">
            <span className="text-gold font-bold">{PLAN_NAMES[planId] ?? planId}</span> 플랜이
            활성화되었습니다
          </p>
        </div>

        <div className="bg-white/[0.04] border border-gold/20 rounded-2xl p-5 mb-6">
          <p className="text-[10px] text-white/30 tracking-wider mb-3">결제 내역</p>
          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-white/60">
              <span>주문 번호</span>
              <span className="font-mono text-[10px] text-white/35 truncate ml-4">
                {orderId || "mock-order"}
              </span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>플랜</span>
              <span className="text-white/80">{PLAN_NAMES[planId] ?? planId}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
              <span className="font-bold text-white">결제 금액</span>
              <span className="font-bold text-gold">₩{Number(amount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-[10px] text-white/25 tracking-wider mb-3">지금 바로 사용 가능</p>
          <ul className="flex flex-col gap-2">
            {[
              "전체 커리어 매칭 리포트 잠금 해제",
              "AI 팔로업 채팅 활성화",
              "월별 운세 캘린더 이용",
              "PDF 리포트 다운로드",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-white/50">
                <span className="text-gold/60">✓</span>{f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="btn-primary text-center">
            대시보드에서 확인하기 →
          </Link>
          <Link href="/analyze"
            className="text-center text-xs text-white/30 hover:text-white/60 transition-colors py-2">
            새로운 사주 분석 시작
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
