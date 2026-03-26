import { formatCurrencyBRL, formatDate } from "@lib/finance-utils";
import { theme } from "@config/design-system";
import { getCategoryIcon } from "@lib/category-icons";

export default function TransactionItem({ transaction, onDelete, hideValues = false }) {
  const isExpense = transaction.type === "expense";
  const Icon = getCategoryIcon(transaction.category);

  return (
    <li className="flex items-center justify-between gap-3 py-3 border-b border-slate-200 dark:border-slate-800/40 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors px-2 rounded-xl group">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-lg shadow-inner ${
          isExpense ? "bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20" : "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
        }`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {transaction.name || "Transação"}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{transaction.category || "Sem categoria"}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right flex flex-col items-end">
          <span
            className={`text-sm font-black tracking-tight ${
              isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isExpense ? "-" : "+"} {formatCurrencyBRL(transaction.amount || 0, hideValues)}
          </span>
        </div>

        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
          title="Excluir transação"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}

