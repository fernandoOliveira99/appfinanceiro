import { query } from "./db";
import { formatCurrencyBRL } from "./finance-utils";

export async function generateSmartTips(userId) {
  try {
    const tips = [];
    
    // 1. Get recent expenses (last 30 days)
    const recentExpensesRes = await query(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE user_id = $1 AND type = 'expense' AND date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY category
      ORDER BY total DESC
    `, [userId]);

    const recentExpenses = recentExpensesRes.rows;

    // 2. Get last month's expenses for comparison
    const lastMonthExpensesRes = await query(`
      SELECT category, SUM(amount) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'expense' 
      AND date >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
      AND date < date_trunc('month', CURRENT_DATE)
      GROUP BY category
    `, [userId]);

    const lastMonthExpenses = lastMonthExpensesRes.rows.reduce((acc, curr) => {
      acc[curr.category] = Number(curr.total);
      return acc;
    }, {});

    // --- Analyze Patterns ---

    // Pattern 1: High Spending in a category compared to last month
    for (const curr of recentExpenses) {
      const lastTotal = lastMonthExpenses[curr.category] || 0;
      if (lastTotal > 0 && Number(curr.total) > lastTotal * 1.2) {
        const percentInc = Math.round(((Number(curr.total) / lastTotal) - 1) * 100);
        tips.push({
          id: `spike-${curr.category}`,
          message: `Você gastou ${percentInc}% a mais em ${curr.category} este mês`,
          type: 'warning',
          category: curr.category
        });
      }
    }

    // Pattern 2: No savings in the last 5 days
    const lastSavingsRes = await query(`
      SELECT MAX(date) as last_date
      FROM transactions
      WHERE user_id = $1 AND type = 'income'
    `, [userId]);

    const lastDate = lastSavingsRes.rows[0].last_date;
    if (lastDate) {
      const diffDays = Math.ceil((new Date() - new Date(lastDate)) / (1000 * 60 * 60 * 24));
      if (diffDays >= 5) {
        tips.push({
          id: 'no-savings',
          message: `Você não registrou novas receitas nos últimos ${diffDays} dias`,
          type: 'info'
        });
      }
    }

    // Pattern 3: Entertainment/Lazer rising
    const lazerSpending = recentExpenses.find(e => e.category === 'Lazer');
    if (lazerSpending && Number(lazerSpending.total) > 200) {
      tips.push({
        id: 'lazer-high',
        message: `Seus gastos com lazer estão subindo: ${formatCurrencyBRL(lazerSpending.total)} nos últimos 30 dias`,
        type: 'warning'
      });
    }

    // Pattern 4: Top spending category
    if (recentExpenses.length > 0) {
      const topCat = recentExpenses[0];
      tips.push({
        id: 'top-spending',
        message: `${topCat.category} é sua maior categoria de gastos (${formatCurrencyBRL(topCat.total)})`,
        type: 'info'
      });
    }

    return tips;
  } catch (error) {
    console.error("Error generating smart tips:", error);
    return [];
  }
}
