"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { User, Lock, Save, Camera, ArrowLeft, Mail, Shield, LogOut, Trash2, Edit2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setName(data.name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setMessage({ type: "info", text: "Salvando..." });
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar_url: avatarUrl })
    });
    if (res.ok) {
      const updated = await res.json();
      setUser(updated);
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      
      // Dispatch custom event to notify other components (Sidebar, TopBar)
      window.dispatchEvent(new CustomEvent('profile-updated', { detail: updated }));
      
      // Update NextAuth session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: updated.name,
          image: updated.avatar_url,
        },
      });
      
      router.refresh();
    } else {
      setMessage({ type: "error", text: "Erro ao atualizar perfil." });
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." });
      return;
    }
    setMessage({ type: "info", text: "Atualizando senha..." });
    const res = await fetch("/api/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (res.ok) {
      setMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setMessage({ type: "error", text: data.error || "Erro ao alterar senha." });
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-all shadow-sm hover:shadow-md active:scale-95">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">Meu Perfil</h1>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border shadow-sm ${
          message.type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" : 
          message.type === "error" ? "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400" : 
          "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
        } text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <section className={`${theme.cardStyles.base} rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none`}>
            <form onSubmit={handleUpdateProfile} className="p-6 md:p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">Informações Pessoais</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gerencie seus dados de exibição</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border-4 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        width={128} 
                        height={128} 
                        className="h-full w-full object-cover" 
                        unoptimized={avatarUrl.startsWith('data:')}
                      />
                    ) : (
                      <User size={50} className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-violet-600 text-white shadow-xl cursor-pointer hover:bg-violet-500 transition-all hover:scale-110 active:scale-90 border-4 border-white dark:border-slate-900">
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Nome completo</label>
                    <input
                      className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all placeholder:text-slate-300"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">E-mail de acesso</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                      <input
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-400 dark:text-slate-600 outline-none cursor-not-allowed italic"
                        value={user?.email || ""}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-violet-600 hover:bg-violet-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-violet-500/20 active:scale-[0.98] group">
                <Save size={18} className="group-hover:scale-110 transition-transform" />
                Salvar Alterações
              </button>
            </form>
          </section>

          <section className={`${theme.cardStyles.base} rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none`}>
            <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white italic tracking-tight">Segurança</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Proteja sua conta</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Senha atual</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                      type="password"
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Nova senha</label>
                    <input
                      type="password"
                      className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Nova senha"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-1">Confirmar senha</label>
                    <input
                      type="password"
                      className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Repita a senha"
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-3 py-5 rounded-[1.5rem] bg-slate-900 dark:bg-slate-800 hover:bg-slate-950 dark:hover:bg-slate-700 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-[0.98]">
                Atualizar Senha
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className="rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl group-hover:bg-violet-600/10 transition-colors" />
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Membro desde</h3>
            <p className="text-3xl font-black text-violet-600 dark:text-violet-400 italic tracking-tight">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '---'}
            </p>
          </section>
          <div className="p-8 rounded-[2rem] bg-violet-600/5 dark:bg-violet-600/10 border border-violet-500/10 dark:border-violet-500/20 relative overflow-hidden">
            <Sparkles className="absolute -bottom-4 -right-4 text-violet-500/10 w-24 h-24 rotate-12" />
            <h3 className="text-[10px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-[0.2em] mb-3">Dica de Segurança</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
              Use uma senha forte com pelo menos 8 caracteres, incluindo números e símbolos para proteger seus dados financeiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
