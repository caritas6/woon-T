import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "운트(Woon-T) — 나의 타고난 기운으로 찾는 최적의 커리어 로드맵",
  description:
    "사주 명리학의 분석력과 현대 커리어 컨설팅을 결합한 AI 진로 상담 플랫폼. 오행 분석으로 나에게 맞는 직무와 타이밍을 찾아보세요.",
  keywords: ["사주", "진로상담", "커리어", "오행", "운트"],
  openGraph: {
    title: "운트(Woon-T) — 사주 기반 AI 진로 상담",
    description: "나의 타고난 기운으로 찾는 최적의 커리어 로드맵",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
