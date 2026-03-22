"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { theme } from "@config/design-system";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("form"); // 'form' | 'verify'
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  async function handleResendCode() {
    if (resendTimer > 0 || resendLoading) return;
    
    setResendLoading(true);
    setError("");
    setResendSuccess(false);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao reenviar código.");
        return;
      }

      setResendSuccess(true);
      setResendTimer(60); // 1 minuto de cooldown
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setResendLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Falha ao criar conta.");
        return;
      }

      // Se o registro exige verificação, muda para o passo de código
      if (data.requiresVerification) {
        setStep("verify");
      } else {
        window.location.href = `/login?registered=true&email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError("Erro de rede ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Código inválido ou expirado.");
        return;
      }

      // Verificação bem-sucedida, redireciona para login
      window.location.href = `/login?verified=true&email=${encodeURIComponent(email)}`;
    } catch {
      setError("Erro ao verificar código.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className={`${theme.cardStyles.base} max-w-md w-full overflow-hidden`}>
        {step === "form" ? (
          <form
            onSubmit={handleSubmit}
            className={`${theme.spacing.cardPadding} space-y-8`}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight italic">Criar Conta</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Comece a organizar suas finanças pessoais.
              </p>
            </div>

            {error && (
              <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Nome Completo</label>
                <input
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">E-mail</label>
                <input
                  type="email"
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Senha</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-medium pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-violet-500 transition-colors rounded-lg"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/20 active:scale-95 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </button>

              <p className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium pt-2">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-500 font-bold underline underline-offset-4 decoration-violet-500/30">
                  Fazer login agora
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleVerify}
            className={`${theme.spacing.cardPadding} space-y-8`}
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black text-white tracking-tight">Verificar E-mail</h1>
              <p className="text-sm text-slate-400 font-medium">
                Enviamos um código de 6 dígitos para <span className="text-white font-bold">{email}</span>.
              </p>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center block">Digite o código abaixo</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-6 text-3xl font-black text-center tracking-[12px] outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-slate-800"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/20 active:scale-95 disabled:opacity-50"
                disabled={loading || code.length !== 6}
              >
                {loading ? "Verificando..." : "Confirmar Código"}
              </button>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || resendLoading}
                  className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    resendTimer > 0 
                      ? "bg-slate-900/20 border-slate-800 text-slate-500 cursor-not-allowed" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-violet-500/50"
                  }`}
                >
                  {resendLoading 
                    ? "Reenviando..." 
                    : resendTimer > 0 
                      ? `Reenviar código em ${resendTimer}s` 
                      : "Não recebeu o código? Reenviar"}
                </button>

                {resendSuccess && (
                  <p className="text-[10px] text-emerald-400 font-bold text-center animate-in fade-in slide-in-from-top-1">
                    Novo código enviado para seu e-mail!
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full py-2 text-[9px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-[0.2em] transition-colors"
                >
                  Voltar para o cadastro
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

