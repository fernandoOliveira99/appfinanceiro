"use client";

import { useState } from "react";
import { theme } from "@config/design-system";
import CategoryPieChart from "@components/charts/CategoryPieChart";
import IncomeExpenseBarChart from "@components/charts/IncomeExpenseBarChart";

export default function Charts({ categoryData, income, expenses, lastMonthIncome, lastMonthExpenses, hideValues = false }) {
  const [chartType, setChartType] = useState("pie"); // pie | bar | pyramid

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return <div id="category-pie-chart"><CategoryPieChart data={categoryData} hideValues={hideValues} /></div>;
      case "bar":
        return (
          <div id="income-expense-bar-chart">
            <IncomeExpenseBarChart 
              income={income} 
              expenses={expenses} 
              lastMonthIncome={lastMonthIncome}
              lastMonthExpenses={lastMonthExpenses}
              hideValues={hideValues}
            />
          </div>
        );
      case "pyramid":
        return (
          <div id="income-expense-pyramid-chart">
            <IncomeExpenseBarChart 
              income={income} 
              expenses={expenses} 
              lastMonthIncome={lastMonthIncome}
              lastMonthExpenses={lastMonthExpenses}
              hideValues={hideValues}
            />
          </div>
        );
      default:
        return <div id="category-pie-chart"><CategoryPieChart data={categoryData} /></div>;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 h-full">
      <section className={`${theme.cardStyles.base} rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800/50 shadow-xl bg-white dark:bg-slate-900/80`}>
        <div className={`${theme.spacing.cardPadding} space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className={`${theme.typography.sectionTitle} flex items-center gap-2 text-slate-900 dark:text-white`}>
              Visão Geral
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
              {[
                { label: 'Pizza', value: 'pie' },
                { label: 'Pirâmide', value: 'pyramid' }
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setChartType(t.value)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    chartType === t.value 
                    ? 'bg-violet-600 text-white shadow-lg' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[300px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/30">
            {renderChart()}
          </div>
        </div>
      </section>
    </div>
  );
}
