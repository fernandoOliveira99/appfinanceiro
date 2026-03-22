"use client";

import { useEffect, useState } from "react";
import Joyride, { STATUS } from "react-joyride";
import { theme } from "@config/design-system";

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
        target: "#balance-area",
        content: "Este é o seu resumo financeiro. Aqui você vê seu saldo atual, receitas e despesas totais do mês.",
        disableBeacon: true,
      },
      {
        target: "#forecast-section",
        content: "Baseado nos seus gastos, calculamos quanto você terá no final do mês. Planejamento é tudo!",
      },
      {
        target: "#transaction-list",
        content: "Acompanhe cada centavo aqui. Você pode buscar, filtrar e gerenciar todas as suas movimentações.",
      },
      {
        target: "#fab-button",
        content: "Precisa registrar algo rápido? Use este botão flutuante para adicionar receitas ou despesas de qualquer lugar.",
        placement: "left"
      },
      {
        target: "#mobile-tabs",
        content: "Navegue entre o Resumo, suas Metas, Análises detalhadas e suas Contas Mensais fixas.",
      },
      {
        target: "#goals-section",
        content: "Defina seus sonhos aqui! Acompanhe o progresso e receba sugestões de quanto poupar para conquistar seus objetivos.",
      },
      {
        target: "#insights-section",
        content: "Nossa IA analisa seu comportamento e te avisa sobre gastos suspeitos ou como economizar mais.",
      },
      {
        target: "#report-export-section",
        content: "Gere relatórios profissionais em PDF ou Excel para ter um controle ainda mais rigoroso fora do app.",
      },
      {
        target: "body",
        placement: "center",
        content: "Você agora conhece todas as ferramentas! Vamos transformar sua vida financeira hoje?",
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
      if (index === 4) { // Depois do mobile-tabs, vai para Metas
        setActiveTab("goals");
      } else if (index === 5) { // Depois do goals-section, vai para Análise
        setActiveTab("analysis");
      }
    }
  };

  if (!mounted) return null;

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideExtraButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar Tutorial",
        next: "Próximo",
        skip: "Pular Tutorial",
      }}
      styles={{
        options: {
          arrowColor: theme.colors?.slate?.[800] || "#1e293b",
          backgroundColor: theme.colors?.slate?.[800] || "#1e293b",
          overlayColor: "rgba(0, 0, 0, 0.85)",
          primaryColor: theme.colors?.violet?.[500] || "#8b5cf6",
          textColor: "#fff",
          zIndex: 100000,
          width: window.innerWidth < 768 ? (window.innerWidth - 30) : 450,
        },
        tooltip: {
          padding: "1.5rem",
          borderRadius: "1.75rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        tooltipContent: {
          fontSize: "1rem",
          fontWeight: "500",
          lineHeight: "1.5",
          color: "#f8fafc",
        },
        buttonNext: {
          backgroundColor: theme.colors?.violet?.[600] || "#7c3aed",
          borderRadius: "1rem",
          fontSize: "0.85rem",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "0.85rem 1.5rem",
          marginLeft: "0.75rem",
          boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.3)",
        },
        buttonBack: {
          color: "#94a3b8",
          marginRight: "auto",
          fontSize: "0.85rem",
          fontWeight: "900",
          textTransform: "uppercase",
        },
        buttonSkip: {
          color: "#64748b",
          fontSize: "0.85rem",
          fontWeight: "700",
        },
      }}
    />
  );
}
