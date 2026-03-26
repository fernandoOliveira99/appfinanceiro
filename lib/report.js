export async function generateDashboardReport({ monthLabel, salary, incomeTotal, expenseTotal, transactions }) {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const doc = new jsPDF();

  const balance = incomeTotal - expenseTotal;

  // Header do Relatório
  doc.setFillColor(124, 58, 237); // Cor violeta do tema
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório Financeiro Pessoal", 14, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 33);

  // Resumo
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo do Período", 14, 55);
  doc.text(`Mês: ${monthLabel}`, 150, 55);

  doc.setDrawColor(226, 232, 240);
  doc.line(14, 60, 196, 60);

  const stats = [
    ["Receita Total", `R$ ${incomeTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["Despesas Totais", `R$ ${expenseTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["Saldo Final", `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`]
  ];

  doc.autoTable({
    startY: 65,
    head: [["Descrição", "Valor"]],
    body: stats,
    theme: "striped",
    headStyles: { fillColor: [124, 58, 237] },
    columnStyles: {
      1: { halign: "right", fontStyle: "bold" }
    }
  });

  // Tabela de Transações
  doc.setFontSize(16);
  doc.text("Detalhamento de Transações", 14, doc.lastAutoTable.finalY + 15);

  const tableData = (transactions || []).map(t => [
    new Date(t.date).toLocaleDateString("pt-BR"),
    t.type === "income" ? "Receita" : "Despesa",
    t.category || "-",
    t.name || "-",
    `R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Data", "Tipo", "Categoria", "Descrição", "Valor"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [124, 58, 237] },
    columnStyles: {
      4: { halign: "right" }
    },
    didParseCell: function(data) {
      if (data.column.index === 1 && data.cell.section === 'body') {
        if (data.cell.raw === 'Receita') {
          data.cell.styles.textColor = [16, 185, 129]; // Verde
        } else {
          data.cell.styles.textColor = [244, 63, 94]; // Rosa/Vermelho
        }
      }
    }
  });

  // Nota sobre gráficos
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text("* Gráficos detalhados podem ser visualizados diretamente no painel interativo do aplicativo.", 14, finalY);

  doc.save(`Relatorio_${monthLabel.replace(" ", "_")}.pdf`);
}

