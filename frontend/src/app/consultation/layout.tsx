import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "전문가 1:1 상담 예약",
  description:
    "사주 전문가와 1:1 화상 상담으로 AI 분석 결과를 더 깊이 이해하고, 커리어 전환·이직·창업 시점에 대한 맞춤 조언을 받아보세요.",
  keywords: ["사주 상담", "1:1 상담", "전문가 상담", "커리어 코칭", "화상 상담"],
  openGraph: {
    title: "운트 전문가 1:1 상담 — 사주로 풀어보는 나의 커리어",
    description: "인증된 사주 전문가가 30분·60분 화상 상담으로 커리어 로드맵을 설계해 드립니다.",
    type: "website",
  },
};

export default function ConsultationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
