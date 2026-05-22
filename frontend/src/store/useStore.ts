import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SajuResult, User, CareerReport, SurveyData } from "@/types";

interface WoontStore {
  // 인증
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;

  // 온보딩 입력값
  onboarding: {
    ownerId:    string | null;  // 데이터 소유자 (user.id 또는 null=비회원)
    birthDate:  string;
    birthHour:  number | null;
    gender:     "M" | "F" | null;
    situation:  string | null;
    name:       string;
  };
  setOnboarding: (data: Partial<WoontStore["onboarding"]>) => void;

  // 사전 설문
  survey: SurveyData | null;
  setSurvey: (d: SurveyData) => void;

  // 분석 결과
  sajuResult:   SajuResult | null;
  activeReport: CareerReport | null;
  setSajuResult:   (r: SajuResult) => void;
  setActiveReport: (r: CareerReport) => void;
  clearResults: () => void;
}

export const useStore = create<WoontStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, access, refresh) =>
        set((state) => ({
          user,
          accessToken:  access,
          refreshToken: refresh,
          // 익명 분석(ownerId: null) 데이터는 새 로그인 사용자에게 귀속
          // → 분석 후 바로 가입한 경우 데이터 유지
          onboarding: state.onboarding.ownerId === null && state.onboarding.birthDate
            ? { ...state.onboarding, ownerId: user.id }
            : state.onboarding,
        })),
      clearAuth: () => set({
        user: null, accessToken: null, refreshToken: null,
        // 로그아웃 시 개인 데이터 전체 초기화 — 다음 사용자에게 노출 방지
        onboarding: { ownerId: null, birthDate: "", birthHour: null, gender: null, situation: null, name: "" },
        survey:       null,
        sajuResult:   null,
        activeReport: null,
      }),

      onboarding: {
        ownerId:   null,
        birthDate: "",
        birthHour: null,
        gender:    null,
        situation: null,
        name:      "",
      },
      setOnboarding: (data) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...data } })),

      survey: null,
      setSurvey: (d) => set({ survey: d }),

      sajuResult:   null,
      activeReport: null,
      setSajuResult:   (r) => set({ sajuResult: r }),
      setActiveReport: (r) => set({ activeReport: r }),
      clearResults: () => set({ sajuResult: null, activeReport: null }),
    }),
    {
      name: "woont-store",
      partialize: (s) => ({
        user:         s.user,
        accessToken:  s.accessToken,
        refreshToken: s.refreshToken,
        onboarding:   s.onboarding,   // 생년월일·성별 등 재입력 방지
        survey:       s.survey,       // 설문 답변 유지
        sajuResult:   s.sajuResult,   // 결과 유지 (페이지 새로고침 대응)
      }),
    }
  )
);
