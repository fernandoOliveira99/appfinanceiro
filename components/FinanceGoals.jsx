"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Calendar,
  X,
  ChevronRight,
  Trash2,
  Zap,
  MousePointer2,
  Sparkles,
  Edit2,
  Info,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CreateGoalModal from "./CreateGoalModal";

export default function FinanceGoals({ currentBalance = 0, onTransactionAdded }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalMode, setModalMode] = useState("add"); // "add" | "remove"
  const [amountValue, setAmountValue] = useState(0);
  const [amountDisplay, setAmountDisplay] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [contributionModes, setContributionModes] = useState({}); // { goalId: 'manual' | 'auto' }
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const tutorialSteps = [
    {
      title: "Crie um Cofrinho",
      description: "Crie uma conta poupança ou cofrinho no seu app do banco para separar o dinheiro das metas.",
      icon: <Target className="text-violet-500" />
    },
    {
      title: "Defina o Objetivo",
      description: "Pense no que você quer conquistar: um carro, uma viagem ou sua reserva de emergência.",
      icon: <Sparkles className="text-amber-500" />
    },
    {
      title: "Adicione no App",
      description: "Crie a meta aqui no Finanças App para acompanhar seu progresso visualmente.",
      icon: <Plus className="text-emerald-500" />
    },
    {
      title: "Acompanhe Semanalmente",
      description: "Atualize seus depósitos toda semana para manter a disciplina e ver o gráfico crescer.",
      icon: <TrendingUp className="text-sky-500" />
    }
  ];

  useEffect(() => {
    fetchGoals();
    const savedModes = localStorage.getItem('goal_contribution_modes');
    if (savedModes) {
      setContributionModes(JSON.parse(savedModes));
    }
  }, []);

  const toggleContributionMode = (goalId) => {
    const newModes = {
      ...contributionModes,
      [goalId]: contributionModes[goalId] === 'auto' ? 'manual' : 'auto'
    };
    setContributionModes(newModes);
    localStorage.setItem('goal_contribution_modes', JSON.stringify(newModes));
  };

  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      }
    } catch (err) {
      console.error("Failed to fetch goals", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteGoal = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.")) return;

    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setGoals(goals.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const numericValue = value ? parseInt(value) / 100 : 0;
    setAmountValue(numericValue);
    setAmountDisplay(
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(numericValue)
    );
  };

  const openActionModal = (goal, mode) => {
    setSelectedGoal(goal);
    setModalMode(mode);
    setAmountValue(0);
    setAmountDisplay("");
    setModalOpen(true);
  };

  const handleUpdateAmount = async (e) => {
    e.preventDefault();
    if (!selectedGoal || amountValue <= 0 || isUpdating) return;

    setIsUpdating(true);
    let newAmount = Number(selectedGoal.current_amount);
    
    if (modalMode === "add") {
      newAmount += Number(amountValue);
    } else {
      newAmount = Math.max(0, newAmount - Number(amountValue));
    }

    try {
      const res = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_amount: newAmount }),
      });

      if (res.ok) {
        const updatedGoal = await res.json();
        
        // Handle newly unlocked achievements from goal update
        if (updatedGoal.newlyUnlocked?.length > 0) {
          window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: updatedGoal.newlyUnlocked }));
        }
        
        // Criar transação para abater/devolver do saldo total PRIMEIRO
        if (onTransactionAdded) {
          const txData = {
            name: modalMode === "add" ? `Aplicação: ${selectedGoal.type}` : `Resgate: ${selectedGoal.type}`,
            amount: Number(amountValue),
            type: modalMode === "add" ? "expense" : "income",
            category: "Metas",
            date: new Date().toISOString().slice(0, 10)
          };
          console.log("Enviando transação de meta:", txData);
          await onTransactionAdded(txData);
        }

        // Somente depois atualiza a lista local de metas
        setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
        setModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update goal amount", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return "bg-rose-500";
    if (progress < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const calculateMonthlyNeeded = (remaining, deadline) => {
    if (!deadline || remaining <= 0) return null;
    const now = new Date();
    const targetDate = new Date(deadline);
    const diffMonths = (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth());
    
    const monthsRemaining = Math.max(1, diffMonths);
    return remaining / monthsRemaining;
  };

  const handleQuickContribution = async (goal, amount) => {
    if (isUpdating) return;
    setIsUpdating(true);
    const newAmount = Number(goal.current_amount) + amount;

    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_amount: newAmount }),
      });

      if (res.ok) {
        const updatedGoal = await res.json();

        // Criar transação automática de despesa para abater do saldo PRIMEIRO
        if (onTransactionAdded) {
          await onTransactionAdded({
            name: `Auto-Aplicação: ${goal.type}`,
            amount: Number(amount),
            type: "expense",
            category: "Metas",
            date: new Date().toISOString().slice(0, 10)
          });
        }

        // Somente depois atualiza a lista local de metas
        setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      }
    } catch (err) {
      console.error("Failed to quick contribute", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoalCreated = (data, isUpdate = false) => {
    if (isUpdate) {
      setGoals(goals.map(g => g.id === data.id ? data : g));
    } else {
      setGoals([...goals, data]);
    }
    setCreateModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <section id="goals-section" className={`${theme.cardStyles.base} rounded-3xl border border-slate-200 dark:border-slate-800/50 shadow-xl overflow-hidden flex flex-col h-[550px] bg-white dark:bg-slate-900/80`}>
      <CreateGoalModal 
        open={isCreateModalOpen} 
        initialData={editingGoal}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingGoal(null);
        }} 
        onGoalCreated={handleGoalCreated} 
      />

      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                      <Lightbulb size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Como poupar dinheiro</h3>
                  </div>
                  <button onClick={() => setShowTutorial(false)} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {tutorialSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 hover:border-amber-500/30 transition-colors group">
                      <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-inner border border-slate-800 group-hover:scale-110 transition-transform">
                        {step.icon}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-sm font-black text-white tracking-tight">{idx + 1}. {step.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowTutorial(false)}
                  className="w-full py-4 rounded-2xl bg-violet-600 text-white font-black uppercase tracking-widest hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/40"
                >
                  Entendi, vamos lá!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`${theme.spacing.cardPadding} border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20`}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500">
                <Target size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Minhas Metas</h2>
                  <div className="group relative">
                    <button 
                      className="text-slate-500 hover:text-violet-500 transition-colors p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Info size={14} />
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-56 p-3 bg-slate-900/95 backdrop-blur-md text-[11px] text-slate-200 rounded-2xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all pointer-events-none z-[100] border border-slate-700/50 shadow-2xl font-medium">
                      <p className="leading-relaxed">Defina objetivos de poupança, como uma viagem ou reserva de emergência, e acompanhe seu progresso.</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seus objetivos de economia</p>
              </div>
            </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
          >
            <Lightbulb size={14} />
            <span className="hidden sm:inline">Dicas</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="p-2 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all active:scale-95 shadow-lg shadow-violet-900/20"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Tip Bubble for Metas */}
      <div className="px-6 py-3 bg-indigo-500/5 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Sparkles size={14} className="text-indigo-500 animate-pulse" />
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
          Dica: Crie uma conta poupança separada para alcançar sua meta mais rápido!
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold uppercase tracking-widest">Carregando metas...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700">
              <Target size={40} />
            </div>
            <div>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Você ainda não definiu metas.</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Crie sua primeira meta para começar a poupar!</p>
            </div>
          </div>
        ) : (
          goals.map((goal) => {
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const isCompleted = progress >= 100;
              const monthlyNeeded = calculateMonthlyNeeded(remaining, goal.deadline);
              const isAutoMode = contributionModes[goal.id] === 'auto';
              
              // Lógica de sugestão automática: 50% do saldo restante se for positivo
              const suggestedAutoAmount = currentBalance > 0 ? Math.min(remaining, currentBalance * 0.5) : 0;

              return (
                <div key={goal.id} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/50 space-y-4 hover:border-violet-200 dark:hover:border-slate-700/50 transition-all group w-full">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                          {goal.type}
                        </h3>
                        {isCompleted && <CheckCircle2 className="text-emerald-500 shrink-0" size={14} />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                        <Calendar size={12} className="shrink-0" />
                        <span className="truncate">{goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                      </div>
                    </div>
                    
                    {/* Contribution Mode Selector */}
                    <button
                      onClick={() => toggleContributionMode(goal.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-tighter transition-all shrink-0 ${
                        isAutoMode 
                        ? 'bg-violet-500 border-violet-400 text-white shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {isAutoMode ? <Zap size={10} className="fill-white" /> : <MousePointer2 size={10} />}
                      {isAutoMode ? 'Automático' : 'Manual'}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate">Progresso</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white truncate">{formatCurrencyBRL(goal.current_amount)}</p>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 truncate">Meta</p>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{formatCurrencyBRL(goal.target_amount)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tighter">
                      <span className="text-violet-600 dark:text-violet-400">
                        {formatCurrencyBRL(remaining)} faltam
                      </span>
                      <span className="text-slate-500">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-3.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(progress)}`}
                      ></motion.div>
                    </div>
                  </div>

                  {/* Smart Suggestions & Auto Contributions */}
                  {!isCompleted && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          Faltam <span className="text-violet-600 dark:text-violet-400 font-bold">{formatCurrencyBRL(remaining)}</span>
                        </p>
                        {monthlyNeeded && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            Sugestão: <span className="text-slate-900 dark:text-slate-200">{formatCurrencyBRL(monthlyNeeded)}/mês</span>
                          </p>
                        )}
                      </div>

                      {isAutoMode && suggestedAutoAmount > 0 && (
                        <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-start gap-2">
                            <Sparkles size={14} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-[10px] text-violet-700 dark:text-violet-300 leading-relaxed font-bold uppercase tracking-wider">
                                Sugestão Inteligente
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-snug">
                                Você terminou o mês com <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyBRL(currentBalance)}</span> sobrando. Deseja acelerar esta meta?
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickContribution(goal, suggestedAutoAmount)}
                            disabled={isUpdating}
                            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-violet-900/20 flex items-center justify-center gap-2"
                          >
                            Adicionar {formatCurrencyBRL(suggestedAutoAmount)} agora
                          </button>
                        </div>
                      )}

                      {!isAutoMode && monthlyNeeded && (
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2">
                          <AlertCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Considere mudar para o <span className="font-bold text-violet-600 dark:text-violet-400">Modo Automático</span> para receber sugestões de contribuição baseadas no seu saldo.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {isCompleted && (
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center gap-2">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Meta concluída 🎉</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 dark:border-rose-500/20"
                      title="Excluir Meta"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setCreateModalOpen(true);
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-violet-600 hover:text-white transition-all border border-slate-100 dark:border-slate-700"
                      title="Editar Meta"
                    >
                      <Edit2 size={16} />
                    </button>
                    {!isAutoMode && (
                      <>
                        <button
                          onClick={() => openActionModal(goal, "add")}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-violet-900/10"
                        >
                          <Plus size={14} />
                          Adicionar
                        </button>
                        <button
                          onClick={() => openActionModal(goal, "remove")}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          <Minus size={14} />
                          Remover
                        </button>
                      </>
                    )}
                    {isAutoMode && (
                      <p className="flex-1 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        Modo Automático Ativo
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      {/* Mini Modal for Add/Remove Money */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  {modalMode === "add" ? <Plus size={16} className="text-emerald-500" /> : <Minus size={16} className="text-rose-500" />}
                  {modalMode === "add" ? "Adicionar Saldo" : "Remover Saldo"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedGoal?.type}</p>
                <p className="text-xl font-black text-white">{formatCurrencyBRL(selectedGoal?.current_amount || 0)}</p>
              </div>

              <form onSubmit={handleUpdateAmount} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Valor</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="R$ 0,00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    required
                  />
                </div>
                <button
                  disabled={isUpdating}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    modalMode === "add" 
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20"
                  } disabled:opacity-50`}
                >
                  {isUpdating ? "Processando..." : "Confirmar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
