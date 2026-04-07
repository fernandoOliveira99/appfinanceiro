"use client";

import { theme } from "@config/design-system";
import { Plus, Moon, Sun, Bell, Check, X as XIcon, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function DashboardHeader({ user, onAddIncome, onAddExpense, hideValues, onToggleHideValues, selectedDate, setSelectedDate }) {
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

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleResetMonth = () => {
    setSelectedDate(new Date());
  };

  const isCurrentMonth = () => {
    const today = new Date();
    return selectedDate.getMonth() === today.getMonth() && 
           selectedDate.getFullYear() === today.getFullYear();
  };

  const monthName = selectedDate.toLocaleString('pt-BR', { month: 'long' });
  const yearName = selectedDate.getFullYear();
  const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

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
            <div className="flex items-center gap-3">
              {/* Branding removido conforme solicitação do usuário */}
              
              {/* Month Selector Pill */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1 border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:border-violet-500/30">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-violet-500 transition-all active:scale-90"
                  title="Mês anterior"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex flex-col items-center px-3 min-w-[120px] md:min-w-[140px] justify-center">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-violet-500" />
                    <span className="text-[11px] md:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                      {formattedMonth} <span className="text-violet-500/50 ml-0.5">{yearName}</span>
                    </span>
                  </div>
                  {!isCurrentMonth() && (
                    <button 
                      onClick={handleResetMonth}
                      className="text-[8px] font-black text-violet-500 uppercase tracking-tighter hover:underline animate-in fade-in slide-in-from-top-1 duration-300"
                    >
                      Voltar para hoje
                    </button>
                  )}
                </div>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-violet-500 transition-all active:scale-90"
                  title="Próximo mês"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleHideValues}
                className={`group p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all shadow-sm active:scale-95 ${
                  hideValues 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 ring-4 ring-rose-500/5' 
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-500/30'
                }`}
                title={hideValues ? "Mostrar valores" : "Ocultar valores"}
              >
                {hideValues ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              <button
                onClick={toggleTheme}
                className="group p-2 md:p-3 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95 hover:border-violet-500/30"
                title={isDark ? "Modo Claro" : "Modo Escuro"}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter truncate max-w-full drop-shadow-sm">
            Olá, {capitalizedName} 👋
          </h1>
          <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 max-w-lg font-medium leading-relaxed">
            Acompanhe seus gastos e metas em um só lugar.
          </p>
        </div>
      </div>
    </section>
  );
}
