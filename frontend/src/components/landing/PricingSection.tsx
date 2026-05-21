"use client";
import { useState } from "react";
import Link from "next/link";

const PLANS = [
  {
    name: "무료",
    price: { month: 0, year: 0 },
    desc: "사주 분석을 처음 경험해보세요",
    highlight: false,
    features: [
      { text: "사주팔자 기본 분석", ok: true },
      { text: "오행 점수 확인", ok: true },
      { text: "상위 2개 직무 추천", ok: true },
      { text: "전체 커리어 매칭 리포트", ok: false },
      { text: "운세 캘린더", ok: false },
      { text: "AI 팔로업 채팅", ok: false },
      { text: "PDF 리포트 다운로드", ok: false },
    ],
    cta: "무료로 시작",
    href: "/analyze",
    tag: null,
  },
  {
    name: "Pro",
    price: { month: 9900, year: 7900 },
    desc: "본격적인 커리어 설계를 원한다면",
    highlight: true,
    features: [
      { text: "사주팔자 심층 분석", ok: true },
      { text: "오행 점수 + 격국·용신·대운", ok: true },
      { text: "전 직무 커리어 매칭 리포트", ok: true },
      { text: "월별 운세 캘린더", ok: true },
      { text: "AI 팔로업 채팅 (월 20회)", ok: true },
      { text: "PDF 리포트 다운로드", ok: true },
      { text: "전문가 상담 할인 30%", ok: false },
    ],
    cta: "Pro 시작하기",
    href: "/analyze",
    tag: "가장 인기",
  },
  {
    name: "Premium",
    price: { month: 29900, year: 24900 },
    desc: "전문가와 함께하는 완전한 솔루션",
    highlight: false,
    features: [
      { text: "Pro 모든 기능 포함", ok: true },
      { text: "대운 흐름 5년 분석", ok: true },
      { text: "AI 팔로업 채팅 (무제한)", ok: true },
      { text: "월 1회 전문가 30분 상담 포함", ok: true },
      { text: "전문가 상담 할인 50%", ok: true },
      { text: "우선 상담 예약", ok: true },
      { text: "커리어 변화 시점 알림", ok: true },
    ],
    cta: "Premium 시작하기",
    href: "/analyze",
    tag: "전문가 추천",
  },
];

function fmt(n: number) {
  if (n === 0) return "무료";
  return `₩${n.toLocaleString()}`;
}

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="bg-ink-2 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            요금제
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            나에게 맞는 <span className="text-gold">플랜</span>을 선택하세요
          </h2>
          <p className="text-sm text-white/40 mb-8">첫 분석은 무료 · 언제든 플랜 변경 가능</p>

          {/* 토글 */}
          <div className="inline-flex items-center gap-3 bg-white/[0.06] border border-white/10 rounded-full p-1">
            <button onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer
                ${!annual ? "bg-gold text-ink" : "text-white/50 hover:text-white"}`}>
              월간
            </button>
            <button onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2
                ${annual ? "bg-gold text-ink" : "text-white/50 hover:text-white"}`}>
              연간
              {annual
                ? <span className="text-[9px] font-bold">최대 20% 절약</span>
                : <span className="text-[9px] bg-fire/30 text-red-300 rounded-full px-1.5 py-0.5">20% ↓</span>}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((p) => (
            <div key={p.name}
              className={`relative rounded-3xl p-6 flex flex-col
                ${p.highlight
                  ? "bg-gold/[0.08] border-2 border-gold/50"
                  : "bg-white/[0.04] border border-white/10"}`}>
              {/* 태그 */}
              {p.tag && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold
                                 px-3 py-1 rounded-full
                  ${p.highlight ? "bg-gold text-ink" : "bg-white/10 text-white/70 border border-white/20"}`}>
                  {p.tag}
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs text-white/40 mb-1">{p.name}</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className={`font-serif text-3xl font-bold ${p.highlight ? "text-gold" : "text-white"}`}>
                    {fmt(annual ? p.price.year : p.price.month)}
                  </span>
                  {p.price.month > 0 && (
                    <span className="text-[11px] text-white/30 mb-0.5">/월</span>
                  )}
                </div>
                {annual && p.price.year > 0 && (
                  <p className="text-[10px] text-white/30">
                    연 {fmt(p.price.year * 12)} 청구 ({fmt(p.price.month - p.price.year)} 절약)
                  </p>
                )}
                <p className="text-xs text-white/40 mt-2">{p.desc}</p>
              </div>

              <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                {p.features.map((f) => (
                  <li key={f.text} className={`flex items-center gap-2.5 text-xs
                    ${f.ok ? "text-white/70" : "text-white/20"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px]
                      ${f.ok
                        ? p.highlight ? "bg-gold/20 border border-gold/40 text-gold" : "bg-white/10 border border-white/20 text-white/60"
                        : "bg-white/[0.04] text-white/20"}`}>
                      {f.ok ? "✓" : "—"}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              <Link href={p.href}
                className={`text-center text-sm font-bold rounded-full py-3 transition-all duration-150
                  hover:scale-[1.02] active:scale-95
                  ${p.highlight
                    ? "bg-gold text-ink"
                    : "bg-white/[0.08] text-white/70 hover:bg-white/15 hover:text-white border border-white/10"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6">
          신용카드 · 카카오페이 · 토스페이 결제 지원 · VAT 포함 · 언제든 해지 가능
        </p>
      </div>
    </section>
  );
}
