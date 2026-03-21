"use client";

import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { History, TrendingUp, TrendingDown, DollarSign, Plus } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function FinanceCards({ salary, totalExpenses, totalIncome, forecastBalance, previousBalance, lastMovementDate, onAddIncome, onAddExpense, transactions = [], balanceHistory = [] }) {
  const saldo = totalIncome - totalExpenses;
  const [showHistory, setShowHistory] = useState(false);

  // Cálculo real da variação acumulada de todos os valores adicionados
  const variation = totalIncome !== 0 
    ? ((saldo - totalIncome) / totalIncome) * 100 
    : 0;
  const isPositive = variation >= 0;

  const formatDateTime = (date) => {
    if (!date) return "";
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}, ${hours}:${minutes}`;
  };

  return (
    <div className="w-full space-y-6">
      <section id="balance-area" className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
        {/* Card de Saldo Total */}
        <div className={`${theme.cardStyles.base} rounded-3xl md:rounded-[2rem] p-3 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 hover:border-violet-500/30 transition-all duration-500 group relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.07] group-hover:scale-110 transition-transform duration-700">
            <DollarSign size={80} className="text-slate-900 dark:text-white" />
          </div>

          <div className="relative z-10 flex flex-col gap-2 md:gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-violet-500/10 flex items-center justify-center text-lg md:text-2xl shadow-inner border border-violet-500/20 group-hover:rotate-12 transition-transform duration-500 shrink-0">💰</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] md:text-xs font-black uppercase tracking-tighter md:tracking-[0.2em] text-slate-500 dark:text-slate-400">Saldo</p>
                  <h3 className={`text-[10px] xs:text-xs sm:text-sm md:text-4xl font-black ${saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} tracking-tight mt-0.5 md:mt-1 break-words leading-tight`}>
                    {formatCurrencyBRL(saldo)}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0 self-end sm:self-auto">
                <button 
                  onClick={onAddIncome}
                  className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-90 border border-emerald-500/20 shadow-sm"
                  title="Adicionar dinheiro"
                >
                  <Plus size={16} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all ${showHistory ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-violet-500 border border-slate-200 dark:border-slate-700'} active:scale-90`}
                  title="Ver histórico"
                >
                  <History size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {showHistory && (
              <div className="mt-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">Total Recebido</span>
                    <span className="text-[10px] md:text-xs font-black text-emerald-600 dark:text-emerald-400 break-words">{formatCurrencyBRL(totalIncome)}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase">Variação Geral</span>
                    <div className={`flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {variation.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Histórico do Saldo</p>
                  {balanceHistory.length === 0 ? (
                    <p className="text-[9px] md:text-xs text-slate-400 italic">Nenhuma movimentação</p>
                  ) : (
                    balanceHistory.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 border-b border-slate-200/50 dark:border-slate-800/30 pb-1.5 last:border-0">
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                          <span className="text-[8px] md:text-[10px] text-slate-400 font-bold">{formatDateTime(item.date)}</span>
                          <span className={`sm:hidden text-[9px] md:text-[10px] font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrencyBRL(item.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <span className={`hidden sm:inline text-[9px] md:text-[10px] font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrencyBRL(item.amount)}
                          </span>
                          <span className="text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-200 break-words">
                            {formatCurrencyBRL(item.balance)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card de Despesas */}
        <div className={`${theme.cardStyles.base} rounded-3xl md:rounded-[2rem] p-3 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 hover:border-rose-500/30 transition-all duration-500 group min-w-0 w-full relative overflow-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-rose-500/10 flex items-center justify-center text-lg md:text-2xl shadow-inner border border-rose-500/20 group-hover:scale-110 transition-transform duration-500 shrink-0">📉</div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] md:text-xs font-black uppercase tracking-tighter md:tracking-[0.2em] text-slate-500 dark:text-slate-400">Despesas</p>
                <h3 className="text-[10px] xs:text-xs sm:text-sm md:text-3xl font-black text-rose-600 dark:text-rose-500 mt-0.5 md:mt-1 break-words leading-tight">
                  {formatCurrencyBRL(totalExpenses)}
                </h3>
              </div>
            </div>
            
            <button 
              onClick={onAddExpense}
              className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90 border border-rose-500/20 shadow-sm shrink-0 self-end sm:self-auto"
              title="Adicionar despesa"
            >
              <Plus size={16} className="md:w-5 md:h-5" />
            </button>
          </div>
          <div className="mt-3 md:mt-6 flex items-center gap-2 md:gap-3">
            <div className="h-1 md:h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalExpenses / (totalIncome || 1)) * 100)}%` }}
                className="h-full bg-rose-500 rounded-full transition-all duration-1000" 
              ></motion.div>
            </div>
            <span className="text-[7px] md:text-[10px] font-black text-rose-500 whitespace-nowrap shrink-0">
              {((totalExpenses / (totalIncome || 1)) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </section>

      {/* Previsão de Saldo (Forecast) */}
      <section id="forecast-section" className={`${theme.cardStyles.base} rounded-[2rem] p-6 shadow-xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 hover:shadow-2xl transition-all duration-500 group overflow-hidden relative`}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
          <div className="text-6xl font-black italic select-none text-slate-900 dark:text-white">FORECAST</div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              🔮 Previsão para o fim do mês
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Baseado na sua média de gastos diários e dias restantes no mês.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right border-r border-slate-200 dark:border-slate-800 pr-8 hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Saldo Atual</p>
              <h4 className={`text-lg font-bold ${saldo >= 0 ? "text-emerald-600 dark:text-emerald-400/80" : "text-rose-600 dark:text-rose-400/80"}`}>
                {formatCurrencyBRL(saldo)}
              </h4>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Previsão no fim do mês</p>
              <h4 className={`text-2xl font-black ${forecastBalance >= 0 ? "text-violet-600 dark:text-violet-400" : "text-rose-600 dark:text-rose-500 animate-pulse"}`}>
                {formatCurrencyBRL(forecastBalance)}
              </h4>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

