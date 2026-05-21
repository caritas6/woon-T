import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SajuResult, User, CareerReport } from "@/types";

interface WoontStore {
  // 인증
  user:         User | null;
  accessToken:  string | null;
  refreshToken: string | null;
  setAuth: (user: User, access: string, refresh: string) => void;
  clearAuth: () => void;

  // 온보딩 입력값
  onboarding: {
    birthDate:  string;
    birthHour:  number | null;
    gender:     "M" | "F" | null;
    situation:  string | null;
    name:       string;
  };
  setOnboarding: (data: Partial<WoontStore["onboarding"]>) => void;

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
        set({ user, accessToken: access, refreshToken: refresh }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),

      onboarding: {
        birthDate: "",
        birthHour: null,
        gender:    null,
        situation: null,
        name:      "",
      },
      setOnboarding: (data) =>
        set((s) => ({ onboarding: { ...s.onboarding, ...data } })),

      sajuResult:   null,
      activeReport: null,
      setSajuResult:   (r) => set({ sajuResult: r }),
      setActiveReport: (r) => set({ activeReport: r }),
      clearResults: () => set({ sajuResult: null, activeReport: null }),
    }),
    { name: "woont-store", partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);
