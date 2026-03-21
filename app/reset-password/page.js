"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { theme } from "@config/design-system";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de recuperação não encontrado.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao redefinir sua senha.");
      }

      setMessage("Sua senha foi redefinida com sucesso!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className={`${theme.cardStyles.base} max-w-md w-full overflow-hidden`}>
        <div className={`${theme.spacing.cardPadding} space-y-8`}>
          <div className="space-y-2 text-center">
            <div className="h-16 w-16 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto mb-4 border border-violet-500/20 shadow-inner">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Nova Senha</h1>
            <p className="text-sm text-slate-400 font-medium">
              Escolha uma senha forte para sua conta.
            </p>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {message && (
            <div className="space-y-6">
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3 font-bold flex items-center gap-3">
                <CheckCircle2 size={16} />
                {message}
              </div>
              <p className="text-xs text-center text-slate-500">
                Redirecionando para o login em instantes...
              </p>
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-600 text-white font-black transition-all active:scale-95"
              >
                Ir para Login agora
                <ArrowRight size={18} />
              </Link>
            </div>
          )}

          {!message && !error && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nova Senha</label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-4 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-slate-600"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-slate-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Confirmar Senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-4 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-slate-600"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/20 active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processando..." : "Redefinir Senha"}
              </button>
            </form>
          )}

          {error && !token && (
            <div className="text-center pt-4">
              <Link 
                href="/login" 
                className="text-xs font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 underline underline-offset-4"
              >
                Voltar ao Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
