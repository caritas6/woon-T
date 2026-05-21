import type { Metadata } from "next";

// result/[id] 레이아웃 — 서버 컴포넌트이므로 generateMetadata 사용 가능
// API를 호출해 제목을 동적으로 생성하려면 아래 generateMetadata를 사용하세요.
// 현재는 정적 기본값으로 제공합니다 (개인 결과 페이지는 색인 제외).

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  // 공개 캐싱하지 않도록 noindex — 개인 분석 결과
  return {
    title: `AI 진로 분석 리포트`,
    description: "사주 기반 AI 커리어 분석 결과를 확인하세요. 격국·용신·대운 심층 분석 및 추천 직군이 포함됩니다.",
    robots: { index: false, follow: false },
    openGraph: {
      title: "운트 AI 진로 분석 리포트",
      description: "나의 사주로 분석한 커리어 인사이트",
      type: "website",
    },
    // 캐노니컬 — 각 리포트 URL을 고유하게 처리
    alternates: {
      canonical: `https://woon-t.com/result/${id}`,
    },
  };
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
