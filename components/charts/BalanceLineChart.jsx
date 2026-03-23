"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart
} from "recharts";
import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";

export default function BalanceLineChart({ transactions, hideValues = false }) {
  // Processa dados para saldo acumulado ao longo do tempo
  const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let currentBalance = 0;
  const chartData = sortedTransactions.map(t => {
    if (t.type === 'income') currentBalance += Number(t.amount);
    else currentBalance -= Number(t.amount);
    
    return {
      date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      balance: currentBalance
    };
  });

  return (
    <section className={theme.cardStyles.base}>
      <div className={`${theme.spacing.cardPadding} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className={theme.typography.sectionTitle}>Evolução do Saldo</h2>
          <span className={`${theme.typography.badge} ${theme.colors.textMuted}`}>
            Tendência acumulada
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-600" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="currentColor"
                className="text-slate-400 dark:text-slate-600" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => hideValues ? "R$ •••" : `R$ ${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "#fff"
                }}
                itemStyle={{ color: "#fff" }}
                formatter={(value) => [formatCurrencyBRL(value, hideValues), "Saldo"]}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
