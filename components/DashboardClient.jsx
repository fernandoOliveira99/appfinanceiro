"use client";

import { useEffect, useState } from "react";
import { theme } from "@config/design-system";
import FinanceCards from "@components/FinanceCards";
import TransactionList from "@components/TransactionList";
import { calculateTotals } from "@lib/finance-utils";
import Charts from "@components/Charts";
import TransactionModal from "@components/TransactionModal";
import FinanceAI from "@components/FinanceAI";
import FinanceGoals from "@components/FinanceGoals";
import DashboardHeader from "@components/DashboardHeader";
import GuidedTutorial from "@components/GuidedTutorial";
import FinancialInsightsCard from "@components/FinancialInsightsCard";
import IntelligentInsights from "@components/IntelligentInsights";
import CategoryRanking from "@components/CategoryRanking";
import FinancialHealthScore from "@components/FinancialHealthScore";
import UpcomingBills from "@components/UpcomingBills";
import CategoryBudgets from "@components/CategoryBudgets";
import ReportExporter from "@components/ReportExporter";
import RecurringTransactionsManager from "@components/RecurringTransactionsManager";
import WelcomeExperience from "@components/WelcomeExperience";
import SmartTips from "@components/SmartTips";
import { generateDashboardReport } from "@lib/report";
import { Zap, Plus, ArrowUpCircle, ArrowDownCircle, Target, PieChart, Smile, Sparkles, CalendarClock, Sliders } from "lucide-react";
import { personalities } from "@lib/personalities";
import { AnimatePresence } from "framer-motion";

export default function DashboardClient({ user, initialSalary, initialTransactions }) {
  const [salary, setSalary] = useState(initialSalary ?? 0);
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [goals, setGoals] = useState([]);
  const [month, setMonth] = useState("Mês atual");
  const [downloading, setDownloading] = useState(false);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'income' | 'expense' | null
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [economyMode, setEconomyMode] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'budgets' | 'goals' | 'analysis' | 'recurring'
  const [showWelcome, setShowWelcome] = useState(false);
  const [forceShowTutorial, setForceShowTutorial] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [hideValues, setHideValues] = useState(false);

  useEffect(() => {
    // Carrega preferências de dicas e ocultação de valores
    const savedTips = localStorage.getItem('show_smart_tips') === 'true';
    const savedHide = localStorage.getItem('hide_dashboard_values') === 'true';
    setShowTips(savedTips);
    setHideValues(savedHide);

    const handleToggleTips = (e) => {
      setShowTips(e.detail);
    };
    window.addEventListener('toggle-smart-tips', handleToggleTips);
    return () => window.removeEventListener('toggle-smart-tips', handleToggleTips);
  }, []);

  const toggleHideValues = () => {
    const newValue = !hideValues;
    setHideValues(newValue);
    localStorage.setItem('hide_dashboard_values', String(newValue));
    // Dispara evento para outros componentes se necessário
    window.dispatchEvent(new CustomEvent('toggle-values', { detail: newValue }));
  };

  const [mascotId, setMascotId] = useState("goku");

  useEffect(() => {
    // Carrega mascote salvo
    const savedMascot = localStorage.getItem(`user_mascot_${user?.id || 'guest'}`);
    if (savedMascot) setMascotId(savedMascot);

    const handleMascotChange = (e) => setMascotId(e.detail);
    window.addEventListener('mascot-changed', handleMascotChange);
    return () => window.removeEventListener('mascot-changed', handleMascotChange);
  }, [user]);

  useEffect(() => {
    // Escuta evento customizado para reiniciar tutorial
    const handleRestart = () => {
      setShowWelcome(true);
      setForceShowTutorial(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('restart-tutorial', handleRestart);
    
    // Verifica se veio via URL parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('restartTutorial') === 'true') {
      setForceShowTutorial(true);
      // Limpa a URL sem recarregar
      window.history.replaceState({}, '', '/dashboard');
    }

    return () => {
      window.removeEventListener('restart-tutorial', handleRestart);
    };
  }, []);

  useEffect(() => {
    const finishedWelcome = localStorage.getItem(`finished_welcome_${user?.id || 'guest'}`) === 'true';
    if (user?.first_login) {
      setShowWelcome(true);
    } else if (!finishedWelcome) {
      // Se não terminou as boas-vindas, mostra
      setShowWelcome(true);
    } else {
      // Força a exibição para teste se o usuário acabou de registrar e caiu aqui
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true') {
        setShowWelcome(true);
      }
    }
  }, [user]);

  const handleFinishWelcome = async (startTutorial = false) => {
    try {
      await fetch("/api/user/first-login", { method: "POST" });
      localStorage.setItem(`finished_welcome_${user?.id || 'guest'}`, 'true');
      setShowWelcome(false);
      if (startTutorial) {
        setForceShowTutorial(true);
      }
    } catch (error) {
      console.error("Error updating first login:", error);
      setShowWelcome(false);
    }
  };

  useEffect(() => {
    async function refresh() {
      const [txRes, salaryRes, catChartRes, goalsRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/settings/salary"),
        fetch("/api/charts/categories"),
        fetch("/api/goals")
      ]);
      if (txRes.ok) {
        setTransactions(await txRes.json());
      }
      if (salaryRes.ok) {
        const data = await salaryRes.json();
        setSalary(data.salary ?? 0);
      }
      if (catChartRes.ok) {
        const catData = await catChartRes.json();
        setCategoryChartData(catData);
      }
      if (goalsRes.ok) {
        setGoals(await goalsRes.json());
      }
    }
    refresh();
  }, []);

  // 1. Receitas: Tudo que entra no saldo (Salário + Resgates de Metas)
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const totalIncome = incomeTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 2. Despesas Reais: Gastos do dia a dia (NÃO inclui dinheiro guardado em metas)
  const realExpensesTransactions = transactions.filter((t) => t.type === "expense" && t.category !== "Metas");
  const { totalExpenses, byCategory } = calculateTotals(realExpensesTransactions);

  // 3. Contribuições para Metas: Dinheiro que saiu do saldo para ser guardado
  const goalContributionsTransactions = transactions.filter((t) => t.type === "expense" && t.category === "Metas");
  const totalGoalContributions = goalContributionsTransactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 4. Saldo Atual: Receitas - (Despesas + Metas)
  const currentBalance = totalIncome - totalExpenses - totalGoalContributions;

  const today = new Date();

  // --- Last Month Comparison ---
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const lastMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date || t.created_at);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  });

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Metas')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  // --- Real Previous Balance (Balance before the very last transaction) ---
  const lastTransaction = transactions[0];
  let balanceBeforeLast = currentBalance;
  let lastMovementDate = null;

  if (lastTransaction) {
    const amount = Number(lastTransaction.amount) || 0;
    if (lastTransaction.type === 'income') {
      balanceBeforeLast = currentBalance - amount;
    } else {
      balanceBeforeLast = currentBalance + amount;
    }
    // Prioritize created_at to get the exact time of the transaction
    lastMovementDate = lastTransaction.created_at 
      ? new Date(lastTransaction.created_at) 
      : new Date(lastTransaction.date);
  }

  // --- Real Balance History (Cumulative) ---
  const balanceHistory = [];
  let runningBalance = 0;
  // Use reverse copy to calculate chronologically
  [...transactions].reverse().forEach(t => {
    const amount = Number(t.amount) || 0;
    if (t.type === 'income') {
      runningBalance += amount;
    } else {
      runningBalance -= amount;
    }
    balanceHistory.unshift({
      date: t.created_at || t.date,
      balance: runningBalance,
      type: t.type,
      amount: amount,
      category: t.category
    });
  });

  const recentBalanceHistory = balanceHistory.slice(0, 5);

  const recent = transactions.slice(0, 8);
  
  // --- Previsão de Saldo (Forecast) ---
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate();
  
  // Cálculo da média de gastos diários (baseado nos dias decorridos do mês atual)
  const currentDay = today.getDate() || 1;
  const averageDailySpending = totalExpenses / currentDay;
  const estimatedEndBalance = currentBalance - (averageDailySpending * daysRemaining);

  async function handleSaveTransaction(tx) {
    const isUpdate = Boolean(tx.id);
    const url = isUpdate ? `/api/transactions/${tx.id}` : "/api/transactions";
    const method = isUpdate ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx)
    });

    if (res.ok) {
      const saved = await res.json();
      
      if (isUpdate) {
        setTransactions((prev) => prev.map(t => t.id === saved.id ? saved : t));
      } else {
        setTransactions((prev) => [saved, ...prev]);
      }
      
      // Refresh category data for charts
      const catChartRes = await fetch("/api/charts/categories");
      if (catChartRes.ok) {
        setCategoryChartData(await catChartRes.json());
      }
      setEditingTransaction(null);
      setModalMode(null);
    }
  }

  async function handleDownloadReport() {
    setDownloading(true);
    try {
      generateDashboardReport({
        monthLabel: month,
        salary,
        incomeTotal: totalIncome,
        expenseTotal: totalExpenses,
        transactions
      });
    } finally {
      setDownloading(false);
    }
  }

  const isEmpty = salary === 0 && transactions.length === 0;

  function handleDeleted(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden md:overflow-visible space-y-6 md:space-y-8 pb-32 md:pb-8 relative">
      <AnimatePresence>
        {showWelcome && (
          <WelcomeExperience 
            user={user}
            onStartTutorial={() => handleFinishWelcome(true)} 
            onSkip={() => handleFinishWelcome(false)} 
          />
        )}
      </AnimatePresence>

      <GuidedTutorial 
        run={forceShowTutorial} 
        onFinish={() => setForceShowTutorial(false)} 
        setActiveTab={setActiveTab}
      />
      
      <DashboardHeader 
        user={user} 
        onAddIncome={() => setModalMode("income")} 
        onAddExpense={() => setModalMode("expense")} 
        hideValues={hideValues}
        onToggleHideValues={toggleHideValues}
      />

      {/* Economy Mode Toggle - Hidden in 'Goals' and 'Analysis' on Mobile */}
      <div className={`${activeTab !== 'overview' ? 'hidden md:flex' : 'flex'} items-center justify-end gap-3 md:gap-4`}>
        <button
          onClick={() => setEconomyMode(!economyMode)}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${economyMode ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-900/10' : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm hover:shadow-md'}`}
        >
          <Zap size={18} className={economyMode ? 'fill-emerald-500 dark:fill-emerald-400' : ''} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {economyMode ? 'Modo Economia Ativo' : 'Ativar Modo Economia'}
          </span>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${economyMode ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${economyMode ? 'left-6' : 'left-1'}`} />
          </div>
        </button>
      </div>

      {/* 1. TOP SECTION: Cards (Summary & Prediction) - Always shown in overview, hidden in other tabs on mobile */}
      <div className={`${activeTab !== 'overview' ? 'hidden md:grid' : 'grid'} grid-cols-1 lg:grid-cols-4 gap-6`}>
        {showTips && (
          <div className="lg:col-span-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <SmartTips mascotId={mascotId} />
          </div>
        )}
        <div className="lg:col-span-3">
          <FinanceCards 
            salary={salary} 
            totalExpenses={totalExpenses} 
            totalIncome={totalIncome} 
            currentBalance={currentBalance}
            forecastBalance={estimatedEndBalance}
            previousBalance={balanceBeforeLast}
            lastMovementDate={lastMovementDate}
            onAddIncome={() => setModalMode("income")}
            onAddExpense={() => setModalMode("expense")}
            transactions={transactions}
            balanceHistory={recentBalanceHistory}
            hideValues={hideValues}
          />
        </div>
        <div>
          <FinancialHealthScore transactions={transactions} goals={goals} />
        </div>
      </div>

      {/* 2. INTELLIGENT INSIGHTS (Suspicious Spending & Economy Tips) - Overview and Analysis Tabs on Mobile */}
      <div className={`${(activeTab !== 'analysis' && activeTab !== 'overview') ? 'hidden md:grid' : 'grid'} grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full max-w-full overflow-hidden`}>
        <IntelligentInsights transactions={transactions} economyMode={economyMode} />
        <UpcomingBills />
      </div>

      {/* Upcoming Bills in Overview on Mobile */}
      <div className={`${activeTab === 'overview' ? 'block md:hidden' : 'hidden'}`}>
        <UpcomingBills />
      </div>

      {/* 3. ALERTS SECTION - Analysis Tab on Mobile */}
      <div className={`${activeTab !== 'analysis' ? 'hidden md:block' : 'block'}`}>
        <FinancialInsightsCard transactions={transactions} />
      </div>

      {/* 4. CATEGORY RANKING & BUDGETS - Analysis and Budgets Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`${activeTab !== 'analysis' ? 'hidden md:block' : 'block'}`}>
          <CategoryRanking transactions={transactions} />
        </div>
        <div className={`${activeTab !== 'budgets' ? 'hidden md:block' : 'block'}`}>
          <CategoryBudgets transactions={transactions} />
        </div>
      </div>

      {/* 5. MIDDLE SECTION: Charts & Goals Progress - Analysis and Goals Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`${activeTab !== 'analysis' ? 'hidden md:block' : 'block'} lg:col-span-2`}>
          <Charts 
            categoryData={categoryChartData ?? byCategory} 
            income={totalIncome} 
            expenses={totalExpenses} 
            lastMonthIncome={lastMonthIncome}
            lastMonthExpenses={lastMonthExpenses}
            hideValues={hideValues}
          />
        </div>
        <div className={`${activeTab !== 'goals' ? 'hidden md:block' : 'block'} space-y-8`}>
          <FinanceGoals 
            currentBalance={currentBalance} 
            onTransactionAdded={handleSaveTransaction} 
            hideValues={hideValues}
          />
        </div>
      </div>

      {/* Recurring Transactions Manager - Only on 'Recurring' Tab for mobile, visible on desktop */}
      <div className={`${activeTab !== 'recurring' ? 'hidden md:block' : 'block'}`}>
        <RecurringTransactionsManager transactions={transactions} hideValues={hideValues} />
      </div>

      {/* 4. BOTTOM SECTION: Recent transactions list - Overview Tab on Mobile */}
      <div className={`${activeTab !== 'overview' ? 'hidden md:block' : 'block'}`}>
        <TransactionList 
          title="Movimentações Recentes" 
          transactions={recent} 
          onDeleted={handleDeleted}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setModalMode(tx.type);
          }}
          hideValues={hideValues}
        />
      </div>

      {/* Export Section */}
      <ReportExporter 
        transactions={transactions} 
        user={user} 
        balance={currentBalance} 
        income={totalIncome} 
        expenses={totalExpenses} 
      />

      {/* Transaction Modal */}
      <TransactionModal
        open={Boolean(modalMode)}
        mode={modalMode}
        initialData={editingTransaction}
        onClose={() => {
          setModalMode(null);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
      />

      {/* Segmented Control Tabs (App Style) - Fixed at bottom for mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] pointer-events-none transform-gpu">
        <div className="px-2 pb-6 pt-10 bg-gradient-to-t from-white dark:from-slate-950 via-white/90 dark:via-slate-950/90 to-transparent">
          <div id="mobile-tabs" className="flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] pointer-events-auto max-w-[calc(100vw-1rem)] mx-auto">
            {[
              { id: 'overview', label: 'Início', icon: <Zap size={14} /> },
              { id: 'budgets', label: 'Controle', icon: <Sliders size={14} /> },
              { id: 'goals', label: 'Objetivos', icon: <Target size={14} /> },
              { id: 'analysis', label: 'Análise', icon: <PieChart size={14} /> },
              { id: 'recurring', label: 'Contas Mensais', icon: <CalendarClock size={14} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[8px] xs:text-[9px] font-black uppercase tracking-tighter transition-all ${
                  activeTab === tab.id 
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20 scale-105' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                <span className="truncate w-full px-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Financial Assistant - Fixed Side */}
      <FinanceAI user={user} mascotId={mascotId} setMascotId={setMascotId} />
    </div>
  );
}
