/**
 * GET /api/v1/career/report/[reportId]
 * 커리어 분석 리포트 조회
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const REPORTS_DIR = process.env.VERCEL
  ? "/tmp/reports"
  : join(process.cwd(), "data", "reports");

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await ctx.params;
    const path = join(REPORTS_DIR, `${reportId}.json`);

    if (!existsSync(path)) {
      return Response.json({ detail: "리포트를 찾을 수 없습니다." }, { status: 404 });
    }

    const report = JSON.parse(readFileSync(path, "utf-8"));
    return Response.json(report);

  } catch (err) {
    console.error("[career/report]", err);
    return Response.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
