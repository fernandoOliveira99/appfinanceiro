"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { theme } from "@config/design-system";
import { useSession, signOut } from "next-auth/react";
import { User as UserIcon, LogOut, ChevronDown, LayoutDashboard, Settings, Info, Menu as MenuIcon, CreditCard, PieChart, Bell, X as XIcon, Check } from "lucide-react";

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
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const notificationsRef = useRef(null);

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

    // Carrega notificações iniciais
    fetchNotifications();

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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [session, isAuthPage]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/user/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const markAsRead = async (id = null) => {
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        if (id) {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
      }
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 animate-pulse" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 p-1 pr-2 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                <div className="w-3 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </div>
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

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) fetchNotifications();
              }}
              className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30 text-slate-500 hover:text-violet-500 transition-all relative ${showNotifications ? 'ring-2 ring-violet-500/20 border-violet-500/30 text-violet-500' : ''}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="fixed sm:absolute top-[70px] sm:top-full left-4 right-4 sm:left-auto sm:right-0 sm:mt-3 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-violet-500/10 text-violet-500">
                      <Bell size={12} />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Notificações</h3>
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => markAsRead()}
                      className="text-[9px] font-black uppercase tracking-tighter text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Ler todas
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] sm:max-h-80 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600">
                        <Bell size={20} />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tudo limpo por aqui!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-4 border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${!n.is_read ? 'bg-violet-500/5 dark:bg-violet-500/10' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                            n.type === 'warning' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                            n.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                            'bg-violet-500/10 border-violet-500/20 text-violet-500'
                          }`}>
                            {n.type === 'warning' ? <XIcon size={16} /> : <Check size={16} />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-[11px] font-black leading-tight truncate ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {n.title}
                              </p>
                              {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0"></div>}
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-500 leading-relaxed break-words font-medium line-clamp-2 group-hover:line-clamp-none transition-all">
                              {n.message}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                                {new Date(n.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Fim das notificações</p>
                  </div>
                )}
              </div>
            )}
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
    </div>
  );
}
