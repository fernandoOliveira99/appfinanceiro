"use client";

import { useEffect, useState } from "react";
import { theme } from "@config/design-system";
import CategoryPieChart from "@components/charts/CategoryPieChart";
import IncomeExpenseBarChart from "@components/charts/IncomeExpenseBarChart";
import BalanceLineChart from "@components/charts/BalanceLineChart";
import { calculateTotals } from "@lib/finance-utils";

function buildMonthlySeries(transactions) {
  const byMonth = new Map();

  transactions.forEach((t) => {
    if (t.type !== "expense" || !t.date) return;
    const dateStr = typeof t.date === "string" ? t.date : new Date(t.date).toISOString();
    const key = dateStr.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) || 0) + Number(t.amount));
  });

  const sortedKeys = Array.from(byMonth.keys()).sort();
  return {
    labels: sortedKeys,
    values: sortedKeys.map((k) => byMonth.get(k))
  };
}

export default function ReportsClient({ initialTransactions }) {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hideValues, setHideValues] = useState(false);

  useEffect(() => {
    const savedHide = localStorage.getItem('hide_dashboard_values') === 'true';
    setHideValues(savedHide);

    const handleToggle = (e) => setHideValues(e.detail);
    window.addEventListener('toggle-values', handleToggle);
    return () => window.removeEventListener('toggle-values', handleToggle);
  }, []);

  useEffect(() => {
    async function refresh() {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        setTransactions(await res.json());
      }
    }
    refresh();
  }, []);

  // Filtros dinâmicos
  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const dateStr = typeof t.date === "string" ? t.date : new Date(t.date).toISOString();
    const matchesMonth = selectedMonth === "all" || dateStr.startsWith(selectedMonth);
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesMonth && matchesCategory;
  });

  const onlyExpenses = filteredTransactions.filter((t) => t.type === "expense");
  const { byCategory } = calculateTotals(onlyExpenses);
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  
  // Extrair meses e categorias únicos para os filtros
  const months = Array.from(new Set(transactions.map(t => {
    if (!t.date) return null;
    const dateStr = typeof t.date === "string" ? t.date : new Date(t.date).toISOString();
    return dateStr.slice(0, 7);
  }))).filter(Boolean).sort().reverse();
  const categories = Array.from(new Set(transactions.map(t => t.category))).filter(Boolean).sort();

  return (
    <div className="space-y-6">
      <section className={theme.cardStyles.base}>
        <div className={`${theme.spacing.cardPadding} space-y-6`}>
          <div className="space-y-2">
            <h2 className={theme.typography.title}>Relatórios Avançados</h2>
            <p className={theme.typography.subtitle}>
              Analise padrões, categorias e tendências das suas despesas ao longo do tempo.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">Filtrar por Mês</label>
              <select 
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 min-w-[150px] transition-all"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="all">Todos os meses</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500 ml-1">Filtrar por Categoria</label>
              <select 
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 min-w-[150px] transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CategoryPieChart data={byCategory} hideValues={hideValues} />
        <IncomeExpenseBarChart 
          income={totalIncome} 
          expenses={onlyExpenses.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)} 
          hideValues={hideValues}
        />
      </div>

      <BalanceLineChart transactions={filteredTransactions} hideValues={hideValues} />
    </div>
  );
}

