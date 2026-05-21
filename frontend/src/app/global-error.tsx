"use client";

// global-error는 루트 layout을 대체하므로 html/body 태그를 직접 포함해야 합니다
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, background: "#1A1A2E", fontFamily: "sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(201,75,61,0.1)",
              border: "1px solid rgba(201,75,61,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 24,
              fontSize: 28,
            }}
          >
            ⚡
          </div>

          <h1
            style={{
              fontFamily: "serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#FFFFFF",
              margin: "0 0 12px",
            }}
          >
            치명적인 오류가 발생했습니다
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 8 }}>
            앱을 불러오는 중 문제가 발생했습니다.
          </p>
          {error.digest && (
            <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, fontFamily: "monospace", marginBottom: 24 }}>
              {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              background: "#C9A84C",
              color: "#1A1A2E",
              border: "none",
              borderRadius: 9999,
              padding: "14px 32px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            페이지 새로고침
          </button>
        </div>
      </body>
    </html>
  );
}
