"use client";

import { theme } from "@config/design-system";
import { AlertTriangle, Lightbulb, Zap, TrendingDown } from "lucide-react";
import { formatCurrencyBRL } from "@lib/finance-utils";

export default function IntelligentInsights({ transactions, economyMode }) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalIncome = income.reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpenses = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpenses;

  // 1. Suspicious Spending Logic
  const suspicious = [];
  
  if (expenses.length > 0) {
    const avgSpending = totalExpenses / expenses.length;
    
    // • A transaction much larger than the user's average spending
    expenses.forEach(t => {
      if (Number(t.amount) > avgSpending * 3) {
        suspicious.push({
          id: `large-${t.id}`,
          message: `Um gasto de ${formatCurrencyBRL(t.amount)} em ${t.category} está muito acima da sua média de ${formatCurrencyBRL(avgSpending)}.`,
          type: 'warning'
        });
      }
    });

    // • Sudden spike in a category (more than 50% of monthly balance in one category)
    const byCategory = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    Object.entries(byCategory).forEach(([cat, amount]) => {
      if (balance > 0 && amount > balance * 0.5) {
        suspicious.push({
          id: `spike-${cat}`,
          message: `Você gastou ${formatCurrencyBRL(amount)} em ${cat}, o que representa mais de 50% do seu saldo atual.`,
          type: 'danger'
        });
      }
    });
  }

  // 2. Economy Mode Tips
  const economyTips = [];
  if (economyMode) {
    const leisureSpending = expenses
      .filter(t => t.category === 'Lazer')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    if (leisureSpending > 0) {
      economyTips.push({
        id: 'tip-leisure',
        message: "Tente reduzir gastos com lazer esta semana para equilibrar seu orçamento.",
        icon: TrendingDown
      });
    }

    const foodSpending = expenses
      .filter(t => t.category === 'Alimentação' || t.category === 'Restaurante')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    if (foodSpending > 200) {
      economyTips.push({
        id: 'tip-food',
        message: `Você pode economizar cerca de ${formatCurrencyBRL(foodSpending * 0.2)} este mês reduzindo gastos com delivery.`,
        icon: Lightbulb
      });
    }

    if (economyTips.length === 0) {
      economyTips.push({
        id: 'tip-generic',
        message: "Modo Economia Ativo: Continue monitorando seus gastos para bater suas metas!",
        icon: Zap
      });
    }
  }

  if (suspicious.length === 0 && !economyMode) return null;

  return (
    <div id="insights-section" className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
      {/* Suspicious Spending Card */}
      {suspicious.length > 0 && (
        <section className={`${theme.cardStyles.base} rounded-2xl sm:rounded-[2rem] overflow-hidden border border-amber-200 dark:border-amber-500/20 shadow-xl bg-amber-50/50 dark:bg-amber-500/5 w-full max-w-full`}>
          <div className="p-4 sm:p-8 space-y-4">
            <h2 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <AlertTriangle size={18} />
              Gastos suspeitos
            </h2>
            <div className="flex flex-col gap-3">
              {suspicious.slice(0, 2).map((s) => (
                <div key={s.id} className={`p-4 rounded-2xl border ${s.type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'} w-full`}>
                  <p className="text-xs font-bold leading-relaxed break-words">{s.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Economy Mode Tips Card */}
      {economyMode && (
        <section className={`${theme.cardStyles.base} rounded-2xl sm:rounded-[2rem] overflow-hidden border border-emerald-200 dark:border-emerald-500/20 shadow-xl bg-emerald-50/50 dark:bg-emerald-500/5 w-full max-w-full`}>
          <div className="p-4 sm:p-8 space-y-4">
            <h2 className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Zap size={18} className="fill-emerald-600 dark:fill-emerald-500" />
              Modo Economia: Dicas
            </h2>
            <div className="flex flex-col gap-3">
              {economyTips.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.id} className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 w-full">
                    <Icon size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed break-words">{tip.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
