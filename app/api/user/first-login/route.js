import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function POST() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    await query(
      "UPDATE users SET first_login = false WHERE id = $1",
      [user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating first_login:", error);
    return NextResponse.json({ error: "Erro ao atualizar status do usuário" }, { status: 500 });
  }
}
