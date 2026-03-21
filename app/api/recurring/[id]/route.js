import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  const { id } = params;

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, amount, category, type, frequency, next_date } = body;

    const res = await query(
      `UPDATE recurring_transactions 
       SET name = $1, amount = $2, category = $3, type = $4, frequency = $5, next_date = $6
       WHERE id = $7 AND user_id = $8 
       RETURNING *`,
      [name, Number(amount), category, type, frequency, next_date, id, user.id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "Transação não encontrada." }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error("Failed to update recurring:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  const { id } = params;

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await query("DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2", [id, user.id]);

  return NextResponse.json({ success: true });
}
