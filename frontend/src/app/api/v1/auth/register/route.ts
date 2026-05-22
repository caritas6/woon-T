import { NextRequest, NextResponse } from "next/server";
import { registerUser, toPublicUser } from "@/lib/userStore";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email?: string;
      password?: string;
      nickname?: string;
    };
    const { email, password, nickname } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "이메일과 비밀번호는 필수입니다." },
        { status: 422 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { detail: "비밀번호는 8자 이상이어야 합니다." },
        { status: 422 }
      );
    }

    const user = await registerUser(email, password, nickname);

    const [accessToken, refreshToken] = await Promise.all([
      createToken({ sub: user.id, email: user.email, type: "access"  }, 60 * 60 * 24),      // 24h
      createToken({ sub: user.id, email: user.email, type: "refresh" }, 60 * 60 * 24 * 30), // 30d
    ]);

    return new NextResponse(
      JSON.stringify({
        access_token:  accessToken,
        refresh_token: refreshToken,
        token_type:    "bearer",
        expires_in:    86400,
        user:          toPublicUser(user),
      }),
      { status: 200, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
    const status  = message.includes("이미 사용") ? 409 : 500;
    return NextResponse.json({ detail: message }, { status });
  }
}
