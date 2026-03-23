"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";

export default function IncomeExpenseBarChart({ income, expenses, lastMonthIncome, lastMonthExpenses, hideValues = false }) {
  const data = [
    { 
      name: "Mês Anterior", 
      Receita: lastMonthIncome || 0, 
      Despesas: lastMonthExpenses || 0 
    },
    { 
      name: "Mês Atual", 
      Receita: income || 0, 
      Despesas: expenses || 0 
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="text-[10px] font-bold" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-xs font-black text-white">
                {formatCurrencyBRL(entry.value, hideValues)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Comparativo Mensal</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Receita</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Despesas</span>
          </div>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', className: 'text-slate-500 dark:text-slate-400', fontSize: 10, fontWeight: 700 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'currentColor', className: 'text-slate-500 dark:text-slate-400', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
            <Bar dataKey="Receita" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
            <Bar dataKey="Despesas" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
