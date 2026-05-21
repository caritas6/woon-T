import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "무료 사주 분석 시작",
  description:
    "생년월일과 태어난 시각을 입력하면 AI가 오행(木火土金水) 원소를 분석하고 나에게 맞는 직군과 커리어 타이밍을 알려드립니다. 무료로 바로 시작해 보세요.",
  keywords: ["사주 분석", "무료 사주", "오행 분석", "커리어 진단", "진로 테스트"],
  openGraph: {
    title: "무료 사주 분석으로 나의 커리어 원소 확인하기",
    description: "30초 입력으로 AI가 분석하는 오행 기반 진로 가이드를 받아보세요.",
    type: "website",
  },
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
