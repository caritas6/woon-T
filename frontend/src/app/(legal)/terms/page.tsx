import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관",
  description: "운트(Woon-T) 서비스 이용약관",
};

const SECTIONS = [
  {
    title: "제1조 (목적)",
    content: `이 약관은 운트(Woon-T, 이하 '서비스')가 제공하는 사주 기반 AI 진로 상담 플랫폼 서비스의 이용 조건 및 절차, 서비스 이용자와 서비스 제공자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
  },
  {
    title: "제2조 (정의)",
    content: `① '서비스'란 운트(Woon-T)가 제공하는 사주 분석, AI 진로 상담, 운세 캘린더, 전문가 상담 예약 등 모든 온라인 서비스를 의미합니다.\n② '회원'이란 본 약관에 동의하고 서비스에 가입한 자를 의미합니다.\n③ '유료 서비스'란 Pro, Premium 구독 플랜 등 별도의 요금이 부과되는 서비스를 의미합니다.`,
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    content: `① 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력을 발생합니다.\n② 서비스는 합리적인 사유가 있을 경우 약관을 변경할 수 있으며, 변경된 약관은 7일 전에 공지합니다.`,
  },
  {
    title: "제4조 (회원 가입)",
    content: `① 이용자는 서비스에서 정한 가입 양식에 따라 회원 정보를 기입하고 약관에 동의함으로써 회원 가입을 신청합니다.\n② 만 14세 미만의 아동은 법정대리인의 동의 없이 회원 가입할 수 없습니다.`,
  },
  {
    title: "제5조 (유료 서비스 및 환불)",
    content: `① 유료 서비스 결제는 토스페이먼츠를 통해 처리됩니다.\n② 구독 서비스는 결제일로부터 구독 기간 동안 제공됩니다.\n③ 환불은 결제 후 7일 이내에 서비스를 이용하지 않은 경우에 한해 전액 환불이 가능합니다. 이미 이용한 서비스는 이용 기간에 비례하여 환불금액이 산정됩니다.`,
  },
  {
    title: "제6조 (AI 서비스의 한계)",
    content: `① AI 기반 사주 분석 및 진로 상담 결과는 참고용이며, 법률·의료·투자 등 전문적인 판단을 대체하지 않습니다.\n② 서비스는 분석 결과의 정확성을 보증하지 않으며, 이로 인한 손해에 대해 책임지지 않습니다.`,
  },
  {
    title: "제7조 (서비스 이용 제한)",
    content: `다음 행위를 하는 회원의 서비스 이용을 제한할 수 있습니다:\n① 타인의 정보를 도용하거나 허위 정보를 등록하는 행위\n② 서비스의 안정적 운영을 방해하는 행위\n③ 서비스를 통해 취득한 정보를 무단으로 복제·배포하는 행위`,
  },
  {
    title: "제8조 (면책 조항)",
    content: `① 서비스는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.\n② 서비스는 회원의 귀책 사유로 인한 서비스 이용 장애에 대해 책임지지 않습니다.`,
  },
  {
    title: "제9조 (분쟁 해결)",
    content: `이 약관과 관련하여 발생한 분쟁에 대해서는 대한민국 법률을 적용하며, 분쟁 발생 시 서울중앙지방법원을 전속 관할로 합니다.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-gold/15 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center font-serif text-xs font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
          <Link href="/signup" className="text-xs text-white/40 hover:text-gold transition-colors">← 회원가입으로</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl font-bold text-white mb-2">이용약관</h1>
        <p className="text-xs text-white/30 mb-10">시행일: 2026년 1월 1일 · 최종 개정: 2026년 5월 22일</p>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-base font-bold text-gold mb-3">{s.title}</h2>
              <p className="text-sm text-white/55 leading-relaxed whitespace-pre-line">{s.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-xs text-white/25 mb-4">문의: <a href="mailto:help@woon-t.com" className="text-gold/50 hover:text-gold transition-colors">help@woon-t.com</a></p>
          <Link href="/privacy" className="text-xs text-white/30 hover:text-gold/60 transition-colors">개인정보처리방침 보기 →</Link>
        </div>
      </main>
    </div>
  );
}
