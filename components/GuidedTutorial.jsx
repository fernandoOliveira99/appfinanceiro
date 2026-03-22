"use client";

import { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import { theme } from "@config/design-system";
import { X } from "lucide-react";

const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep
}) => (
  <div {...tooltipProps} className="bg-slate-900 border border-white/10 rounded-[2rem] p-5 shadow-2xl w-[280px] xs:w-[320px] sm:w-[380px] text-left">
    <div className="flex justify-between items-center mb-4">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
        Tutorial • Passo {index + 1}
      </span>
      <button {...closeProps} className="text-slate-500 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>
    
    {step.title && (
      <h3 className="text-white font-black text-lg mb-2 italic tracking-tight leading-tight">
        {step.title}
      </h3>
    )}
    
    <div className="text-slate-300 text-sm font-medium leading-relaxed mb-6">
      {step.content}
    </div>

    <div className="flex items-center justify-between gap-4">
      <button {...skipProps} className="text-[10px] font-black text-slate-500 hover:text-slate-400 transition-colors uppercase tracking-widest">
        Pular
      </button>
      
      <div className="flex items-center gap-2">
        {index > 0 && (
          <button {...backProps} className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest px-3 py-2">
            Voltar
          </button>
        )}
        <button 
          {...primaryProps} 
          className="bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg shadow-violet-900/20 transition-all active:scale-95"
        >
          {isLastStep ? "Finalizar" : "Próximo"}
        </button>
      </div>
    </div>
  </div>
);

export default function GuidedTutorial({ run, onFinish, setActiveTab }) {
  const [mounted, setMounted] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const desktopSteps = [
      {
        target: "#balance-area",
        content: "Este é o seu resumo financeiro onde você pode ver seu saldo atual, receitas e despesas do mês.",
        disableBeacon: true,
      },
      {
        target: "#forecast-section",
        content: "Aqui você vê uma previsão inteligente de quanto terá no fim do mês baseada nos seus gastos atuais.",
      },
      {
        target: "#add-transaction-buttons",
        content: "Use estes botões para adicionar rapidamente novas receitas ou despesas.",
      },
      {
        target: "#transaction-list",
        content: "Aqui você acompanha o histórico detalhado de todas as suas movimentações.",
      },
      {
        target: "#goals-section",
        content: "Defina objetivos financeiros e acompanhe seu progresso aqui. Você pode até receber sugestões de quanto poupar por mês!",
      },
      {
        target: "#recurring-transactions-section",
        content: "Gerencie suas contas fixas (aluguel, streaming, etc) para que o sistema te avise antes do vencimento.",
      },
      {
        target: "#insights-section",
        content: "Nossa IA analisa seus hábitos e te dá dicas personalizadas para economizar e melhorar sua saúde financeira.",
      },
      {
        target: "#report-export-section",
        content: "Precisa levar seus dados para fora? Exporte relatórios completos em PDF ou Excel com um clique.",
      },
      {
        target: "body",
        placement: "center",
        content: "Você está pronto para começar a gerenciar suas finanças de forma inteligente!",
      },
    ];

    const mobileSteps = [
      {
        target: "#mobile-tabs",
        content: "Este é o seu novo centro de comando! Navegue entre as 5 funções principais do app por aqui.",
        disableBeacon: true,
        placement: "top",
      },
      {
        target: "#tab-overview",
        title: "Início",
        content: "Seu resumo financeiro completo, com saldo e previsões inteligentes.",
        placement: "top",
        offset: 15,
      },
      {
        target: "#tab-budgets",
        title: "Controle",
        content: "Gerencie seus orçamentos e veja o ranking de gastos por categoria.",
        placement: "top",
        offset: 15,
      },
      {
        target: "#tab-goals",
        title: "Objetivos",
        content: "O lugar para criar suas metas e acompanhar suas economias.",
        placement: "top",
        offset: 15,
      },
      {
        target: "#tab-analysis",
        title: "Análise",
        content: "Gráficos interativos e insights da nossa IA sobre sua saúde financeira.",
        placement: "top",
        offset: 15,
      },
      {
        target: "#tab-recurring",
        title: "Contas Mensais",
        content: "Organize seus compromissos fixos e mantenha tudo sob controle.",
        placement: "top",
        offset: 15,
      },
      {
        target: "body",
        placement: "center",
        content: "Pronto! Agora você sabe o que cada botão faz. Vamos começar?",
      },
    ];

    setSteps(isMobile ? mobileSteps : desktopSteps);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleJoyrideCallback = (data) => {
    const { status, index, action, type } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onFinish();
      if (window.innerWidth < 768) setActiveTab("overview"); // Volta para o início
    }

    // Lógica para trocar de abas no mobile durante o tutorial
    if (type === "step:after" && window.innerWidth < 768) {
      if (index === 1) setActiveTab("budgets");
      if (index === 2) setActiveTab("goals");
      if (index === 3) setActiveTab("analysis");
      if (index === 4) setActiveTab("recurring");
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton={true}
      run={run}
      scrollToFirstStep
      showProgress={false}
      showSkipButton
      steps={steps}
      tooltipComponent={Tooltip}
      disableOverlayClose
      spotlightClicks
      floaterProps={{
        disableAnimation: true,
      }}
      styles={{
        options: {
          zIndex: 10000000,
          overlayColor: "rgba(0, 0, 0, 0.8)",
          spotlightPadding: 0,
          arrowColor: "#0f172a",
        },
      }}
    />
  );
}
