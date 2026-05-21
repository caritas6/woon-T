import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "결제 실패",
  robots: { index: false, follow: false },
};

export default function FailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
