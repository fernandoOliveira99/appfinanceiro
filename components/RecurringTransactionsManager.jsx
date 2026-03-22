"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { Repeat, Trash2, Plus, Calendar, DollarSign, Edit2, Info } from "lucide-react";

export default function RecurringTransactionsManager({ transactions = [], hideValues = false }) {
  const [recurring, setRecurring] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [amountDisplay, setAmountDisplay] = useState("");
  const [category, setCategory] = useState("Outros");
  const [type, setType] = useState("expense");
  const [frequency, setFrequency] = useState("monthly");
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetchRecurring();
  }, []);

  const expenses = transactions.filter(t => t.type === 'expense');

  function resetForm() {
    setName("");
    setAmount("");
    setAmountDisplay("");
    setCategory("Outros");
    setType("expense");
    setFrequency("monthly");
    setNextDate(new Date().toISOString().slice(0, 10));
    setEditingId(null);
  }

  async function fetchRecurring() {
    try {
      const res = await fetch("/api/recurring");
      if (res.ok) {
        setRecurring(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch recurring", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { name, amount: Number(amount), category, type, frequency, next_date: nextDate };
    
    const url = editingId ? `/api/recurring/${editingId}` : "/api/recurring";
    const method = editingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setShowAdd(false);
      resetForm();
      fetchRecurring();
    }
  }

  function handleEdit(item) {
    setName(item.name);
    setAmount(item.amount);
    setAmountDisplay(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(item.amount)
    );
    setCategory(item.category);
    setType(item.type);
    setFrequency(item.frequency);
    setNextDate(new Date(item.next_date).toISOString().slice(0, 10));
    setEditingId(item.id);
    setShowAdd(true);
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchRecurring();
    }
  }

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    setAmount(numericValue);
    setAmountDisplay(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(numericValue)
    );
  };

  if (loading) return null;

  return (
    <section id="recurring-transactions-section" className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner border border-amber-500/20">
              <Repeat size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`${theme.typography.sectionTitle} text-white`}>Contas Fixas</h2>
                <div className="group relative">
                  <button 
                    className="text-slate-500 hover:text-amber-500 transition-colors p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info size={14} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-56 p-3 bg-slate-900/95 backdrop-blur-md text-[11px] text-slate-200 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all pointer-events-none z-[100] border border-slate-700/50 shadow-2xl font-medium">
                    <p className="leading-relaxed">Gerencie seus gastos recorrentes que vencem todo mês, como aluguel, internet ou assinaturas.</p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seus compromissos recorrentes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (showAdd) resetForm();
                setShowAdd(!showAdd);
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
            >
              {showAdd ? <Plus size={18} className="rotate-45" /> : <Plus size={18} />}
            </button>
          </div>
        </div>

        {showAdd && (
          <form onSubmit={handleSubmit} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {editingId ? "Editar Transação" : "Nova Transação"}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Nome</label>
                <input
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Aluguel, Netflix..."
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Valor</label>
                <input
                  type="text"
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Frequência</label>
                <select
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="monthly">Mensal</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Tipo</label>
                <select
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Próxima Data</label>
                <input
                  type="date"
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-900/20">
              {editingId ? "Salvar Alterações" : "Criar Transação Recorrente"}
            </button>
          </form>
        )}

        <div className="space-y-6">
          {/* 1. SEÇÃO DE CONTAS FIXAS */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 px-1 flex items-center gap-2">
              <Repeat size={12} />
              Contas Fixas Planejadas
            </h3>
            {recurring.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500 italic bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">Nenhuma transação recorrente configurada.</p>
            ) : (
              recurring.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/30 border border-slate-800/40 group hover:border-slate-700/60 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${
                      item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.type === 'income' ? <DollarSign size={18} /> : <Calendar size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {item.frequency === 'monthly' ? 'Mensal' : 'Semanal'} • Próximo: {new Date(item.next_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrencyBRL(item.amount, hideValues)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => handleEdit(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all shadow-sm"
                        title="Editar"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-sm"
                        title="Excluir"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 2. SEÇÃO DE DESPESAS REAIS (COMPARAÇÃO) */}
          <div className="space-y-3 pt-4 border-t border-slate-800/50">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-500/80 px-1 flex items-center gap-2">
              <DollarSign size={12} />
              Despesas Reais do Mês
            </h3>
            {expenses.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500 italic bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">Nenhuma despesa registrada no dashboard.</p>
            ) : (
              expenses.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/20 border border-slate-800/30">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-300">{tx.name || tx.description}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {tx.category} • {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-rose-400">
                    - {formatCurrencyBRL(tx.amount, hideValues)}
                  </span>
                </div>
              ))
            )}
            {expenses.length > 5 && (
              <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-2">
                + {expenses.length - 5} outras despesas no painel
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
