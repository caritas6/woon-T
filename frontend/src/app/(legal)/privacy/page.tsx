import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "운트(Woon-T) 개인정보 수집·이용·보호 정책",
};

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: `운트(Woon-T)는 서비스 제공을 위해 다음 정보를 수집합니다:\n\n[필수 항목]\n· 이메일 주소\n· 비밀번호 (암호화하여 저장)\n· 생년월일 및 태어난 시각\n· 성별\n\n[선택 항목]\n· 닉네임\n· 현재 상황 (취업준비생, 직장인 등)\n\n[자동 수집 항목]\n· 접속 IP, 서비스 이용 기록, 쿠키`,
  },
  {
    title: "2. 개인정보 수집·이용 목적",
    content: `· 회원 가입 및 본인 확인\n· AI 사주 분석 및 진로 상담 서비스 제공\n· 결제 처리 및 구독 관리\n· 이메일 알림 (분석 완료, 예약 확인 등)\n· 서비스 개선을 위한 통계 분석 (익명화 처리)`,
  },
  {
    title: "3. 개인정보 보유 및 이용 기간",
    content: `원칙적으로 회원 탈퇴 즉시 파기합니다. 단, 관계 법령에 따라 아래 기간 동안 보관합니다:\n\n· 계약·청약철회 기록: 5년 (전자상거래법)\n· 결제 기록: 5년 (전자상거래법)\n· 접속 로그: 3개월 (통신비밀보호법)`,
  },
  {
    title: "4. 개인정보 제3자 제공",
    content: `운트(Woon-T)는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외입니다:\n\n· 이용자가 사전에 동의한 경우\n· 법령에 의해 요구되는 경우\n\n[업무 위탁]\n· 결제 처리: 토스페이먼츠 주식회사\n· 이메일 발송: SMTP 서비스 제공업체`,
  },
  {
    title: "5. 개인정보 보호 조치",
    content: `· 비밀번호는 bcrypt로 암호화하여 저장\n· HTTPS/TLS를 통한 데이터 암호화 전송\n· JWT 토큰을 통한 안전한 인증\n· 개인정보 접근 권한 최소화\n· 정기적인 보안 취약점 점검`,
  },
  {
    title: "6. 이용자의 권리",
    content: `이용자는 언제든지 다음 권리를 행사할 수 있습니다:\n\n· 개인정보 조회·수정\n· 개인정보 삭제 (회원 탈퇴)\n· 개인정보 처리 정지 요청\n· 개인정보 이동 요청\n\n위 권리는 help@woon-t.com 으로 요청하시거나 서비스 내 설정에서 직접 처리하실 수 있습니다.`,
  },
  {
    title: "7. 쿠키(Cookie) 사용",
    content: `서비스는 필수 기능을 위해 최소한의 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.`,
  },
  {
    title: "8. 개인정보 보호책임자",
    content: `성명: 운트(Woon-T) 개인정보 보호팀\n이메일: privacy@woon-t.com\n\n개인정보 관련 불만·문의는 위 연락처로 접수해 주세요. 신속하게 처리하겠습니다.`,
  },
];

export default function PrivacyPage() {
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
        <h1 className="font-serif text-2xl font-bold text-white mb-2">개인정보처리방침</h1>
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
          <p className="text-xs text-white/25 mb-4">문의: <a href="mailto:privacy@woon-t.com" className="text-gold/50 hover:text-gold transition-colors">privacy@woon-t.com</a></p>
          <Link href="/terms" className="text-xs text-white/30 hover:text-gold/60 transition-colors">이용약관 보기 →</Link>
        </div>
      </main>
    </div>
  );
}
