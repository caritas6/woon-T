import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "플랜 업그레이드",
  description:
    "Pro · Premium 플랜으로 업그레이드하고 전체 커리어 매칭 리포트, AI 팔로업 채팅, 월별 운세 캘린더, 전문가 1:1 상담을 이용해 보세요.",
  keywords: ["사주 구독", "커리어 리포트", "Pro 플랜", "Premium 플랜"],
  robots: {
    // 결제 페이지는 색인하되 스니펫 제한
    index: true,
    follow: true,
  },
  openGraph: {
    title: "운트 Pro · Premium 플랜 — 전체 커리어 리포트 잠금 해제",
    description: "월 ₩9,900부터 시작하는 사주 기반 AI 진로 분석 구독",
    type: "website",
  },
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
