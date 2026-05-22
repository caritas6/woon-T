import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createToken } from "@/lib/auth";
import { getUserById } from "@/lib/userStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { refresh_token?: string };
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json({ detail: "refresh_token이 없습니다." }, { status: 422 });
    }

    const payload = await verifyToken(refresh_token);
    if (!payload || payload.type !== "refresh") {
      return NextResponse.json({ detail: "유효하지 않거나 만료된 refresh token입니다." }, { status: 401 });
    }

    const user = getUserById(payload.sub as string);
    if (!user) {
      return NextResponse.json({ detail: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const [accessToken, refreshToken] = await Promise.all([
      createToken({ sub: user.id, email: user.email, type: "access"  }, 60 * 60 * 24),
      createToken({ sub: user.id, email: user.email, type: "refresh" }, 60 * 60 * 24 * 30),
    ]);

    return NextResponse.json({
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    "bearer",
      expires_in:    86400,
    });
  } catch {
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
