import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 로그인 필요 페이지 크롤 차단
        disallow: ["/dashboard", "/result/", "/payment/success", "/payment/fail"],
      },
    ],
    sitemap: "https://woon-t.com/sitemap.xml",
  };
}
