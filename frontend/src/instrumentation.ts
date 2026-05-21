/**
 * Next.js 서버 계측 (instrumentation.ts)
 * — 서버 시작 시 1회 실행, Node.js 런타임 전용
 * — Sentry 서버 SDK 초기화 + 서버 에러 캡처
 */

import type { Instrumentation } from "next";

export async function register() {
  // Node.js 환경에서만 Sentry 서버 SDK 초기화
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return; // DSN 미설정 시 조용히 스킵

    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.init({
        dsn,
        environment: process.env.NODE_ENV ?? "development",
        tracesSampleRate: 0.1,
        debug: false,
      });
    } catch {
      // @sentry/nextjs 미설치 시 조용히 스킵
    }
  }
}

/**
 * 서버 에러를 Sentry로 전송
 * React 서버 컴포넌트, 라우트 핸들러, 서버 액션에서 발생하는 에러를 캡처합니다
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureRequestError(error, request, context);
  } catch {
    // 에러 리포팅 실패는 조용히 무시
  }
};
