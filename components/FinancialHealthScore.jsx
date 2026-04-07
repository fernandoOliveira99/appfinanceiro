"use client";

import { theme } from "@config/design-system";
import { Activity, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function FinancialHealthScore({ transactions, goals }) {
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Lógica de cálculo do Score (0-100)
    let currentScore = 0;
    
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = income - expenses;

    // Se não houver movimentações no mês, o score deve refletir "Em Análise" (0)
    if (income === 0 && expenses === 0) {
      setScore(0);
      return;
    }

    // 1. Saldo Positivo (até 40 pontos)
    if (balance > 0) currentScore += 20;
    if (balance > income * 0.2) currentScore += 20;

    // 2. Controle de Gastos (até 30 pontos)
    if (income > 0 && expenses < income * 0.8) currentScore += 30;
    else if (income > 0 && expenses < income) currentScore += 15;
    // Se tiver apenas despesas (income 0), não ganha pontos aqui

    // 3. Metas (até 30 pontos)
    if (goals.length > 0) {
      const activeGoals = goals.filter(g => g.target_amount > 0);
      if (activeGoals.length > 0) {
        const avgProgress = activeGoals.reduce((acc, g) => acc + (g.current_amount / g.target_amount), 0) / activeGoals.length;
        currentScore += Math.min(30, Math.floor(avgProgress * 30));
      }
    }

    // Garante um score mínimo de 1 se houver alguma movimentação, para não cair no estado "Em Análise"
    setScore(Math.max(1, currentScore));
  }, [transactions, goals]);

  const getScoreInfo = () => {
    if (score === 0) return {
      label: "Em Análise",
      color: "text-slate-500",
      bg: "bg-slate-500/10",
      icon: Shield,
      tip: "Novo mês iniciado! Adicione suas receitas e despesas para calcularmos sua saúde financeira."
    };
    if (score >= 80) return { 
      label: "Excelente", 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10", 
      icon: ShieldCheck,
      tip: "Você está no controle total! Continue poupando e investindo."
    };
    if (score >= 50) return { 
      label: "Boa", 
      color: "text-amber-500", 
      bg: "bg-amber-500/10", 
      icon: Shield,
      tip: "Tente reduzir gastos supérfluos para subir seu score."
    };
    return { 
      label: "Crítica", 
      color: "text-rose-500", 
      bg: "bg-rose-500/10", 
      icon: ShieldAlert,
      tip: "Cuidado! Suas despesas estão muito altas. Revise seu orçamento."
    };
  };

  const info = getScoreInfo();
  const Icon = info.icon;

  return (
    <section className={`${theme.cardStyles.base} rounded-[2.5rem] p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/80 overflow-hidden relative group`}>
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Saúde Financeira</h3>
          <div className="flex items-center gap-2">
            <span className={`text-3xl font-black text-slate-900 dark:text-white`}>{score}</span>
            <span className="text-sm font-bold text-slate-400">/100</span>
          </div>
        </div>
        
        <div className={`h-14 w-14 rounded-2xl ${info.bg} flex items-center justify-center ${info.color} shadow-inner border border-current/10`}>
          <Icon size={28} className="animate-pulse" />
        </div>
      </div>

      <div className="mt-4 space-y-3 relative z-10">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className={`text-[10px] font-black uppercase tracking-widest ${info.color}`}>
            Saúde {info.label}
          </p>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
            {info.tip}
          </p>
        </div>
      </div>

      {/* Decorative background element */}
      <Activity className="absolute -bottom-4 -right-4 h-24 w-24 text-slate-100 dark:text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
    </section>
  );
}
