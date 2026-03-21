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

export default function CategoryPieChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <section className={theme.cardStyles.base}>
      <div className={`${theme.spacing.cardPadding} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className={theme.typography.sectionTitle}>Despesas por categoria</h2>
          <span className={`${theme.typography.badge} ${theme.colors.textMuted}`}>
            Distribuição por categoria
          </span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {chartData.map((entry, index) => {
                  const color = CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
                  return <Cell key={`cell-${entry.name}`} fill={color} />;
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(148,163,184,0.6)",
                  borderRadius: 12,
                  fontSize: 12
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "#e5e7eb", fontSize: 11 }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

