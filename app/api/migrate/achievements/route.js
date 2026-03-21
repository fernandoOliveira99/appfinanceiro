import { NextResponse } from "next/server";
import { query } from "@lib/db";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    // 1. Create achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        condition_type TEXT NOT NULL UNIQUE,
        target_value INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create user_achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      )
    `);

    // 3. Seed initial achievements
    const achievements = [
      {
        name: "Economizador",
        description: "Fique 7 dias sem gastos com 'delivery'",
        icon: "🍕",
        condition_type: "no_delivery_7d",
        target_value: 7
      },
      {
        name: "Meta Ninja",
        description: "Atingir 100% de uma meta financeira",
        icon: "🥷",
        condition_type: "goal_reached_100",
        target_value: 100
      },
      {
        name: "Investidor Iniciante",
        description: "Registre seu primeiro investimento",
        icon: "📈",
        condition_type: "first_investment",
        target_value: 1
      },
      {
        name: "Controle Total",
        description: "Adicione despesas por 7 dias seguidos",
        icon: "📅",
        condition_type: "7_day_streak",
        target_value: 7
      },
      {
        name: "Anti-Impulso",
        description: "Reduza gastos em uma categoria comparado ao mês anterior",
        icon: "🛡️",
        condition_type: "reduced_spending_category",
        target_value: 1
      }
    ];

    for (const ach of achievements) {
      await query(
        `INSERT INTO achievements (name, description, icon, condition_type, target_value)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (condition_type) DO UPDATE 
         SET name = EXCLUDED.name, 
             description = EXCLUDED.description, 
             icon = EXCLUDED.icon,
             target_value = EXCLUDED.target_value`,
        [ach.name, ach.description, ach.icon, ach.condition_type, ach.target_value]
      );
    }

    return NextResponse.json({ success: true, message: "Achievements tables created and seeded." });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
