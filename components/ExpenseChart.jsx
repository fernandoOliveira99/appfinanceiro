"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import { theme } from "@config/design-system";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const palette = [
  "#a855f7",
  "#38bdf8",
  "#22c55e",
  "#f97316",
  "#e11d48",
  "#eab308",
  "#14b8a6"
];

export default function ExpenseChart({
  title,
  byCategory,
  type = "pie",
  labels,
  values
}) {
  const isPie = type === "pie";

  const dataLabels =
    labels ||
    (byCategory ? Object.keys(byCategory) : []);
  const dataValues =
    values ||
    (byCategory ? Object.values(byCategory) : []);

  const chartData = {
    labels: dataLabels,
    datasets: [
      {
        label: "Despesas",
        data: dataValues,
        backgroundColor: dataLabels.map(
          (_, index) => palette[index % palette.length] + "AA"
        ),
        borderColor: dataLabels.map(
          (_, index) => palette[index % palette.length]
        ),
        borderWidth: 1.5,
        tension: 0.3,
        fill: true,
        pointRadius: 3
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#e5e7eb",
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(15,23,42,0.95)",
        borderColor: "rgba(148,163,184,0.6)",
        borderWidth: 1
      }
    },
    scales: !isPie
      ? {
          x: {
            ticks: { color: "#9ca3af", font: { size: 11 } },
            grid: { color: "rgba(30,64,175,0.15)" }
          },
          y: {
            ticks: { color: "#9ca3af", font: { size: 11 } },
            grid: { color: "rgba(30,64,175,0.15)" }
          }
        }
      : undefined
  };

  return (
    <section className={theme.cardStyles.base}>
      <div className={`${theme.spacing.cardPadding} space-y-4`}>
        <div className="flex items-center justify-between">
          <h2 className={theme.typography.sectionTitle}>{title}</h2>
          <span className={`${theme.typography.badge} ${theme.colors.textMuted}`}>
            {isPie ? "Distribuição por categoria" : "Evolução mensal"}
          </span>
        </div>
        <div className="h-64">
          {isPie ? <Pie data={chartData} options={options} /> : <Line data={chartData} options={options} />}
        </div>
      </div>
    </section>
  );
}

