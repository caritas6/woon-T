import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 운트 브랜드 컬러
        ink:   { DEFAULT: "#1A1A2E", 2: "#2D2D4E", 3: "#3D3D60" },
        gold:  { DEFAULT: "#C9A84C", lt: "#E8D5A3", dk: "#8B6914", hover: "#A8761E" },
        paper: { DEFAULT: "#FAF8F2", 2: "#F0EDE0" },
        muted: "#7A7060",
        // 오행 컬러
        wood:  "#3D7A4A",
        fire:  "#C94B3D",
        earth: "#8B6914",
        metal: "#7A8090",
        water: "#2E5F8A",
      },
      fontFamily: {
        serif: ["Noto Serif KR", "serif"],
        sans:  ["Noto Sans KR", "sans-serif"],
      },
      animation: {
        "pulse-gold": "pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":  "spin 8s linear infinite",
        "fade-up":    "fade-up 0.5s ease-out",
        "fade-in":    "fade-in 0.4s ease-out",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.5", transform: "scale(1.3)" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8D5A3 50%, #C9A84C 100%)",
        "ink-gradient":  "linear-gradient(135deg, #1A1A2E 0%, #2D2D4E 100%)",
        "grid-gold":
          "linear-gradient(rgba(201,168,76,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.06) 1px,transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
