"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import { FileDown, FileText, FileSpreadsheet } from "lucide-react";
import { formatCurrencyBRL } from "@lib/finance-utils";
import { theme } from "@config/design-system";

export default function ReportExporter({ transactions, user, balance, income, expenses }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const today = new Date();
      const month = today.toLocaleString('pt-BR', { month: 'long' });
      const year = today.getFullYear();

      // Configuração de cores do tema
      const primaryColor = [124, 58, 237]; // Violet 600
      const secondaryColor = [30, 41, 59]; // Slate 800

      // Cabeçalho Estilizado
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, "F");
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Relatório Financeiro Pessoal", 14, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado para: ${user?.name || 'Usuário'}`, 14, 33);
      doc.text(`Mês: ${month.charAt(0).toUpperCase() + month.slice(1)} / ${year}`, 150, 33);

      // Resumo Financeiro
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Resumo do Período", 14, 55);

      const summaryTable = autoTable(doc, {
        startY: 60,
        head: [['Indicador', 'Valor']],
        body: [
          ['Total de Receitas', formatCurrencyBRL(income)],
          ['Total de Despesas', formatCurrencyBRL(expenses)],
          [{ content: 'Saldo Final', styles: { fontStyle: 'bold' } }, { content: formatCurrencyBRL(balance), styles: { fontStyle: 'bold' } }]
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        styles: { cellPadding: 5, fontSize: 10 },
      });

      let currentY = doc.lastAutoTable.finalY || 100;

      // --- Adição de Gráficos no PDF ---
      const chartIds = ['category-pie-chart', 'income-expense-bar-chart'];
      
      for (const chartId of chartIds) {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff' // Fundo branco sólido para melhor compatibilidade
            });
            const imgData = canvas.toDataURL('image/png');
            
            // Adiciona nova página se não houver espaço (aproximadamente 100 unidades de altura para o gráfico)
            if (currentY + 110 > 280) {
              doc.addPage();
              currentY = 20;
            } else {
              currentY += 15;
            }

            const title = chartId === 'category-pie-chart' ? 'Distribuição por Categoria' : 'Comparativo Mensal';
            doc.setFontSize(14);
            doc.text(title, 14, currentY);
            
            // Adiciona a imagem do gráfico (proporção 16:9 aproximada)
            doc.addImage(imgData, 'PNG', 14, currentY + 5, 180, 90);
            currentY += 100;
          } catch (err) {
            console.error(`Erro ao capturar gráfico ${chartId}:`, err);
          }
        }
      }

      // Resumo por Categorias (Tabela)
      const categories = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category || "Outros"] = (categories[t.category || "Outros"] || 0) + Number(t.amount || 0);
      });

      const categoryData = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => [cat, formatCurrencyBRL(val)]);

      if (categoryData.length > 0) {
        if (currentY + 50 > 280) {
          doc.addPage();
          currentY = 20;
        } else {
          currentY += 15;
        }

        doc.setFontSize(16);
        doc.text("Tabela de Gastos por Categoria", 14, currentY);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Categoria', 'Total Gasto']],
          body: categoryData,
          theme: 'grid',
          headStyles: { fillColor: [71, 85, 105] }, // Slate 600
          styles: { cellPadding: 4, fontSize: 9 },
        });
        currentY = doc.lastAutoTable.finalY;
      }

      // Tabela de Transações
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhamento de Transações", 14, 20);
      
      const tableData = transactions.map(t => {
        let dateStr = "N/D";
        try {
          const date = new Date(t.created_at || t.date);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString('pt-BR');
          }
        } catch (e) {
          console.error("Erro ao formatar data no PDF:", e);
        }

        return [
          dateStr,
          t.name || "Sem descrição",
          t.category || "Geral",
          t.type === 'income' ? 'Receita' : 'Despesa',
          formatCurrencyBRL(t.amount)
        ];
      });

      autoTable(doc, {
        startY: 25,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: secondaryColor },
        styles: { cellPadding: 3, fontSize: 9 },
        columnStyles: {
          4: { halign: 'right' }
        },
        didParseCell: function(data) {
          if (data.column.index === 3 && data.cell.section === 'body') {
            if (data.cell.raw === 'Receita') data.cell.styles.textColor = [16, 185, 129];
            else data.cell.styles.textColor = [244, 63, 94];
          }
        }
      });

      doc.save(`Relatorio_Financeiro_${month}_${year}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar o PDF. Verifique os dados e tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportXLSX = async () => {
    setIsExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const summarySheet = workbook.addWorksheet('Resumo');
      const transactionsSheet = workbook.addWorksheet('Transações');

      // --- Aba de Resumo ---
      summarySheet.columns = [{ width: 25 }, { width: 20 }];
      
      const titleCell = summarySheet.addRow(['RESUMO FINANCEIRO']);
      titleCell.font = { bold: true, size: 14 };
      summarySheet.addRow([]);

      summarySheet.addRow(['Indicador', 'Valor']).font = { bold: true };
      summarySheet.addRow(['Total de Receitas', income]);
      summarySheet.addRow(['Total de Despesas', expenses]);
      summarySheet.addRow(['Saldo Final', balance]).font = { bold: true };
      
      summarySheet.addRow([]);
      summarySheet.addRow(['GASTOS POR CATEGORIA']).font = { bold: true };
      summarySheet.addRow(['Categoria', 'Valor']).font = { bold: true };

      const categories = {};
      transactions.filter(t => t.type === 'expense').forEach(t => {
        categories[t.category || "Outros"] = (categories[t.category || "Outros"] || 0) + Number(t.amount || 0);
      });

      Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, val]) => summarySheet.addRow([cat, val]));

      // --- Adição de Gráficos no Excel ---
      const chartIds = ['category-pie-chart', 'income-expense-bar-chart'];
      let imageRow = summarySheet.rowCount + 2;

      for (const chartId of chartIds) {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, { 
              scale: 2, 
              useCORS: true, 
              backgroundColor: '#ffffff' 
            });
            const base64Image = canvas.toDataURL('image/png');
            
            const imageId = workbook.addImage({
              base64: base64Image,
              extension: 'png',
            });

            summarySheet.addImage(imageId, {
              tl: { col: 0, row: imageRow },
              ext: { width: 500, height: 300 },
              editAs: 'oneCell' // Mantém a imagem ancorada à célula para melhor importação no Google Sheets
            });
            
            imageRow += 16; // Pula linhas para o próximo gráfico
          } catch (err) {
            console.error(`Erro ao capturar gráfico para Excel ${chartId}:`, err);
          }
        }
      }

      // --- Aba de Transações ---
      transactionsSheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'name', width: 40 },
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Tipo', key: 'type', width: 12 },
        { header: 'Valor', key: 'amount', width: 15 }
      ];

      transactionsSheet.getRow(1).font = { bold: true };

      transactions.forEach(t => {
        let dateStr = "N/D";
        try {
          const d = new Date(t.created_at || t.date);
          if (!isNaN(d.getTime())) dateStr = d.toLocaleDateString('pt-BR');
        } catch (e) {}

        const row = transactionsSheet.addRow({
          date: dateStr,
          name: t.name || "Sem descrição",
          category: t.category || "Geral",
          type: t.type === 'income' ? 'Receita' : 'Despesa',
          amount: Number(t.amount) || 0
        });

        // Estilização condicional por tipo
        const typeCell = row.getCell('type');
        if (t.type === 'income') {
          typeCell.font = { color: { argb: 'FF10B981' }, bold: true };
        } else {
          typeCell.font = { color: { argb: 'FFF43F5E' }, bold: true };
        }
      });

      // --- Gerar e Baixar Arquivo ---
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Relatorio_Financeiro.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao gerar XLSX:", error);
      alert("Erro ao gerar o Excel. Verifique os dados e tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section id="report-export-section" className={`${theme.cardStyles.base} rounded-[2.5rem] p-6 shadow-xl border border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-900/80`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner border border-slate-200 dark:border-slate-700/50">
            <FileDown size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Exportar Relatório</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Salve seus dados em PDF ou Excel</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={exportPDF}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <FileText size={14} />
            PDF
          </button>
          <button
            onClick={exportXLSX}
            disabled={isExporting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <FileSpreadsheet size={14} />
            Excel
          </button>
        </div>
      </div>
    </section>
  );
}
