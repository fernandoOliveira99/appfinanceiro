"use client";

import { theme } from "@config/design-system";
import { AlertCircle, TrendingUp, TrendingDown, Lightbulb, CheckCircle2 } from "lucide-react";
import { calculateTotals } from "@lib/finance-utils";

export default function FinancialInsightsCard({ transactions }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const currentExpenses = currentMonthTx.filter(t => t.type === "expense");
  const lastExpenses = lastMonthTx.filter(t => t.type === "expense");

  const { totalExpenses: currentTotal, byCategory: currentByCat } = calculateTotals(currentExpenses);
  const { totalExpenses: lastTotal, byCategory: lastByCat } = calculateTotals(lastExpenses);

  const totalIncomeAllTime = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpensesAllTime = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
  const totalBalance = totalIncomeAllTime - totalExpensesAllTime;

  const insights = [];

  // Alerta de Saldo Negativo (Prioridade Máxima)
  if (totalBalance < 0) {
    insights.push({
      text: `Seu saldo total está negativo em ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(totalBalance))}. Atenção redobrada!`,
      type: "danger",
      icon: AlertCircle
    });
  }

  // Alerta de ritmo de gastos vs saldo do mês
  const currentIncome = currentMonthTx.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
  if (currentTotal > currentIncome) {
    insights.push({
      text: currentIncome > 0 
        ? "Você já gastou mais do que recebeu este mês. Tente segurar os gastos."
        : "Você ainda não registrou receitas este mês, mas já possui despesas.",
      type: "danger",
      icon: AlertCircle
    });
  }

  // Alerta por categoria (ex: Alimentação)
  const foodCategory = "Alimentação";
  if (currentByCat[foodCategory] > (lastByCat[foodCategory] || 0) * 1.2 && currentByCat[foodCategory] > 100) {
    insights.push({
      text: `Seus gastos com ${foodCategory} aumentaram mais de 20% em relação ao mês passado.`,
      type: "warning",
      icon: TrendingUp
    });
  }

  // Alerta de lazer
  const leisureCategory = "Lazer";
  if (currentByCat[leisureCategory] > (lastByCat[leisureCategory] || 0) && currentByCat[leisureCategory] > 0) {
    insights.push({
      text: "Seu gasto com lazer aumentou em comparação ao mês passado.",
      type: "warning",
      icon: TrendingUp
    });
  }

  // Alerta saudável
  if (currentTotal < lastTotal * 0.9 && lastTotal > 0) {
    insights.push({
      text: "Parabéns! Seus gastos estão 10% menores que no mês passado.",
      type: "success",
      icon: Lightbulb
    });
  }

  if (insights.length === 0) {
    if (totalBalance > 0 && currentTotal < currentIncome) {
      insights.push({
        text: "Suas finanças estão excelentes! Saldo positivo e gastos sob controle.",
        type: "success",
        icon: CheckCircle2
      });
    } else {
      insights.push({
        text: "Continue acompanhando suas movimentações para manter o equilíbrio.",
        type: "success",
        icon: CheckCircle2
      });
    }
  }

  const getTypeStyles = (type) => {
    switch (type) {
      case "danger": return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "warning": return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "success": return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
      default: return "bg-slate-500/10 border-slate-500/20 text-slate-400";
    }
  };

  return (
    <section className={`${theme.cardStyles.base} rounded-3xl overflow-hidden border border-slate-800/50 shadow-xl`}>
      <div className={`${theme.spacing.cardPadding} space-y-4`}>
        <h2 className={`${theme.typography.sectionTitle} flex items-center gap-2`}>
          <Lightbulb className="text-amber-500" size={20} />
          Insights Financeiros
        </h2>
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${getTypeStyles(insight.type)}`}>
                <Icon size={18} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
