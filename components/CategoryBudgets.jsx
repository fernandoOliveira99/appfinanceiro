"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { Target, Edit2, Check, X, TrendingUp, TrendingDown, Info } from "lucide-react";

export default function CategoryBudgets({ transactions }) {
  const [budgets, setBudgets] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState("");

  // Load budgets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("category_budgets");
    if (saved) {
      setBudgets(JSON.parse(saved));
    }
  }, []);

  // Calculate current month spending
  const now = new Date();
  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date || t.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.type === 'expense';
  });

  const spentByCategory = currentMonthTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const categories = Object.keys(spentByCategory).sort((a, b) => spentByCategory[b] - spentByCategory[a]);

  const saveLimit = (category) => {
    const newBudgets = { ...budgets, [category]: Number(tempLimit) };
    setBudgets(newBudgets);
    localStorage.setItem("category_budgets", JSON.stringify(newBudgets));
    setEditingCategory(null);
  };

  if (categories.length === 0) return null;

  return (
    <section className={`${theme.cardStyles.base} rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-xl bg-white dark:bg-slate-900/80`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-500 shadow-inner border border-violet-500/20">
              <Target size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`${theme.typography.sectionTitle} text-slate-900 dark:text-white`}>Limite de Gastos</h2>
                <div className="group relative">
                  <button 
                    className="text-slate-500 hover:text-violet-500 transition-colors p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info size={14} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 p-3 bg-slate-900/95 backdrop-blur-md text-[11px] text-slate-200 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all pointer-events-none z-[100] border border-slate-700/50 shadow-2xl font-medium">
                    <p className="leading-relaxed">Estipule um valor máximo que deseja gastar em cada categoria para não estourar seu orçamento mensal.</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Controle seus limites por categoria</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.slice(0, 6).map((cat) => {
            const spent = spentByCategory[cat] || 0;
            const limit = budgets[cat] || 0;
            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            const isOver = limit > 0 && spent > limit;

            return (
              <div key={cat} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cat}</span>
                  {editingCategory === cat ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-900 dark:text-white outline-none"
                        value={tempLimit}
                        onChange={(e) => setTempLimit(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => saveLimit(cat)} className="text-emerald-500 hover:text-emerald-400">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingCategory(null)} className="text-rose-500 hover:text-rose-400">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                        Limite: {limit > 0 ? formatCurrencyBRL(limit) : "Não definido"}
                      </span>
                      <button 
                        onClick={() => { setEditingCategory(cat); setTempLimit(limit || ""); }}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                    <span className={isOver ? "text-rose-500" : "text-slate-500"}>
                      Gasto: {formatCurrencyBRL(spent)}
                    </span>
                    <span className={isOver ? "text-rose-500" : "text-slate-500"}>
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        isOver ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : 
                        percent > 80 ? 'bg-amber-500' : 'bg-violet-500'
                      }`}
                      style={{ width: `${limit > 0 ? percent : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {categories.length > 6 && (
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
            + {categories.length - 6} outras categorias
          </p>
        )}
      </div>
    </section>
  );
}
