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
    <div className="w-full space-y-4 md:space-y-6">
      <section id="balance-area" className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
        {/* Card de Saldo Total */}
        <div className={`${theme.cardStyles.base} rounded-3xl md:rounded-[2rem] p-3 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 hover:border-violet-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[110px] md:min-h-0`}>
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.07] group-hover:scale-110 transition-transform duration-700 hidden md:block">
            <DollarSign size={80} className="text-slate-900 dark:text-white" />
          </div>

          <div className="relative z-10 flex flex-col gap-2 md:gap-3 h-full">
            <div className="flex flex-col h-full justify-between gap-1">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="h-7 w-7 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-violet-500/10 flex items-center justify-center text-sm md:text-2xl shadow-inner border border-violet-500/20 shrink-0">💰</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[7px] md:text-xs font-black uppercase tracking-tighter md:tracking-[0.2em] text-slate-500 dark:text-slate-400 leading-none">Saldo</p>
                  <h3 className={`text-[11px] xs:text-xs md:text-4xl font-black ${saldo >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"} tracking-tight mt-0.5 md:mt-1 truncate leading-tight`}>
                    {formatCurrencyBRL(saldo)}
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 md:gap-2 shrink-0 mt-auto">
                <button 
                  onClick={onAddIncome}
                  className="flex-1 md:flex-none p-1.5 md:p-3 rounded-lg md:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95 border border-emerald-500/20 shadow-sm flex items-center justify-center"
                  title="Adicionar"
                >
                  <Plus size={14} className="md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex-1 md:flex-none p-1.5 md:p-3 rounded-lg md:rounded-2xl transition-all ${showHistory ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-violet-500 border border-slate-200 dark:border-slate-700'} active:scale-95 flex items-center justify-center`}
                  title="Histórico"
                >
                  <History size={14} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Despesas */}
        <div className={`${theme.cardStyles.base} rounded-3xl md:rounded-[2rem] p-3 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800/40 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 hover:border-rose-500/30 transition-all duration-500 group flex flex-col justify-between min-h-[110px] md:min-h-0 relative overflow-hidden`}>
          <div className="flex flex-col h-full justify-between gap-1">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="h-7 w-7 md:h-12 md:w-12 rounded-lg md:rounded-2xl bg-rose-500/10 flex items-center justify-center text-sm md:text-2xl shadow-inner border border-rose-500/20 shrink-0">📉</div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] md:text-xs font-black uppercase tracking-tighter md:tracking-[0.2em] text-slate-500 dark:text-slate-400 leading-none">Despesas</p>
                <h3 className="text-[11px] xs:text-xs md:text-3xl font-black text-rose-600 dark:text-rose-500 mt-0.5 md:mt-1 truncate leading-tight">
                  {formatCurrencyBRL(totalExpenses)}
                </h3>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={onAddExpense}
                className="w-full p-1.5 md:p-3 rounded-lg md:rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-95 border border-rose-500/20 shadow-sm flex items-center justify-center"
                title="Adicionar"
              >
                <Plus size={14} className="md:w-5 md:h-5" />
              </button>
              
              <div className="flex items-center gap-1.5 md:gap-3">
                <div className="h-1 md:h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalExpenses / (totalIncome || 1)) * 100)}%` }}
                    className="h-full bg-rose-500 rounded-full" 
                  ></motion.div>
                </div>
                <span className="text-[6px] md:text-[10px] font-black text-rose-500 whitespace-nowrap">
                  {((totalExpenses / (totalIncome || 1)) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card de Extrato/Histórico - Aparece quando clicado no botão de histórico */}
      {showHistory && (
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${theme.cardStyles.base} rounded-[2rem] p-6 shadow-xl border border-violet-500/30 bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950 overflow-hidden relative mt-4`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 border border-violet-500/20">
                <History size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extrato de Movimentações</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Histórico detalhado do seu saldo</p>
              </div>
            </div>
            <button 
              onClick={() => setShowHistory(false)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-all"
            >
              <Plus size={20} className="rotate-45" />
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {balanceHistory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-500 italic">Nenhuma movimentação registrada.</p>
              </div>
            ) : (
              balanceHistory.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 hover:border-violet-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                      item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {item.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{formatDateTime(item.date)}</p>
                      <h4 className={`text-sm font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.type === 'income' ? 'Entrada de Saldo' : 'Saída / Despesa'}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.type === 'income' ? '+' : '-'}{formatCurrencyBRL(item.amount)}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      Saldo: {formatCurrencyBRL(item.balance)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Recebido</span>
              <span className="text-sm font-black text-emerald-500">{formatCurrencyBRL(totalIncome)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Variação do Período</span>
              <div className={`flex items-center justify-end gap-1 text-sm font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {variation.toFixed(1)}%
              </div>
            </div>
          </div>
        </motion.section>
      )}

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

