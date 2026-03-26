"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { formatCurrencyBRL, formatDate, getTodayLocalDate } from "@lib/finance-utils";
import { Target, Trash2, Plus, TrendingUp, AlertCircle } from "lucide-react";

export default function GoalsManager() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  
  // Form state
  const [type, setType] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState(() => getTodayLocalDate());

  useEffect(() => {
    fetchGoals();
    
    // Carrega preferência de ocultação de valores
    const savedHide = localStorage.getItem('hide_dashboard_values') === 'true';
    setHideValues(savedHide);

    const handleToggle = (e) => setHideValues(e.detail);
    window.addEventListener('toggle-values', handleToggle);
    return () => window.removeEventListener('toggle-values', handleToggle);
  }, []);

  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        setGoals(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch goals", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, target_amount: targetAmount, current_amount: currentAmount, deadline })
    });
    if (res.ok) {
      setShowAdd(false);
      setType("");
      setTargetAmount("");
      setCurrentAmount("");
      fetchGoals();
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchGoals();
    }
  }

  if (loading) return null;

  return (
    <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner border border-violet-500/20">
              <Target size={20} />
            </div>
            <h2 className={`${theme.typography.sectionTitle} text-white`}>Metas Financeiras</h2>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            {showAdd ? <Plus size={18} className="rotate-45" /> : <Plus size={18} />}
          </button>
        </div>

        {showAdd && (
          <form onSubmit={handleAdd} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/60 space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Meta</label>
                <input
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Ex: Reserva de Emergência, Carro Novo..."
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Valor Alvo</label>
                <input
                  type="number"
                  step="0.01"
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Valor Atual</label>
                <input
                  type="number"
                  step="0.01"
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prazo</label>
                <input
                  type="date"
                  className="bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-900/20">
              Criar Meta
            </button>
          </form>
        )}

        <div className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-center py-4 text-xs text-slate-500 italic">Nenhuma meta financeira definida.</p>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-800/40 group hover:border-slate-700/60 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                        <TrendingUp size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-200">{goal.type}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Prazo: {formatDate(goal.deadline)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs font-black text-violet-400">
                          {Math.round(progress)}%
                        </span>
                        <p className="text-[10px] font-bold text-slate-500">
                          {formatCurrencyBRL(goal.current_amount, hideValues)} / {formatCurrencyBRL(goal.target_amount, hideValues)}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 rounded-lg text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full shadow-lg shadow-violet-500/20 transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
