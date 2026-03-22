"use client";

import { useEffect, useMemo, useState } from "react";
import { theme } from "@config/design-system";
import TransactionList from "@components/TransactionList";
import CategoryList from "@components/CategoryList";
import TransactionModal from "@components/TransactionModal";
import { calculateTotals, formatCurrencyBRL } from "@lib/finance-utils";

export default function TransactionsClient({ initialTransactions, initialCategories }) {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [textFilter, setTextFilter] = useState("");
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalMode, setModalMode] = useState(null);
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
      const [txRes, catRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/categories")
      ]);
      if (txRes.ok) {
        setTransactions(await txRes.json());
      }
      if (catRes.ok) {
        setCategories(await catRes.json());
      }
    }
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter && t.category !== categoryFilter) return false;
      if (textFilter && !t.name.toLowerCase().includes(textFilter.toLowerCase()))
        return false;
      return true;
    });
  }, [transactions, categoryFilter, textFilter]);

  const { totalExpenses } = calculateTotals(
    filtered.filter((t) => t.type === "expense")
  );

  const categoryNames = categories.map((c) => c.name);

  function handleDeleted(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleSaveTransaction(tx) {
    const isUpdate = Boolean(tx.id);
    const url = isUpdate ? `/api/transactions/${tx.id}` : "/api/transactions";
    const method = isUpdate ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx)
    });

    if (res.ok) {
      const saved = await res.json();
      if (isUpdate) {
        setTransactions((prev) => prev.map(t => t.id === saved.id ? saved : t));
      } else {
        setTransactions((prev) => [saved, ...prev]);
      }
      setEditingTransaction(null);
      setModalMode(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className={theme.cardStyles.base}>
        <div className={`${theme.spacing.cardPadding} space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <h2 className={theme.typography.title}>Transações</h2>
              <p className={theme.typography.subtitle}>
                Visualize, filtre e gerencie todas as movimentações do período.
              </p>
            </div>
            <div className="hidden md:flex text-sm text-slate-300">
              <span>Total gasto neste filtro:&nbsp;</span>
              <span className="text-rose-400">
                {formatCurrencyBRL(totalExpenses, hideValues)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="bg-slate-900/80 border border-slate-700/70 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-500/70 md:col-span-2"
              placeholder="Buscar por nome da transação..."
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
            />
            <div className="md:hidden text-xs text-slate-300">
              Total filtrado:{" "}
              <span className="text-rose-400">
                {formatCurrencyBRL(totalExpenses, hideValues)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4">
        <TransactionList 
          title="Histórico completo" 
          transactions={filtered} 
          onDeleted={handleDeleted}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setModalMode(tx.type);
          }}
          hideValues={hideValues}
        />
        <CategoryList
          categories={categoryNames}
          active={categoryFilter}
          onSelect={setCategoryFilter}
        />
      </div>

      <TransactionModal
        open={Boolean(modalMode)}
        mode={modalMode}
        initialData={editingTransaction}
        onClose={() => {
          setModalMode(null);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />
    </div>
  );
}

