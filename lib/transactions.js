// BUSINESS LOGIC: operações de transações no banco separadas da UI.
import "server-only";
import { query } from "./db";

export async function listUserTransactions(userId) {
  // Antes de listar, processar transações recorrentes pendentes
  await processRecurringTransactions(userId);

  const res = await query(
    `SELECT id, user_id, name, amount, category, type, date, created_at
     FROM transactions
     WHERE user_id = $1
     ORDER BY date DESC, created_at DESC`,
    [userId]
  );
  return res.rows;
}

export async function processRecurringTransactions(userId) {
  try {
    const today = new Date();
    // Busca transações recorrentes que precisam ser processadas
    const res = await query(
      `SELECT * FROM recurring_transactions 
       WHERE user_id = $1 AND next_date <= $2`,
      [userId, today.toISOString().slice(0, 10)]
    );

    if (res.rows.length === 0) return;

    // Busca saldo atual do usuário para verificar se ficará negativo
    const transactionsRes = await query(
      "SELECT amount, type FROM transactions WHERE user_id = $1",
      [userId]
    );
    
    let currentBalance = 0;
    transactionsRes.rows.forEach(t => {
      if (t.type === 'income') currentBalance += Number(t.amount);
      else currentBalance -= Number(t.amount);
    });

    for (const rt of res.rows) {
      const amount = Number(rt.amount);
      const isExpense = rt.type === 'expense';
      
      // Cria a transação real
      await createUserTransaction(userId, {
        name: `${rt.name} (Automático)`,
        amount: amount,
        category: rt.category,
        type: rt.type,
        date: rt.next_date
      });

      // Lógica de notificação se o saldo ficar negativo
      if (isExpense) {
        const newBalance = currentBalance - amount;
        
        if (newBalance < 0) {
          await query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES ($1, $2, $3, $4)`,
            [
              userId, 
              "Saldo Negativo! ⚠️", 
              `O pagamento automático de "${rt.name}" (R$ ${amount.toFixed(2)}) deixou seu saldo negativo (R$ ${newBalance.toFixed(2)}). Você precisa realizar um depósito.`,
              "warning"
            ]
          );
        } else {
          await query(
            `INSERT INTO notifications (user_id, title, message, type) 
             VALUES ($1, $2, $3, $4)`,
            [
              userId, 
              "Pagamento Realizado ✅", 
              `Sua conta fixa "${rt.name}" de R$ ${amount.toFixed(2)} foi paga automaticamente.`,
              "success"
            ]
          );
        }
        currentBalance = newBalance;
      }

      // Calcula a próxima data
      let nextDate = new Date(rt.next_date);
      if (rt.frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (rt.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (rt.frequency === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      // Atualiza a recorrente
      await query(
        `UPDATE recurring_transactions 
         SET next_date = $1, last_processed = $2 
         WHERE id = $3`,
        [nextDate.toISOString().slice(0, 10), rt.next_date, rt.id]
      );
    }
  } catch (error) {
    console.error("Error processing recurring transactions:", error);
  }
}

export async function createUserTransaction(userId, data) {
  const res = await query(
    `INSERT INTO transactions (user_id, name, amount, category, type, date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, amount, category, type, date, created_at`,
    [
      userId,
      data.name,
      data.amount,
      data.category,
      data.type,
      data.date
    ]
  );
  return res.rows[0];
}

export async function updateUserTransaction(userId, id, data) {
  const res = await query(
    `UPDATE transactions
       SET name = $1,
           amount = $2,
           category = $3,
           type = $4,
           date = $5
     WHERE id = $6 AND user_id = $7
     RETURNING id, user_id, name, amount, category, type, date, created_at`,
    [
      data.name,
      data.amount,
      data.category,
      data.type,
      data.date,
      id,
      userId
    ]
  );
  return res.rows[0];
}

export async function deleteUserTransaction(userId, id) {
  await query("DELETE FROM transactions WHERE id = $1 AND user_id = $2", [
    id,
    userId
  ]);
}

