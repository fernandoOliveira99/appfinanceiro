"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { theme } from "@config/design-system";
import { signIn } from "next-auth/react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const registered = searchParams.get("registered");
    const verified = searchParams.get("verified");
    const emailParam = searchParams.get("email");
    
    if (registered === "true") {
      setSuccess("Conta criada! Verifique seu e-mail para ativar.");
    }

    if (verified === "true") {
      setSuccess("E-mail verificado com sucesso! Faça login.");
    }
    
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setError("Erro ao entrar com Google.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Iniciando login para:", email);
      const res = await signIn("credentials", {
        email,
        password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      console.log("Resultado do login:", res);

      if (res?.error) {
        console.error("Erro no login:", res.error);
        if (res.error === "CredentialsSignin") {
          setError("E-mail ou senha incorretos.");
        } else {
          setError(res.error);
        }
        return;
      }

      if (res?.ok) {
        console.log("Login bem-sucedido, redirecionando...");
        // Redireciona usando window.location para forçar o recarregamento do Layout
        // e limpar qualquer estado de usuário anterior, mantendo o IP atual.
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Erro na requisição de login:", err);
      setError("Erro de rede ao tentar entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className={`${theme.cardStyles.base} max-w-md w-full overflow-hidden`}>
        <div className={`${theme.spacing.cardPadding} space-y-8`}>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Bem-vindo!</h1>
            <p className="text-sm text-slate-400 font-medium">
              Escolha como deseja acessar sua conta.
            </p>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3 font-bold">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Ou</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                  <Link href="/forgot-password" size="sm" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                    Esqueceu?
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20"
                />
                <label htmlFor="rememberMe" className="text-xs font-bold text-slate-400 cursor-pointer select-none">
                  Permanecer conectado
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Entrando..." : "Entrar na Conta"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm font-medium text-slate-400">
            Ainda não tem conta?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold underline-offset-4 hover:underline transition-all">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}


