import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getUserById, toPublicUser } from "@/lib/userStore";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json({ detail: "인증 토큰이 없습니다." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== "access") {
      return NextResponse.json({ detail: "유효하지 않거나 만료된 토큰입니다." }, { status: 401 });
    }

    const user = await getUserById(payload.sub as string);
    if (!user) {
      return NextResponse.json({ detail: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(toPublicUser(user));
  } catch {
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
