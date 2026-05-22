/**
 * GET /api/v1/saju/profile/[profileId]
 * 저장된 사주 프로필 조회 (비로그인 공개 접근 가능)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PROFILES_DIR = process.env.VERCEL
  ? "/tmp/profiles"
  : join(process.cwd(), "data", "profiles");

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ profileId: string }> }
) {
  try {
    const { profileId } = await ctx.params;

    if (!profileId || profileId.length < 10) {
      return Response.json({ detail: "유효하지 않은 프로필 ID입니다." }, { status: 400 });
    }

    const path = join(PROFILES_DIR, `${profileId}.json`);

    if (!existsSync(path)) {
      return Response.json({ detail: "사주 프로필을 찾을 수 없습니다." }, { status: 404 });
    }

    const profile = JSON.parse(readFileSync(path, "utf-8"));
    return Response.json(profile);

  } catch (err) {
    console.error("[saju/profile]", err);
    return Response.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
