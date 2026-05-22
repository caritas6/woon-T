/**
 * TossPayments JS SDK — CDN 로더
 *
 * TossPayments v2 SDK는 npm 패키지 대신 CDN으로 제공됩니다:
 * https://js.tosspayments.com/v2/standard
 *
 * 이 모듈은 CDN 스크립트를 동적으로 삽입하고 SDK를 로드합니다.
 */

const TOSS_SDK_URL = "https://js.tosspayments.com/v2/standard";

/** TossPayments 결제 요청 파라미터 (카드 결제) */
export interface TossPaymentParams {
  amount: number;
  orderId: string;
  orderName: string;
  successUrl: string;
  failUrl: string;
  customerEmail?: string;
  customerName?: string;
}

export interface TossPaymentsInstance {
  requestPayment(method: string, params: TossPaymentParams): Promise<void>;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
  }
}

/** CDN 스크립트 삽입 (중복 방지) */
function ensureScript(): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("browser only"));
  }
  if (window.TossPayments) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("toss-sdk");
    if (existing) {
      // 이미 삽입됐지만 로딩 중인 경우
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("TossPayments SDK load failed")));
      return;
    }
    const script = document.createElement("script");
    script.id   = "toss-sdk";
    script.src  = TOSS_SDK_URL;
    script.async = true;
    script.onload  = () => resolve();
    script.onerror = () => reject(new Error("TossPayments SDK load failed"));
    document.head.appendChild(script);
  });
}

/** TossPayments 인스턴스를 반환하는 로더 */
export async function loadTossPayments(clientKey: string): Promise<TossPaymentsInstance> {
  await ensureScript();
  if (!window.TossPayments) {
    throw new Error("TossPayments SDK is not available");
  }
  return window.TossPayments(clientKey);
}
