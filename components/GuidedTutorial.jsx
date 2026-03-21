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
        content: "Este é o seu resumo financeiro onde você pode ver seu saldo atual, receitas e despesas do mês.",
        disableBeacon: true,
      },
      {
        target: "#mobile-tabs",
        content: "Use estas abas para navegar entre o Resumo, suas Metas e a Análise Financeira.",
      },
      {
        target: "#transaction-list",
        content: "Aqui você acompanha o histórico detalhado de todas as suas movimentações.",
      },
      {
        target: "#fab-button",
        content: "Use este botão para adicionar rapidamente novas receitas ou despesas.",
        placement: "left"
      },
      {
        target: "#goals-section",
        content: "Defina objetivos financeiros e acompanhe seu progresso aqui. Você pode até receber sugestões de quanto poupar por mês!",
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
      if (index === 3) { // Depois do transaction-list, vai para Metas
        setActiveTab("goals");
      } else if (index === 4) { // Depois do goals-section, vai para Análise
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
          arrowColor: theme.colors?.slate?.[900] || "#0f172a",
          backgroundColor: theme.colors?.slate?.[900] || "#0f172a",
          overlayColor: "rgba(0, 0, 0, 0.75)",
          primaryColor: theme.colors?.violet?.[600] || "#7c3aed",
          textColor: "#fff",
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: "left",
          borderRadius: "1.5rem",
          padding: "1rem",
        },
        buttonNext: {
          backgroundColor: theme.colors?.violet?.[600] || "#7c3aed",
          borderRadius: "0.75rem",
          fontSize: "0.75rem",
          fontWeight: "bold",
          padding: "0.75rem 1.25rem",
        },
        buttonBack: {
          color: "#94a3b8",
          marginRight: "0.5rem",
          fontSize: "0.75rem",
          fontWeight: "bold",
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: "0.75rem",
          fontWeight: "bold",
        },
      }}
    />
  );
}
