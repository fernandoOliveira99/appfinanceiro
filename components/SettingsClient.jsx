"use client";

import { useEffect, useState } from "react";
import { theme } from "@config/design-system";
import RecurringTransactionsManager from "@components/RecurringTransactionsManager";
import GoalsManager from "@components/GoalsManager";

export default function SettingsClient({ initialCategories }) {
  const [categories, setCategories] = useState(initialCategories || []);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    async function refresh() {
      const catRes = await fetch("/api/categories");
      if (catRes.ok) {
        setCategories(await catRes.json());
      }
    }
    refresh();
  }, []);

  async function handleSalaryChange(e) {
    const value = parseFloat(e.target.value || "0");
    setSalary(value);
    await fetch("/api/settings/salary", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salary: value })
    });
  }

  async function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed })
    });
    if (res.ok) {
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
      setNewCategory("");
    }
  }

  async function renameCategory(id) {
    const current = categories.find((c) => c.id === id);
    const novoNome = window.prompt("Novo nome da categoria:", current?.name);
    if (!novoNome) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: novoNome })
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      );
    }
  }

  async function removeCategory(id) {
    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE"
    });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function restartTutorial() {
    if (!confirm("Deseja reiniciar o tutorial de boas-vindas?")) return;
    const res = await fetch("/api/user/restart-tutorial", {
      method: "POST"
    });
    if (res.ok) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <div className="space-y-6">
      <section className={theme.cardStyles.base}>
        <div className={`${theme.spacing.cardPadding} space-y-2 flex justify-between items-start`}>
          <div>
            <h2 className={theme.typography.title}>Configurações</h2>
            <p className={theme.typography.subtitle}>
              Personalize categorias e preferências da sua conta.
            </p>
          </div>
          <button 
            onClick={restartTutorial}
            className="px-4 py-2 rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-xs font-black uppercase tracking-widest hover:bg-violet-600/20 transition-all active:scale-95"
          >
            Reiniciar Tutorial
          </button>
        </div>
      </section>

      <section className={theme.cardStyles.base}>
        <div className={`${theme.spacing.cardPadding} space-y-4`}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Categorias de despesas</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 md:max-w-xs transition-all placeholder:text-slate-400"
              placeholder="Nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button 
              type="button" 
              className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-600/20 active:scale-95" 
              onClick={addCategory}
            >
              Adicionar categoria
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 group hover:border-violet-300 dark:hover:border-slate-600 transition-all"
              >
                <span>{cat.name}</span>
                <div className="flex items-center gap-1.5 ml-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                  <button
                    type="button"
                    onClick={() => renameCategory(cat.id)}
                    className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                    title="Renomear"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

