"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { X, DollarSign, Calendar, Type } from "lucide-react";

export default function CreateGoalModal({ open, onClose, onGoalCreated, initialData }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);



  // Use useEffect to update state when initialData changes or modal opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.type);
        setTargetAmount(Number(initialData.target_amount));
        setCurrentAmount(Number(initialData.current_amount || 0));
        setDeadline(initialData.deadline ? new Date(initialData.deadline).toISOString().slice(0, 10) : "");
      } else {
        setName("");
        setTargetAmount("");
        setCurrentAmount("");
        setDeadline("");
      }
    }
  }, [open, initialData]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    setTargetAmount(numericValue);
  };

  const handleCurrentAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    setCurrentAmount(numericValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetAmount) return;
    setLoading(true);

    const payload = {
      type: name,
      target_amount: targetAmount,
      current_amount: currentAmount || 0,
      deadline: deadline || null,
    };

    const url = initialData ? `/api/goals/${initialData.id}` : "/api/goals";
    const method = initialData ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        
        // Handle newly unlocked achievements
        if (result.newlyUnlocked?.length > 0) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: result.newlyUnlocked }));
        }

        onGoalCreated(result, Boolean(initialData));
        onClose();
      }
    } catch (err) {
      console.error("Failed to save goal", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className={`${theme.cardStyles.base} max-w-md w-full shadow-2xl rounded-3xl overflow-hidden border border-slate-800/50`}>
        <form onSubmit={handleSubmit} className={`${theme.spacing.cardPadding} space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className={`${theme.typography.sectionTitle} text-xl font-bold text-white`}>
              {initialData ? "Editar Meta" : "Criar Nova Meta"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2"><Type size={12} /> Nome da Meta</label>
              <input
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Viagem para o Japão"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2"><DollarSign size={12} /> Valor Total</label>
              <input
                type="text"
                inputMode="decimal"
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(targetAmount || 0)}
                onChange={handleAmountChange}
                placeholder="R$ 0,00"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2"><DollarSign size={12} className="text-emerald-500" /> Já Tenho (Opcional)</label>
              <input
                type="text"
                inputMode="decimal"
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
                value={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(currentAmount || 0)}
                onChange={handleCurrentAmountChange}
                placeholder="R$ 0,00"
              />
              <p className="text-[9px] text-slate-500 font-medium ml-1">Este valor será adicionado à meta sem descontar do seu saldo atual.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1 flex items-center gap-2"><Calendar size={12} /> Prazo (Opcional)</label>
              <input
                type="date"
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? (initialData ? "Salvando..." : "Criando...") : (initialData ? "Salvar Alterações" : "Criar Meta")}
          </button>
        </form>
      </div>
    </div>
  );
}
