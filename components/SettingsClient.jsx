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
          <h3 className={theme.typography.sectionTitle}>Categorias de despesas</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              className="bg-slate-900/80 border border-slate-700/70 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/70 md:max-w-xs"
              placeholder="Nova categoria"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="button" className={theme.button.primary} onClick={addCategory}>
              Adicionar categoria
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-slate-900/80 border border-slate-700/70 text-slate-200"
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  onClick={() => renameCategory(cat.id)}
                  className="text-slate-400 hover:text-violet-300 ml-1"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={() => removeCategory(cat.id)}
                  className="text-slate-400 hover:text-rose-300 ml-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

