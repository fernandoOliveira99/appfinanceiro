"use client";

import { theme } from "@config/design-system";
import { Plus, Moon, Sun, Bell, Check, X as XIcon, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function DashboardHeader({ user, onAddIncome, onAddExpense, hideValues, onToggleHideValues }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Verifica preferência salva ou tema do sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    
    // Listener para mudanças no tema do sistema em tempo real
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Quando o sistema muda, seguimos o sistema
      const newDark = e.matches;
      setIsDark(newDark);
      // O layout.js já cuida de aplicar as classes no documentElement e limpar o localStorage
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Carrega notificações iniciais
    fetchNotifications();

    // Fecha o dropdown ao clicar fora
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

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

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'Usuário';
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!mounted) return (
    <section className={`${theme.cardStyles.base} rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900 h-32 md:h-48 animate-pulse`} />
  );

  return (
    <section className={`${theme.cardStyles.base} rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950/50 relative transition-all duration-300 overflow-hidden`}>
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8">
        <div className="space-y-1 md:space-y-3 w-full flex-1">
          <div className="flex items-center justify-between md:justify-start gap-4">
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
              Finanças App
            </p>
            
            <div className="flex items-center gap-2">
              {/* Notificações */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) fetchNotifications();
                  }}
                  className="group p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all border border-slate-200 dark:border-slate-700 shadow-sm relative"
                >
                  <Bell size={14} className="md:w-4 md:h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute top-full right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Notificações</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAsRead()}
                          className="text-[9px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-xs text-slate-500 font-medium italic">Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-800 last:border-0 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.is_read ? 'bg-violet-500/5 dark:bg-violet-500/10' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                n.type === 'warning' ? 'bg-rose-500/10 text-rose-500' : 
                                n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                                'bg-violet-500/10 text-violet-500'
                              }`}>
                                {n.type === 'warning' ? <XIcon size={14} /> : <Check size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] font-bold leading-tight ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {n.title}
                                </p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1 leading-snug break-words">
                                  {n.message}
                                </p>
                                <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={onToggleHideValues}
                className={`group p-1.5 md:p-2 rounded-xl md:rounded-2xl border transition-all shadow-sm ${
                  hideValues 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400'
                }`}
                title={hideValues ? "Mostrar valores" : "Ocultar valores"}
              >
                {hideValues ? <EyeOff size={14} className="md:w-4 md:h-4" /> : <Eye size={14} className="md:w-4 md:h-4" />}
              </button>

              <button
                onClick={toggleTheme}
                className="group p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                {isDark ? <Sun size={14} className="md:w-4 md:h-4" /> : <Moon size={14} className="md:w-4 md:h-4" />}
              </button>
            </div>
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full">
            Olá, {capitalizedName} 👋
          </h1>
          <p className="text-[10px] md:text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium">
            Acompanhe seus gastos e metas em um só lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
