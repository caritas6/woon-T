/**
 * Next.js 클라이언트 계측 (instrumentation-client.ts)
 * — React 하이드레이션 직전에 실행됩니다
 *
 * Sentry(@sentry/nextjs)는 Next.js 16 호환 버전 출시 후 설치 예정.
 * 현재는 스텁으로 유지합니다.
 */

// ── 라우터 네비게이션 추적 ──────────────────────────────────────────────
// TODO: Sentry 설치 후 브레드크럼 전송 로직 추가
export function onRouterTransitionStart(
  _url: string,
  _navigationType: "push" | "replace" | "traverse",
) {
  // no-op until @sentry/nextjs supports Next.js 16
}
