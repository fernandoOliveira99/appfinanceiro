"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { User, Lock, Save, Camera, ArrowLeft, Mail, Shield, LogOut, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black text-white tracking-tight">Meu Perfil</h1>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl border ${
          message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : 
          message.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : 
          "bg-blue-500/10 border-blue-500/20 text-blue-400"
        } text-sm font-bold animate-in fade-in slide-in-from-top-2`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-8">
          <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
            <form onSubmit={handleUpdateProfile} className={`${theme.spacing.cardPadding} space-y-6`}>
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <User className="text-violet-500" size={20} />
                <h2 className="text-lg font-bold text-white">Informações Pessoais</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-3xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                    {avatarUrl ? (
                      <Image 
                        src={avatarUrl} 
                        alt="Avatar" 
                        width={96} 
                        height={96} 
                        className="h-full w-full object-cover" 
                        unoptimized={avatarUrl.startsWith('data:')}
                      />
                    ) : (
                      <User size={40} className="text-slate-700" />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-violet-600 text-white shadow-lg cursor-pointer hover:bg-violet-500 transition-all">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </label>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nome completo</label>
                    <input
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">E-mail</label>
                    <input
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                      value={user?.email || ""}
                      disabled
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-900/20 active:scale-[0.98]">
                <Save size={18} />
                Salvar Alterações
              </button>
            </form>
          </section>

          <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
            <form onSubmit={handleChangePassword} className={`${theme.spacing.cardPadding} space-y-6`}>
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Lock className="text-rose-500" size={20} />
                <h2 className="text-lg font-bold text-white">Segurança</h2>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Senha atual</label>
                  <input
                    type="password"
                    className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Nova senha</label>
                    <input
                      type="password"
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Confirmar senha</label>
                    <input
                      type="password"
                      className="bg-slate-900/50 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-slate-700/50 active:scale-[0.98]">
                Atualizar Senha
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <section className={`${theme.cardStyles.base} rounded-3xl p-6 border border-slate-800/50 bg-gradient-to-br from-slate-900 to-slate-950`}>
            <h3 className="text-sm font-bold text-white mb-4">Membro desde</h3>
            <p className="text-2xl font-black text-violet-400">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '---'}
            </p>
          </section>
          <div className="p-6 rounded-3xl bg-violet-600/10 border border-violet-500/20">
            <h3 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">Dica de Segurança</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use uma senha forte com pelo menos 8 caracteres, incluindo números e símbolos para proteger seus dados financeiros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
