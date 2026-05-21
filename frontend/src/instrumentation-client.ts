/**
 * Next.js 클라이언트 계측 (instrumentation-client.ts)
 * — React 하이드레이션 직전에 실행됩니다
 * — Sentry 브라우저 SDK 초기화 + 네비게이션 브레드크럼
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// ── Sentry 브라우저 SDK 초기화 ─────────────────────────────────────────
if (dsn) {
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV ?? "development",
        tracesSampleRate: 0.05,   // 브라우저는 5% 샘플링
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
        debug: false,
        beforeSend(event) {
          // localhost에서는 에러 전송 안 함
          if (
            typeof window !== "undefined" &&
            window.location.hostname === "localhost"
          ) {
            return null;
          }
          return event;
        },
      });
    })
    .catch(() => {
      // @sentry/nextjs 미설치 시 조용히 스킵
    });
}

// ── 라우터 네비게이션 추적 ──────────────────────────────────────────────
export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  if (!dsn) return;
  import("@sentry/nextjs")
    .then((Sentry) => {
      Sentry.addBreadcrumb({
        category: "navigation",
        message: `${navigationType} → ${url}`,
        level: "info",
      });
    })
    .catch(() => {});
}
