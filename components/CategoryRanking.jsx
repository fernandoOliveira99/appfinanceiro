"use client";

import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { Trophy } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

export default function CategoryRanking({ transactions }) {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  const byCategory = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
    return acc;
  }, {});

  const ranking = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const colors = [
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
  ];

  if (ranking.length === 0) return null;

  return (
    <section className={`${theme.cardStyles.base} rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-xl bg-white dark:bg-slate-900/80`}>
      <div className={`${theme.spacing.cardPadding} space-y-6`}>
        <div className="flex items-center justify-between">
          <h2 className={`${theme.typography.sectionTitle} flex items-center gap-2 text-slate-900 dark:text-white`}>
            <Trophy className="text-amber-500" size={20} />
            Ranking de Gastos
          </h2>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Top Categorias</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* List Ranking */}
          <div className="space-y-4">
            {ranking.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs border border-white/5 ${index === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-white transition-colors">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrencyBRL(item.value)}</span>
              </div>
            ))}
          </div>

          {/* Horizontal Chart */}
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranking} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid #1e293b', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value) => formatCurrencyBRL(value)}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {ranking.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
