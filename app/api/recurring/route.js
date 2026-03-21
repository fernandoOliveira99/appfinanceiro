import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const res = await query(
    `SELECT * FROM recurring_transactions WHERE user_id = $1 ORDER BY next_date ASC`,
    [user.id]
  );
  return NextResponse.json(res.rows);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const { name, amount, category, type, frequency, next_date } = body;

  const res = await query(
    `INSERT INTO recurring_transactions (user_id, name, amount, category, type, frequency, next_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user.id, name, Number(amount), category, type, frequency, next_date]
  );

  return NextResponse.json(res.rows[0], { status: 201 });
}
