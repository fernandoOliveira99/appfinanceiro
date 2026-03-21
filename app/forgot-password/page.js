"use client";

import { useState } from "react";
import Link from "next/link";
import { theme } from "@config/design-system";
import { ArrowLeft, Mail, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao processar sua solicitação.");
      }

      setMessage("Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes.");
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
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Voltar ao Login
            </Link>
            
            <div className="space-y-2 text-center pt-2">
              <div className="h-16 w-16 bg-violet-600/10 rounded-3xl flex items-center justify-center text-violet-500 mx-auto mb-4 border border-violet-500/20 shadow-inner">
                <Mail size={32} />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Recuperar Senha</h1>
              <p className="text-sm text-slate-400 font-medium">
                Enviaremos um link de recuperação para o seu e-mail.
              </p>
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/40 rounded-xl px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {message && (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3 font-bold">
              {message}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail Cadastrado</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-violet-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all text-white placeholder:text-slate-600"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                disabled={loading}
              >
                {loading ? "Processando..." : (
                  <>
                    Enviar Link
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {message && (
            <div className="text-center pt-4">
              <Link 
                href="/login" 
                className="w-full inline-block py-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-white font-black transition-all active:scale-95"
              >
                Voltar para o Início
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
