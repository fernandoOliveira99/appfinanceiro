import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { updateUserTransaction, deleteUserTransaction } from "@lib/transactions";

export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const id = params.id;
  const body = await request.json();
  const { name, amount, category, type, date } = body;

  const updated = await updateUserTransaction(user.id, id, {
    name,
    amount: Number(amount),
    category,
    type,
    date
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const id = params.id;
  await deleteUserTransaction(user.id, id);
  return NextResponse.json({ ok: true });
}

