export function formatCurrencyBRL(value, hide = false) {
  if (hide) return "R$ ••••••";
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2
  });
}

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 * evitando problemas de fuso horário.
 * @param {string|Date} dateStr 
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  
  // Usamos os métodos UTC para garantir que a data seja a mesma independente do fuso horário local
  // já que o banco de dados armazena DATE (YYYY-MM-DD) que é interpretado como UTC meia-noite.
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Retorna a data atual no formato YYYY-MM-DD (local) para inputs de data.
 * @returns {string}
 */
export function getTodayLocalDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateTotals(transactions) {
  const totalExpenses = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  const byCategory = transactions.reduce((acc, t) => {
    if (!t.category) return acc;
    acc[t.category] = (acc[t.category] || 0) + (Number(t.amount) || 0);
    return acc;
  }, {});

  return {
    totalExpenses,
    byCategory
  };
}

export function getDefaultCategories() {
  return [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Lazer",
    "Educação",
    "Outros"
  ];
}

export function buildAssistantMessages({ salary, totalExpenses, byCategory }) {
  const tips = [];

  if (salary > 0) {
    const spentPercent = Math.round((totalExpenses / salary) * 100);
    tips.push(`Você gastou aproximadamente ${spentPercent}% da sua renda neste período.`);
    if (spentPercent > 80) {
      tips.push(
        "Seu nível de gastos está alto. Considere reduzir despesas variáveis para se aproximar de 70%."
      );
    } else if (spentPercent < 60) {
      tips.push("Ótimo! Você está controlando bem os gastos em relação à sua renda.");
    }
  } else {
    tips.push("Defina seu salário em Configurações para receber sugestões mais precisas.");
  }

  const leisureKeys = ["Lazer", "Restaurantes", "Viagens"];
  const leisureTotal = Object.entries(byCategory || {}).reduce((acc, [key, value]) => {
    if (leisureKeys.includes(key)) return acc + value;
    return acc;
  }, 0);

  if (leisureTotal > 0 && totalExpenses > 0) {
    const leisurePercent = Math.round((leisureTotal / totalExpenses) * 100);
    tips.push(`Seus gastos com lazer representam cerca de ${leisurePercent}% das despesas.`);
  }

  if (byCategory && Object.keys(byCategory).length > 0) {
    const [topCategory, topValue] = Object.entries(byCategory).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (topValue > 0) {
      tips.push(`Sua maior despesa foi ${topCategory}.`);
    }
  }

  tips.push("Tente reservar pelo menos 20% da sua renda para investimentos ou reserva de emergência.");

  return tips;
}

