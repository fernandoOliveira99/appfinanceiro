"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { theme } from "@config/design-system";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  User as UserIcon,
  Settings,
  Info,
  LogOut,
  ChevronDown,
  CreditCard,
  PieChart,
  Zap
} from "lucide-react";

const links = [
    { href: "/dashboard", label: "Painel", icon: LayoutDashboard, color: "text-violet-500" },
    { href: "/transactions", label: "Transações", icon: CreditCard, color: "text-emerald-500" },
    { href: "/reports", label: "Relatórios", icon: PieChart, color: "text-blue-500" },
    { href: "/about", label: "Sobre", icon: Info, color: "text-amber-500" }
  ];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleRestartTutorial = () => {
    if (pathname === "/dashboard") {
      // Se já estiver no dashboard, recarrega a página ou emite evento
      window.dispatchEvent(new CustomEvent('restart-tutorial'));
    } else {
      router.push("/dashboard?restartTutorial=true");
    }
    setDropdownOpen(false);
  };

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  useEffect(() => {
    if (isAuthPage) return;

    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    }
    
    // Se tiver sessão do NextAuth, usa os dados dela primeiro
    if (session?.user) {
      setUser({
        name: session.user.name,
        email: session.user.email,
        avatar_url: session.user.image
      });
    } else {
      load();
    }

    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        load();
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [session, isAuthPage]);

  async function handleLogout() {
    try {
      if (session) {
        await signOut({ redirect: false });
        window.location.href = "/login";
      } else {
        const res = await fetch("/api/auth/logout", { method: "POST" });
        if (res.ok) {
          window.location.href = "/login";
        }
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  if (isAuthPage) return null;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/50 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl h-screen sticky top-0">
      <div className="px-6 pt-8 pb-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
          <span className="font-black text-xl">F</span>
        </div>
        <h1 className="text-sm font-black text-slate-900 dark:text-white tracking-tight uppercase">
          Finanças App
        </h1>
      </div>

      <div className="px-4 mb-8" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 border border-slate-200/50 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all group ${dropdownOpen ? 'ring-2 ring-violet-500/20 border-violet-500/30' : ''}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Image
            src={
              user?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`
            }
            alt={user?.name || "Avatar"}
            width={40}
            height={40}
            unoptimized={true}
            className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/70 flex-shrink-0"
          />
            <div className="flex flex-col items-start min-w-0">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full text-left">
                {user?.name?.split(' ')[0] || "Usuário"}
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Minha Conta
              </span>
            </div>
          </div>
          <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 transition-transform duration-300" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </button>

        {dropdownOpen && (
          <div className="absolute left-4 right-4 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="p-2 space-y-1">
              <Link 
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <UserIcon size={16} className="text-emerald-500" />
                Perfil
              </Link>
              <Link 
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Settings size={16} className="text-amber-500" />
                Configurações
              </Link>
              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1" />
              <button
                onClick={handleRestartTutorial}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Zap size={16} className="text-violet-500" />
                Ver Tutorial
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 transition-all"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-1 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative ${
                active
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className={`${active ? "text-white" : link.color} transition-colors`}
              />
              <span className={`font-bold tracking-tight ${active ? "text-white" : ""}`}>
                {link.label}
              </span>
              {active && (
                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-8">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-900/20 border border-slate-200 dark:border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
          </div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Sistema Online</p>
        </div>
      </div>
    </aside>
  );
}
