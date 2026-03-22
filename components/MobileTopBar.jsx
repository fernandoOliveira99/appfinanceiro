"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { theme } from "@config/design-system";
import { useSession, signOut } from "next-auth/react";
import { User as UserIcon, LogOut, ChevronDown, LayoutDashboard, Settings, Info, Menu as MenuIcon, CreditCard, PieChart } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: CreditCard },
  { href: "/reports", label: "Relatórios", icon: PieChart },
  { href: "/about", label: "Sobre", icon: Info }
];

export default function MobileTopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password" || pathname === "/reset-password";

  useEffect(() => {
    setMounted(true);
    if (isAuthPage) {
      setUser(null);
      return;
    }
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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
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
      await signOut({ redirect: false });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  if (isAuthPage) return null;

  // Renderiza um placeholder idêntico no servidor para evitar erro de hidratação
  if (!mounted) {
    return (
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/70 h-[65px]">
        <div className="px-4 py-3 flex items-center justify-between h-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-8 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex flex-col gap-1">
                <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-12 h-2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
              <div className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/70 h-[65px]">
      <div className="px-4 py-3 flex items-center justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 transition-all ${menuOpen ? 'ring-2 ring-violet-500/20 border-violet-500/30 text-violet-500' : 'text-slate-500'}`}
            >
              <MenuIcon size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Menu</span>
            </button>

            {menuOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-2 space-y-1">
                  <div className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Navegação</div>
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                          active 
                            ? 'bg-violet-500/10 text-violet-500 dark:text-violet-400' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon size={18} className={active ? 'text-violet-500' : 'text-slate-400'} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <span className="font-black text-lg">F</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">App Finanças</span>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Painel pessoal</span>
            </div>
          </div>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 transition-all ${dropdownOpen ? 'ring-2 ring-violet-500/20 border-violet-500/30' : ''}`}
          >
            <Image
              src={
                user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`
              }
              alt={user?.name || "Avatar"}
              width={32}
              height={32}
              unoptimized={true}
              className="h-8 w-8 rounded-lg object-cover border border-slate-700/70"
            />
            <ChevronDown size={12} className={`text-slate-500 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="p-2 space-y-1">
                <Link 
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <UserIcon size={16} className="text-emerald-500" />
                  Perfil
                </Link>
                <Link 
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  <Settings size={16} className="text-amber-500" />
                  Configurações
                </Link>
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
      </div>
    </div>
  );
}


