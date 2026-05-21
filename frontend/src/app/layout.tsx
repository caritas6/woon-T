import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

const SITE_URL = "https://woon-t.com";
const SITE_NAME = "운트(Woon-T)";
const DEFAULT_DESCRIPTION =
  "사주 명리학의 분석력과 현대 커리어 컨설팅을 결합한 AI 진로 상담 플랫폼. 오행 분석으로 나에게 맞는 직무와 타이밍을 찾아보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} — 나의 타고난 기운으로 찾는 최적의 커리어 로드맵`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "사주", "진로상담", "커리어", "오행", "운트",
    "사주팔자", "명리학", "AI진로", "직업추천", "취업",
    "이직", "격국", "용신", "대운",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  openGraph: {
    title: `${SITE_NAME} — 사주 기반 AI 진로 상담`,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — 사주 기반 AI 진로 상담`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 사주 기반 AI 진로 상담`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,
  },

  verification: {
    // Google Search Console 등록 시 아래 값을 교체하세요
    // google: "google-site-verification-token",
  },
};

// ── JSON-LD 구조화 데이터 ─────────────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "ko-KR",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "KRW",
    lowPrice: "0",
    highPrice: "29900",
    offerCount: "3",
  },
  provider: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "help@woon-t.com",
      availableLanguage: "Korean",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
