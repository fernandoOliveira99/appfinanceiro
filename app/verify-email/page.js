"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { theme } from "@config/design-system";
import { Mail, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setError("Token de verificação não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Ocorreu um erro ao verificar seu e-mail.");
        }

        setMessage("Seu e-mail foi verificado com sucesso! Agora você pode fazer login.");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <div className={`${theme.cardStyles.base} max-w-md w-full overflow-hidden`}>
        <div className={`${theme.spacing.cardPadding} space-y-8`}>
          <div className="space-y-2 text-center">
            <div className={`h-16 w-16 ${error ? 'bg-rose-600/10 text-rose-500 border-rose-500/20' : 'bg-violet-600/10 text-violet-500 border-violet-500/20'} rounded-3xl flex items-center justify-center mx-auto mb-4 border shadow-inner transition-colors duration-500`}>
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              ) : error ? (
                <XCircle size={32} />
              ) : (
                <CheckCircle2 size={32} />
              )}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {loading ? "Verificando..." : error ? "Falha na Verificação" : "E-mail Verificado!"}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {loading ? "Estamos validando seu link de verificação." : error ? "Não conseguimos verificar sua conta." : "Sua conta agora está ativa e pronta para uso."}
            </p>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {message && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3 font-bold flex items-center gap-3">
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          {!loading && (
            <div className="pt-4">
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all active:scale-95 shadow-xl shadow-violet-900/20"
              >
                Ir para Login
                <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}
