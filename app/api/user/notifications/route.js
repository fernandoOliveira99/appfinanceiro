import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const res = await query(
    `SELECT * FROM notifications 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT 10`,
    [user.id]
  );
  return NextResponse.json(res.rows);
}

export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id } = await request.json();

  if (id) {
    await query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, user.id]
    );
  } else {
    await query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [user.id]
    );
  }

  return NextResponse.json({ success: true });
}
