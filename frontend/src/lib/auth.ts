/**
 * JWT 유틸 — Web Crypto API (HMAC-SHA256)
 * Node.js 18+ / Next.js Route Handler 전용
 */

const JWT_SECRET = process.env.JWT_SECRET_KEY ?? "woon-t-dev-secret-key";

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toB64url(data: string | ArrayBuffer): string {
  const str =
    typeof data === "string"
      ? btoa(data)
      : btoa(String.fromCharCode(...new Uint8Array(data)));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromB64url(s: string): string {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

/** JWT 서명 생성 */
export async function createToken(
  payload: Record<string, unknown>,
  expiresInSec: number
): Promise<string> {
  const header = toB64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now    = Math.floor(Date.now() / 1000);
  const body   = toB64url(
    JSON.stringify({ ...payload, iat: now, exp: now + expiresInSec })
  );
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign(
    "HMAC", key, new TextEncoder().encode(`${header}.${body}`)
  );
  return `${header}.${body}.${toB64url(sig)}`;
}

/** JWT 검증 — 만료·서명 오류 시 null 반환 */
export async function verifyToken(
  token: string
): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const key    = await getHmacKey();
    const sigStr = fromB64url(sig);
    const sigBytes = Uint8Array.from(sigStr, (c) => c.charCodeAt(0));

    const valid = await crypto.subtle.verify(
      "HMAC", key, sigBytes, new TextEncoder().encode(`${header}.${body}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(fromB64url(body)) as Record<string, unknown>;
    if ((payload.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** 비밀번호 SHA-256 해시 */
export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + JWT_SECRET);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
