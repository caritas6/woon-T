// ── 사주 관련 ───────────────────────────────────────────────────────────

export type Element = "木" | "火" | "土" | "金" | "水";
export type Gender  = "M" | "F";
export type Situation = "취업준비생" | "직장인" | "N잡러" | "창업희망자";

export interface Pillar {
  stem: string;
  branch: string;
  stem_kr: string;
  branch_kr: string;
  stem_element: Element;
  branch_element: Element;
}

export interface ElementScore {
  "木": number; "火": number; "土": number; "金": number; "水": number;
}

export interface DaeunPeriod {
  start_age: number;
  stem: string;
  branch: string;
  element: Element;
  relationship: string;
}

export interface Persona {
  name: string;
  emoji: string;
  desc: string;
  traits: string[];
  ilgan: string;
  ilgan_element: Element;
  gyeokguk: string;
}

export interface CareerMatch {
  title: string;
  score: number;
  reason: string;
}

export interface SajuResult {
  profile_id: string;
  year:  Pillar;
  month: Pillar;
  day:   Pillar;
  hour:  Pillar | null;
  elements: ElementScore;
  ilgan: string;
  ilgan_element: Element;
  gyeokguk: string;
  yongsin: Element;
  persona: Persona;
  career_matches: CareerMatch[];
  daeun_list: DaeunPeriod[];
  ten_gods: Record<string, string>;
}

// ── AI 리포트 ────────────────────────────────────────────────────────────

export interface CareerReport {
  report_id: string;
  status: "pending" | "processing" | "done" | "failed";
  analysis?: {
    one_liner: string;
    identity_summary: string;
    strengths: string[];
    growth_areas: string[];
    career_analysis: {
      primary:   { field: string; score: number; why: string; specific_roles: string[] };
      secondary: { field: string; score: number; why: string; specific_roles: string[] };
      avoid:     { field: string; reason: string };
    };
    situation_advice: string;
    timing_insight: string;
    lucky_keywords: string[];
  };
  pdf_url?: string;
  created_at: string;
  completed_at?: string;
}

// ── 운세 캘린더 ──────────────────────────────────────────────────────────

export type DayType = "lucky" | "good" | "normal" | "caution";

export interface DayFortune {
  date: string;
  score: number;
  day_type: DayType;
  day_element: Element;
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  days: DayFortune[];
  lucky_days: number[];
  caution_days: number[];
  peak_date: number | null;
  peak_score: number;
  events: Array<{ type: string; title: string; dates: number[]; desc: string }>;
  monthly_avg: number;
}

// ── 인증 ────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  nickname: string | null;
  subscription_tier: "free" | "pro" | "premium";
  is_verified: boolean;
}

// ── 일운세 ──────────────────────────────────────────────────────────────

export interface DailyFortune {
  luck_score: number;
  message: string;
  tip: string;
  lucky_color: string;
  focus_area: string;
  recommended_jobs: CareerMatch[];
}
