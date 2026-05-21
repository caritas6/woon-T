import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "월별 운세 캘린더",
  description:
    "사주 오행 기반의 월별 운세 캘린더. 대길(大吉)·소길·보통·주의일을 한눈에 확인하고 중요한 결정과 행동의 타이밍을 잡아보세요.",
  keywords: ["운세 캘린더", "사주 운세", "대길", "좋은날", "타이밍"],
  robots: {
    index: false, // 로그인 필요 페이지 — 색인 제외
    follow: false,
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
