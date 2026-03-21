import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import {
  listUserTransactions,
  createUserTransaction
} from "@lib/transactions";
import { checkAchievements } from "@lib/achievements";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const transactions = await listUserTransactions(user.id);
  return NextResponse.json(transactions);
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json();
  const { name, amount, category, type, date } = body;

  if (!name || !amount || !category || !type || !date) {
    return NextResponse.json(
      { error: "Preencha todos os campos da transação." },
      { status: 400 }
    );
  }

  const created = await createUserTransaction(user.id, {
    name,
    amount: Number(amount),
    category,
    type,
    date
  });

  // Check achievements after a transaction
  const newlyUnlocked = await checkAchievements(user.id);

  return NextResponse.json({ ...created, newlyUnlocked }, { status: 201 });
}

