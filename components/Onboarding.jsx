"use client";

import { useState, useEffect } from "react";
import { theme } from "@config/design-system";
import { X, ChevronRight, PartyPopper, LayoutDashboard, PlusCircle, MinusCircle, PieChart, Check } from "lucide-react";
import { useSession } from "next-auth/react";

const STEPS = [
  {
    id: "welcome",
    title: "🎉 Bem-vindo ao App Finanças!",
    description: "Este sistema ajuda você a organizar suas finanças pessoais de forma simples e inteligente.",
    icon: PartyPopper,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    type: "modal" // Mensagem de boas-vindas inicial
  },
  {
    id: "dashboard",
    title: "Seu Painel de Controle",
    description: "Acompanhe seu saldo total, previsões para o fim do mês e o progresso das suas metas em tempo real nesta tela principal.",
    icon: LayoutDashboard,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    type: "tutorial"
  },
  {
    id: "add-income",
    title: "Como Adicionar Dinheiro",
    description: "Clique no botão '+ Dinheiro' no topo para registrar seus ganhos. O sistema simplifica o processo pedindo apenas o valor.",
    icon: PlusCircle,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    type: "tutorial"
  },
  {
    id: "add-expense",
    title: "Como Adicionar Despesas",
    description: "Use o botão '- Despesa' para registrar gastos. Categorize cada um para ter uma visão clara de onde seu dinheiro está indo.",
    icon: MinusCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    type: "tutorial"
  },
  {
    id: "reports",
    title: "Página de Relatórios",
    description: "Acesse a página de Relatórios para ver gráficos detalhados por categoria e a evolução do seu saldo ao longo do tempo.",
    icon: PieChart,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    type: "tutorial"
  }
];

export default function Onboarding({ forceShow = false }) {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setShow(true);
      return;
    }
    if (session?.user?.email) {
      const storageKey = `has_seen_tutorial_${session.user.email}`;
      const hasSeen = localStorage.getItem(storageKey);
      if (!hasSeen) {
        setShow(true);
      }
    }
  }, [session, forceShow]);

  const handleFinish = () => {
    if (session?.user?.email) {
      const storageKey = `has_seen_tutorial_${session.user.email}`;
      localStorage.setItem(storageKey, "true");
    }
    setShow(false);
  };

  const nextStep = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  if (!show) return null;

  const current = STEPS[step];
  const Icon = current.icon;
  const isFirstStep = step === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        {/* Background Decorative Glow */}
        <div className={`absolute -top-20 -right-20 w-64 h-64 ${current.bg.replace('/10', '/5')} rounded-full blur-[100px] transition-colors duration-700`}></div>
        
        <div className="p-8 md:p-12 space-y-8 relative z-10">
          <div className="flex justify-between items-start">
            <div className={`h-20 w-20 rounded-[2rem] ${current.bg} flex items-center justify-center ${current.color} shadow-inner border border-white/5`}>
              <Icon size={40} className="animate-pulse" />
            </div>
            {!isFirstStep && (
              <button onClick={handleFinish} className="p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
          </div>

          <div className="space-y-4 min-h-[160px]">
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {current.title}
            </h2>
            <p className="text-base text-slate-400 font-medium leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === step ? `w-10 ${current.bg.replace('/10', '')}` : i < step ? "w-2 bg-emerald-500/50" : "w-2 bg-slate-800"
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isFirstStep ? (
              <>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-5 rounded-3xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/30 active:scale-95"
                >
                  Começar
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-5 rounded-3xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold transition-all border border-slate-700/30"
                >
                  Ver tutorial
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 py-5 rounded-3xl bg-violet-600 hover:bg-violet-500 text-white font-black transition-all shadow-xl shadow-violet-900/30 active:scale-95"
                >
                  {step === STEPS.length - 1 ? "Entendido!" : "Próximo"}
                  {step === STEPS.length - 1 ? <Check size={20} /> : <ChevronRight size={20} />}
                </button>
                {step < STEPS.length - 1 && (
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-5 rounded-3xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white font-bold transition-all"
                  >
                    Pular tutorial
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
