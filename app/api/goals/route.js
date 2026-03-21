import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";
import { checkAchievements } from "@lib/achievements";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const res = await query(
    `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
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
  const { type, target_amount, current_amount, deadline } = body;

  const res = await query(
    `INSERT INTO goals (user_id, type, target_amount, current_amount, deadline)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user.id, type, Number(target_amount), Number(current_amount || 0), deadline]
  );

  // Check achievements after a goal creation
  const newlyUnlocked = await checkAchievements(user.id);

  return NextResponse.json({ ...res.rows[0], newlyUnlocked }, { status: 201 });
}
