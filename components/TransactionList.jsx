import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { Trash2, Edit2 } from "lucide-react";
import { formatDate } from "@lib/finance-utils";

export default function TransactionList({ title, transactions, onDeleted, onEdit, hideValues = false, selectedDate = new Date() }) {
  const [searchTerm, setSearchString] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'income' | 'expense'
  const [timeFilter, setTimeFilter] = useState("month"); // 'month' | 'all'
  
  // Estado local para o mês e ano selecionados no filtro manual da lista
  const [localSelectedMonth, setLocalSelectedMonth] = useState(selectedDate.getMonth());
  const [localSelectedYear, setLocalSelectedYear] = useState(selectedDate.getFullYear());

  // Atualiza o filtro local quando o dashboard muda a data global
  useEffect(() => {
    setLocalSelectedMonth(selectedDate.getMonth());
    setLocalSelectedYear(selectedDate.getFullYear());
  }, [selectedDate]);

  const filteredTransactions = transactions.filter(tx => {
    const name = tx.name || tx.description || "";
    const category = tx.category || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || tx.type === filter;
    
    // Filtro de tempo
    let matchesTime = true;
    if (timeFilter === "month") {
      const txDate = new Date(tx.date || tx.created_at);
      matchesTime = txDate.getMonth() === localSelectedMonth && 
                    txDate.getFullYear() === localSelectedYear;
    }
    
    return matchesSearch && matchesFilter && matchesTime;
  });

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Gera uma lista de anos (do ano atual até 2 anos atrás)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const formatCurrencyBRL = (value) => {
    if (hideValues) return "R$ ••••••";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  async function deleteTransaction(id) {
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE"
    });
    if (res.ok && onDeleted) {
      onDeleted(id);
    }
  }

  return (
    <section id="transaction-list" className={`${theme.cardStyles.base} rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-xl bg-white dark:bg-slate-900/80`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className={`${theme.typography.sectionTitle} text-slate-900 dark:text-white`}>
              {title}
            </h2>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {filteredTransactions.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Time Filter Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto">
                {[
                  { id: 'month', label: 'Filtrar por Mês' },
                  { id: 'all', label: 'Todos os Meses' }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      timeFilter === tf.id 
                      ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-white shadow-sm' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {timeFilter === 'month' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 w-full sm:w-auto">
                  <select
                    value={localSelectedMonth}
                    onChange={(e) => setLocalSelectedMonth(parseInt(e.target.value))}
                    className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-violet-500/50"
                  >
                    {months.map((m, i) => (
                      <option key={m} value={i}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={localSelectedYear}
                    onChange={(e) => setLocalSelectedYear(parseInt(e.target.value))}
                    className="flex-1 sm:flex-none bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-violet-500/50"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Buscar transação..."
                value={searchTerm}
                onChange={(e) => setSearchString(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-violet-500/50 transition-all pl-9"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl w-full sm:w-auto">
              {[
                { id: 'all', label: 'Tudo' },
                { id: 'income', label: 'Entradas' },
                { id: 'expense', label: 'Saídas' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    filter === f.id 
                    ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-white shadow-sm' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm font-medium">
              Nenhuma transação encontrada.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 hover:border-violet-200 dark:hover:border-slate-700/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-inner ${
                    tx.type === 'income' 
                    ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                    : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{tx.name || tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{tx.category}</span>
                      <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrencyBRL(tx.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => onEdit && onEdit(tx)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-sm"
                      title="Editar"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
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
      </div>
    </section>
  );
}

