"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { theme } from "@config/design-system";

const CATEGORY_COLORS = {
  Moradia: "#ef4444", // red
  Aluguel: "#b91c1c",
  Supermercado: "#22c55e", // green
  Transporte: "#3b82f6", // blue
  Lazer: "#eab308", // yellow
  Saúde: "#a855f7", // purple
  Educação: "#f97316", // orange
  Investimentos: "#14b8a6",
  Outros: "#64748b"
};

const FALLBACK_COLORS = ["#a855f7", "#38bdf8", "#22c55e", "#f97316", "#e11d48", "#eab308", "#14b8a6"];

export default function CategoryPieChart({ data, hideValues = false }) {
  // Debug log para ver os dados que estão chegando
  console.log("Pie Chart Data:", data);

  // Converte o objeto data em array e garante que os valores sejam números
  const chartData = Object.entries(data || {})
    .map(([name, value]) => ({
      name,
      value: Number(value)
    }))
    .filter(item => item.value > 0);

  console.log("Processed Chart Data:", chartData);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2 w-full bg-slate-900/10 rounded-2xl">
        <p className="text-xs font-black uppercase tracking-widest opacity-50">Sem despesas registradas</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 relative">
      <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={5}
            stroke="none"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => {
              const color = CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
              return <Cell key={`cell-${entry.name}`} fill={color} />;
            })}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12,
              fontSize: 11,
              color: "#fff"
            }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [formatCurrencyBRL(value, hideValues), "Gasto"]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-tighter">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

