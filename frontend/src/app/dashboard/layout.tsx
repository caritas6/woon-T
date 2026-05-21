import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
  description: "나의 사주 분석 리포트, 운세 캘린더, 상담 내역을 확인하세요.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
