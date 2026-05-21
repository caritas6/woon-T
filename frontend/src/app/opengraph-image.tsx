import { ImageResponse } from "next/og";

export const alt = "운트(Woon-T) — 사주 기반 AI 진로 상담";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 빌드 타임에 정적으로 생성됩니다 (캐시됨)
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A2E",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 격자 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage:
              "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* 배경 원형 광원 */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,95,138,0.15) 0%, transparent 70%)",
          }}
        />

        {/* 로고 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#C9A84C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#1A1A2E",
            }}
          >
            運
          </div>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            운트(Woon-T)
          </span>
        </div>

        {/* 메인 제목 */}
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 20,
            maxWidth: 900,
          }}
        >
          나의 타고난 기운으로 찾는
        </div>
        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: "#C9A84C",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 40,
          }}
        >
          최적의 커리어 로드맵
        </div>

        {/* 설명 태그 */}
        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["사주 분석", "오행 커리어", "AI 진로 상담"].map((tag) => (
            <div
              key={tag}
              style={{
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.3)",
                borderRadius: 9999,
                padding: "10px 24px",
                fontSize: 20,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* 하단 URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "rgba(255,255,255,0.25)",
          }}
        >
          woon-t.com
        </div>
      </div>
    ),
    { ...size },
  );
}
