import axios from "axios";
import type {
  SajuResult, CareerReport, MonthlyCalendar,
  TokenResponse, User, DailyFortune,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL: BASE, timeout: 30_000 });

// ── 토큰 자동 주입 ───────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 401 → 자동 refresh ──────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post<TokenResponse>(`${BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("access_token",  data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string, nickname?: string) =>
    api.post<TokenResponse>("/auth/register", { email, password, nickname }),

  login: (email: string, password: string) =>
    api.post<TokenResponse>("/auth/login", { email, password }),

  me: () => api.get<User>("/auth/me"),
};

// ── Saju ────────────────────────────────────────────────────────────────

export const sajuApi = {
  quick: (birthDate: string, gender: "M" | "F", birthHour?: number | null, situation?: string) =>
    api.post<SajuResult>("/saju/quick", {
      birth_date: birthDate,
      gender,
      birth_hour: birthHour ?? null,
      situation,
    }),

  calculate: (birthDate: string, gender: "M" | "F", birthHour?: number | null, situation?: string) =>
    api.post<SajuResult>("/saju/calculate", {
      birth_date: birthDate,
      gender,
      birth_hour: birthHour ?? null,
      situation,
    }),

  profiles: () => api.get<SajuResult[]>("/saju/profiles"),
};

// ── Career ──────────────────────────────────────────────────────────────

export const careerApi = {
  analyze: (sajuProfileId: string, situation?: string) =>
    api.post<CareerReport>("/career/analyze", {
      saju_profile_id: sajuProfileId,
      situation,
    }),

  getReport: (reportId: string) =>
    api.get<CareerReport>(`/career/report/${reportId}`),

  history: () => api.get<CareerReport[]>("/career/history"),

  today: () => api.get<DailyFortune>("/career/today"),

  chat: (reportId: string, message: string) =>
    api.post<{ reply: string; report_id: string }>("/career/chat", {
      report_id: reportId,
      message,
    }),
};

// ── Fortune ─────────────────────────────────────────────────────────────

export const fortuneApi = {
  calendar: (year: number, month: number) =>
    api.get<MonthlyCalendar>(`/fortune/calendar/${year}/${month}`),

  yearly: (year: number) =>
    api.get(`/fortune/yearly/${year}`),

  daeun: () => api.get("/fortune/daeun"),
};

// ── Reports ─────────────────────────────────────────────────────────────

export const reportApi = {
  downloadPdf: (reportId: string) =>
    api.get(`/reports/${reportId}/pdf`, { responseType: "blob" }),
};
