"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useStore } from "@/store/useStore";

export default function LoginPage() {
  const router  = useRouter();
  const setAuth = useStore((s) => s.setAuth);

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data: tokens } = await authApi.login(email, password);
      localStorage.setItem("access_token",  tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const { data: user } = await authApi.me();
      setAuth(user, tokens.access_token, tokens.refresh_token);
      router.push("/dashboard");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink flex flex-col">
      <header className="border-b border-gold/15 py-4 px-6">
        <div className="max-w-sm mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center
                            font-serif text-xs font-bold text-ink">運</div>
            <span className="font-serif text-sm text-white font-bold">운트(Woon-T)</span>
          </Link>
        </div>
      </header>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(201,168,76,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-bold text-white mb-2">로그인</h1>
            <p className="text-xs text-white/35">운트 계정으로 커리어 리포트를 확인하세요</p>
          </div>

          <form onSubmit={handleSubmit}
            className="bg-white/[0.04] border border-gold/20 rounded-3xl p-6 flex flex-col gap-4">

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">이메일</label>
              <input type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                           text-sm text-white placeholder-white/20 focus:outline-none
                           focus:border-gold/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">비밀번호</label>
              <input type="password" required autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                           text-sm text-white placeholder-white/20 focus:outline-none
                           focus:border-gold/50 transition-colors" />
            </div>

            {error && (
              <div className="bg-fire/10 border border-fire/30 rounded-xl px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-full text-sm font-bold mt-1 transition-all
                ${!loading
                  ? "bg-gold text-ink hover:scale-[1.02] active:scale-95 cursor-pointer"
                  : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
              {loading ? "로그인 중…" : "로그인"}
            </button>

            <p className="text-center text-[11px] text-white/30">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-gold/70 hover:text-gold transition-colors">
                무료 회원가입
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
