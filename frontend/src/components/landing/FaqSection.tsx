"use client";
import { useState } from "react";

const FAQS = [
  {
    q: "사주 명리학과 AI 분석을 어떻게 결합하나요?",
    a: "전통 만세력 알고리즘으로 사주팔자(생년·월·일·시의 8글자)를 계산하고, 오행(木火土金水) 강약 점수를 도출합니다. 이 수치와 격국·용신 분석 결과를 Claude AI에 전달하면, AI가 현대 직무·산업 언어로 커리어 로드맵을 작성합니다. 점술이 아닌 데이터 기반 분석입니다.",
  },
  {
    q: "생시(태어난 시간)를 모르면 분석이 가능한가요?",
    a: "네, 가능합니다. 생시를 입력하지 않으면 시주(時柱) 없이 사주삼주(三柱) 기반으로 분석합니다. 단, 생시가 포함될 때보다 정확도가 다소 낮아질 수 있습니다. 산부인과 출생기록이나 가족에게 확인하신 후 입력하시는 것을 권장합니다.",
  },
  {
    q: "분석 결과를 어느 정도 신뢰할 수 있나요?",
    a: "운트의 분석은 확률적 성향 지표입니다. 사주는 타고난 기질과 에너지 패턴을 보여주며, 이를 바탕으로 적합도가 높은 환경과 직무를 제안합니다. 사용자 만족도 조사에서 94%가 '나의 강점을 잘 설명한다'고 응답했습니다. 절대적인 미래 예언이 아닌, 의사결정의 참고 자료로 활용하세요.",
  },
  {
    q: "개인 정보와 사주 데이터는 안전하게 보관되나요?",
    a: "모든 사주 데이터는 AES-256 암호화를 적용해 저장됩니다. 제3자에게 데이터를 판매하거나 제공하지 않으며, 분석 이후 데이터 삭제를 요청하실 수 있습니다. 자세한 내용은 개인정보처리방침을 참조하세요.",
  },
  {
    q: "Pro 플랜으로 업그레이드하면 이전 분석 결과도 볼 수 있나요?",
    a: "네, 이전에 무료로 분석한 사주 결과는 모두 유지됩니다. Pro 플랜으로 업그레이드하면 기존 분석에 대한 전체 커리어 매칭 리포트, 운세 캘린더, AI 채팅 기능이 즉시 활성화됩니다.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-ink-2 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="gold-tag mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse-gold" />
            자주 묻는 질문
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            궁금한 점이 <span className="text-gold">있으신가요?</span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-200
                ${open === i ? "border-gold/40 bg-white/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer">
                <span className={`text-sm font-medium leading-snug
                  ${open === i ? "text-gold" : "text-white/70"}`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                                   text-xs transition-all duration-200
                  ${open === i
                    ? "bg-gold text-ink rotate-45"
                    : "bg-white/[0.08] text-white/40"}`}>
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 animate-fade-in">
                  <div className="w-full h-px bg-white/[0.06] mb-4" />
                  <p className="text-sm text-white/50 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-white/25 mt-10">
          더 궁금한 점은{" "}
          <a href="mailto:hello@woon-t.com"
            className="text-gold/60 hover:text-gold transition-colors">
            hello@woon-t.com
          </a>
          으로 문의 주세요
        </p>
      </div>
    </section>
  );
}
