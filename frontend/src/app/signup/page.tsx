"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useStore } from "@/store/useStore";

export default function SignupPage() {
  const router  = useRouter();
  const setAuth = useStore((s) => s.setAuth);

  const [email,    setEmail]    = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 8)  { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    setError(null);
    setLoading(true);
    try {
      const { data: tokens } = await authApi.register(email, password, nickname || undefined);
      localStorage.setItem("access_token",  tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      const { data: user } = await authApi.me();
      setAuth(user, tokens.access_token, tokens.refresh_token);
      router.push("/analyze");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })
        ?.response?.data?.detail ?? "회원가입 중 오류가 발생했습니다.";
      setError(typeof msg === "string" ? msg : "회원가입 중 오류가 발생했습니다.");
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
            <h1 className="font-serif text-2xl font-bold text-white mb-2">무료 회원가입</h1>
            <p className="text-xs text-white/35">가입 후 전체 AI 커리어 리포트를 무료로 확인하세요</p>
          </div>

          <form onSubmit={handleSubmit}
            className="bg-white/[0.04] border border-gold/20 rounded-3xl p-6 flex flex-col gap-4">

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">이메일 *</label>
              <input type="email" required autoComplete="email"
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                           text-sm text-white placeholder-white/20 focus:outline-none
                           focus:border-gold/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">
                닉네임 <span className="text-white/20">(선택)</span>
              </label>
              <input type="text" autoComplete="nickname"
                value={nickname} onChange={(e) => setNickname(e.target.value)}
                placeholder="홍길동"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                           text-sm text-white placeholder-white/20 focus:outline-none
                           focus:border-gold/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">비밀번호 * (8자 이상)</label>
              <input type="password" required autoComplete="new-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.05] border border-white/15 rounded-xl px-4 py-3
                           text-sm text-white placeholder-white/20 focus:outline-none
                           focus:border-gold/50 transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] text-white/35 mb-1.5 tracking-wider">비밀번호 확인 *</label>
              <input type="password" required autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-white/[0.05] border rounded-xl px-4 py-3
                            text-sm text-white placeholder-white/20 focus:outline-none transition-colors
                            ${confirm && confirm !== password ? "border-fire/50" : "border-white/15 focus:border-gold/50"}`} />
              {confirm && confirm !== password && (
                <p className="text-[10px] text-red-400 mt-1">비밀번호가 일치하지 않습니다</p>
              )}
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
              {loading ? "가입 중…" : "무료로 시작하기 →"}
            </button>

            <p className="text-center text-[10px] text-white/20 leading-relaxed">
              가입하면 <Link href="#" className="text-white/40 hover:text-white/60">이용약관</Link> 및{" "}
              <Link href="#" className="text-white/40 hover:text-white/60">개인정보처리방침</Link>에 동의합니다
            </p>

            <p className="text-center text-[11px] text-white/30">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-gold/70 hover:text-gold transition-colors">
                로그인
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
