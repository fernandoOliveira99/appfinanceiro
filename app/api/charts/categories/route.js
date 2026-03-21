import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const res = await query(
    `SELECT category, SUM(amount)::numeric AS total
       FROM transactions
      WHERE user_id = $1
        AND type = 'expense'
      GROUP BY category
      ORDER BY total DESC`,
    [user.id]
  );

  const byCategory = {};
  for (const row of res.rows) {
    byCategory[row.category || "Outros"] = Number(row.total);
  }

  return NextResponse.json(byCategory);
}

