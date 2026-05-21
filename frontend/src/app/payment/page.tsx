"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";

// ── 요금제 정의 ────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "pro_monthly",
    tier: "pro",
    name: "Pro",
    price: 9900,
    period: "monthly",
    label: "월간",
    features: [
      "전체 커리어 매칭 리포트",
      "월별 운세 캘린더",
      "AI 팔로업 채팅 (월 20회)",
      "PDF 리포트 다운로드",
      "격국·용신·대운 심층 분석",
    ],
    highlight: true,
  },
  {
    id: "pro_yearly",
    tier: "pro",
    name: "Pro 연간",
    price: 7900,
    period: "yearly",
    label: "연간",
    features: [
      "Pro 월간 모든 기능",
      "연간 결제 시 월 ₩2,000 절약",
      "연 ₩94,800 (₩23,400 절약)",
    ],
    highlight: false,
  },
  {
    id: "premium_monthly",
    tier: "premium",
    name: "Premium",
    price: 29900,
    period: "monthly",
    label: "프리미엄",
    features: [
      "Pro 모든 기능 포함",
      "월 1회 전문가 30분 상담 포함",
      "AI 채팅 무제한",
      "대운 흐름 5년 분석",
      "커리어 변화 시점 알림",
    ],
    highlight: false,
  },
];

// Toss Payments 고객 키 (실제 환경에서는 서버에서 발급)
const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY ?? "test_ck_placeholder";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useStore();
  const [selected, setSelected] = useState(PLANS[0]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="font-serif text-2xl font-bold text-white mb-3">로그인이 필요합니다</h1>
          <p className="text-sm text-white/40 mb-6">업그레이드하려면 먼저 로그인해 주세요</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="btn-primary">로그인</Link>
            <Link href="/signup" className="btn-ghost">회원가입</Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.subscription_tier !== "free") {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">이미 구독 중입니다</h1>
          <p className="text-sm text-white/40 mb-6">
            현재 플랜: <span className="text-gold font-bold capitalize">{user.subscription_tier}</span>
          </p>
          <Link href="/dashboard" className="btn-primary">대시보드로 →</Link>
        </div>
      </div>
    );
  }

  async function handlePayment() {
    setLoading(true);
    setError(null);

    const orderId   = `woont_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const orderName = `운트(Woon-T) ${selected.name} 구독`;
    const amount    = selected.price * (selected.period === "yearly" ? 12 : 1);

    try {
      // Toss Payments SDK 동적 로드
      // 실제 환경: @tosspayments/tosspayments-js 패키지 또는 script 태그로 로드
      // MVP: 백엔드로 직접 요청하거나 Toss 위젯 URL로 리다이렉트
      const successUrl = `${window.location.origin}/payment/success?planId=${selected.id}`;
      const failUrl    = `${window.location.origin}/payment/fail`;

      // Toss 결제창 열기 (실제 SDK 연동 시 아래 코드 사용)
      // const toss = await loadTossPayments(TOSS_CLIENT_KEY);
      // await toss.requestPayment("카드", { amount, orderId, orderName, successUrl, failUrl });

      // MVP 시뮬레이션: 1초 후 성공 페이지로
      await new Promise((r) => setTimeout(r, 1000));
      router.push(`/payment/success?planId=${selected.id}&orderId=${orderId}&amount=${amount}&mock=true`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 처리 중 오류가 발생했습니다.";
      setError(msg);
      setLoading(false);
    }
  }

  const totalAmount = selected.price * (selected.period === "yearly" ? 12 : 1);

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-gold/15 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center
                            font-serif text-xs font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
          <Link href="/#pricing" className="text-xs text-white/40 hover:text-gold transition-colors">
            ← 요금제 보기
          </Link>
        </div>
      </header>

      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <main className="max-w-3xl mx-auto px-6 py-10 relative z-10">
        <div className="text-center mb-8">
          <div className="gold-tag mb-4 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            플랜 업그레이드
          </div>
          <h1 className="font-serif text-2xl font-bold text-white">
            나에게 맞는 <span className="text-gold">플랜</span>을 선택하세요
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              className={`text-left rounded-2xl p-4 border transition-all cursor-pointer
                ${selected.id === plan.id
                  ? "border-gold/60 bg-gold/[0.08]"
                  : "border-white/10 bg-white/[0.03] hover:border-gold/30"}`}>
              {plan.highlight && (
                <span className="text-[9px] bg-gold text-ink font-bold px-2 py-0.5 rounded-full mb-2 inline-block">
                  추천
                </span>
              )}
              <p className="text-xs text-white/40 mb-1">{plan.label}</p>
              <p className="font-serif text-lg font-bold text-white">{plan.name}</p>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-2xl font-bold text-gold">₩{plan.price.toLocaleString()}</span>
                <span className="text-[10px] text-white/30 mb-0.5">/월</span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-[10px] text-white/50 flex items-start gap-1.5">
                    <span className="text-gold/50 flex-shrink-0 mt-0.5">✓</span>{f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* 결제 요약 */}
        <div className="bg-white/[0.04] border border-gold/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/70">선택한 플랜</p>
            <p className="font-serif font-bold text-white">{selected.name}</p>
          </div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/70">결제 주기</p>
            <p className="text-sm text-white/60">
              {selected.period === "yearly" ? "연간 (12개월)" : "월간"}
            </p>
          </div>
          <div className="border-t border-white/10 pt-3 flex items-center justify-between">
            <p className="text-sm font-bold text-white">총 결제 금액</p>
            <p className="font-serif text-xl font-bold text-gold">
              ₩{totalAmount.toLocaleString()}
            </p>
          </div>
          {selected.period === "yearly" && (
            <p className="text-[10px] text-white/30 text-right mt-1">
              월 ₩{selected.price.toLocaleString()} × 12개월
            </p>
          )}
        </div>

        {error && (
          <div className="bg-fire/10 border border-fire/30 rounded-xl px-4 py-3 mb-4 text-xs text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-4 rounded-full text-sm font-bold transition-all
            ${!loading
              ? "bg-gold text-ink hover:scale-[1.02] active:scale-95 cursor-pointer"
              : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
          {loading ? "결제창 연결 중…" : `토스페이로 ₩${totalAmount.toLocaleString()} 결제하기`}
        </button>

        <p className="text-center text-[11px] text-white/20 mt-4 leading-relaxed">
          신용카드 · 카카오페이 · 토스페이 지원 · VAT 포함<br/>
          언제든 해지 가능 · 해지 즉시 잔여 기간 서비스 유지
        </p>
      </main>
    </div>
  );
}
