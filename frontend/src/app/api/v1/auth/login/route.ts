import { NextRequest, NextResponse } from "next/server";
import { loginUser, toPublicUser } from "@/lib/userStore";
import { createToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      email?: string;
      password?: string;
    };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: "이메일과 비밀번호를 입력해 주세요." },
        { status: 422 }
      );
    }

    const user = await loginUser(email, password);
    if (!user) {
      return NextResponse.json(
        { detail: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      createToken({ sub: user.id, email: user.email, type: "access"  }, 60 * 60 * 24),
      createToken({ sub: user.id, email: user.email, type: "refresh" }, 60 * 60 * 24 * 30),
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
  } catch {
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
