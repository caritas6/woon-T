/**
 * Next.js 16 Proxy (구 middleware.ts — v16에서 이름 변경)
 *
 * ⚠️ 우리 앱은 JWT를 localStorage에 저장하므로 proxy에서 인증을 검증할 수 없습니다.
 *    인증 보호는 각 페이지 컴포넌트의 useEffect에서 처리합니다.
 *
 * Proxy가 담당하는 역할:
 * 1. www → non-www 리다이렉트 (프로덕션)
 * 2. 보안 헤더 추가 (CSP, HSTS 등)
 * 3. 봇 트래픽 기록용 요청 ID 헤더 주입
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, hostname, protocol } = request.nextUrl;

  // ── 1. www → non-www 리다이렉트 (프로덕션 전용) ───────────────────────
  if (hostname.startsWith("www.")) {
    const nonWww = hostname.slice(4);
    const url = request.nextUrl.clone();
    url.hostname = nonWww;
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── 2. HTTP → HTTPS 리다이렉트 (프로덕션 전용) ────────────────────────
  if (process.env.NODE_ENV === "production" && protocol === "http:") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

  // ── 3. 보안 헤더 + 요청 ID 주입 ─────────────────────────────────────
  const requestId = crypto.randomUUID();
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-request-id": requestId,
        "x-pathname": pathname,
      }),
    },
  });

  // 응답 보안 헤더 (next.config.ts의 headers()와 상호 보완)
  response.headers.set("x-request-id", requestId);
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // HSTS — HTTPS 전용 (프로덕션)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 Proxy 적용:
     * - _next/static  (정적 자산)
     * - _next/image   (이미지 최적화)
     * - favicon.ico, sitemap.xml, robots.txt (메타 파일)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt).*)",
  ],
};
