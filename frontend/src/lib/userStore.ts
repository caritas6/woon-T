/**
 * 파일 기반 유저 스토어 — data/users.json
 * Node.js 런타임 전용 (Edge 불가)
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join }        from "node:path";
import { randomUUID }  from "node:crypto";
import { hashPassword } from "./auth";

export interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  nickname: string;
  subscription_tier: "free" | "pro" | "premium";
  is_verified: boolean;
  createdAt: string;
}

const DATA_DIR   = join(process.cwd(), "data");
const USERS_FILE = join(DATA_DIR, "users.json");

function readUsers(): StoredUser[] {
  try {
    if (!existsSync(USERS_FILE)) return [];
    return JSON.parse(readFileSync(USERS_FILE, "utf-8")) as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/** 회원가입 */
export async function registerUser(
  email: string,
  password: string,
  nickname?: string
): Promise<StoredUser> {
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("이미 사용 중인 이메일입니다.");
  }
  const user: StoredUser = {
    id:                randomUUID(),
    email,
    passwordHash:      await hashPassword(password),
    nickname:          nickname?.trim() || email.split("@")[0],
    subscription_tier: "free",
    is_verified:       false,
    createdAt:         new Date().toISOString(),
  };
  writeUsers([...users, user]);
  return user;
}

/** 로그인 검증 */
export async function loginUser(
  email: string,
  password: string
): Promise<StoredUser | null> {
  const users = readUsers();
  const user  = users.find((u) => u.email === email);
  if (!user) return null;
  const hash = await hashPassword(password);
  if (user.passwordHash !== hash) return null;
  return user;
}

/** ID로 유저 조회 */
export function getUserById(id: string): StoredUser | null {
  return readUsers().find((u) => u.id === id) ?? null;
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
