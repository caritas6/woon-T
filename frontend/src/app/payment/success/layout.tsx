import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "결제 완료",
  robots: { index: false, follow: false },
};

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
