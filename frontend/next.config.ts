import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 도메인 허용 (프로필 사진 등)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.woon-t.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  // 보안 헤더
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // API는 Next.js Route Handler(/src/app/api/)가 직접 처리하므로 rewrites 불필요
};

export default nextConfig;
