import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "회원가입",
  description: "운트(Woon-T)에 가입하고 무료 사주 분석을 시작하세요.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
