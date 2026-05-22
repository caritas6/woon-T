/**
 * Supabase 기반 유저 스토어 (영구 PostgreSQL)
 * 이전: 파일 기반 /tmp/data/users.json (Vercel cold-start 시 초기화됨)
 * 이후: Supabase PostgreSQL — 배포/재시작과 무관하게 영구 보존
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID }   from "node:crypto";
import { hashPassword } from "./auth";

export interface StoredUser {
  id:                string;
  email:             string;
  passwordHash:      string;
  nickname:          string;
  subscription_tier: "free" | "pro" | "premium";
  is_verified:       boolean;
  createdAt:         string;
}

// Supabase DB row (snake_case)
interface UserRow {
  id:                string;
  email:             string;
  password_hash:     string;
  nickname:          string;
  subscription_tier: "free" | "pro" | "premium";
  is_verified:       boolean;
  created_at:        string;
}

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase 환경변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function rowToUser(row: UserRow): StoredUser {
  return {
    id:                row.id,
    email:             row.email,
    passwordHash:      row.password_hash,
    nickname:          row.nickname,
    subscription_tier: row.subscription_tier,
    is_verified:       row.is_verified,
    createdAt:         row.created_at,
  };
}

/** 회원가입 */
export async function registerUser(
  email: string,
  password: string,
  nickname?: string,
): Promise<StoredUser> {
  const sb = getClient();

  // 이메일 중복 확인
  const { data: existing } = await sb
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) throw new Error("이미 사용 중인 이메일입니다.");

  const { data, error } = await sb
    .from("users")
    .insert({
      id:                randomUUID(),
      email,
      password_hash:     await hashPassword(password),
      nickname:          nickname?.trim() || email.split("@")[0],
      subscription_tier: "free",
      is_verified:       false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToUser(data as UserRow);
}

/** 로그인 검증 */
export async function loginUser(
  email: string,
  password: string,
): Promise<StoredUser | null> {
  const sb = getClient();

  const { data } = await sb
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (!data) return null;

  const hash = await hashPassword(password);
  if ((data as UserRow).password_hash !== hash) return null;

  return rowToUser(data as UserRow);
}

/** ID로 유저 조회 */
export async function getUserById(id: string): Promise<StoredUser | null> {
  const sb = getClient();

  const { data } = await sb
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;
  return rowToUser(data as UserRow);
}

/** 응답용 공개 유저 객체 */
export function toPublicUser(u: StoredUser) {
  return {
    id:                u.id,
    email:             u.email,
    nickname:          u.nickname,
    subscription_tier: u.subscription_tier,
    is_verified:       u.is_verified,
  };
}
