/**
 * Next.js 서버 계측 (instrumentation.ts)
 * — 서버 시작 시 1회 실행, Node.js 런타임 전용
 *
 * Sentry(@sentry/nextjs)는 Next.js 16 호환 버전 출시 후 설치 예정.
 * 현재는 스텁으로 유지하며, DSN이 설정된 경우 콘솔에만 기록합니다.
 */

import type { Instrumentation } from "next";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (dsn) {
      console.info("[Instrumentation] Sentry DSN detected but @sentry/nextjs is not installed (Next.js 16 support pending).");
    }
  }
}

/**
 * 서버 에러 훅 — Sentry 설치 후 여기서 captureRequestError를 호출합니다.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  _request,
  _context,
) => {
  // TODO: Sentry 설치 후 아래 주석 해제
  // const Sentry = await import("@sentry/nextjs");
  // Sentry.captureRequestError(error, _request, _context);

  if (process.env.NODE_ENV === "production") {
    console.error("[onRequestError]", (error as Error)?.message ?? error);
  }
};
