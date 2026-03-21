import { NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@lib/auth";
import { query } from "@lib/db";

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await req.json();

  try {
    // 1. Get full user data including password hash
    const res = await query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
    const storedHash = res.rows[0]?.password_hash;

    // 2. Verify current password
    const isCorrect = await verifyPassword(currentPassword, storedHash);
    if (!isCorrect) {
      return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
    }

    // 3. Hash and update new password
    const newHash = await hashPassword(newPassword);
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, user.id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Erro ao atualizar senha" }, { status: 500 });
  }
}
