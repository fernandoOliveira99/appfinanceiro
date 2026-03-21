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
      "UPDATE users SET first_login = true WHERE id = $1",
      [user.id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restarting tutorial:", error);
    return NextResponse.json({ error: "Erro ao reiniciar tutorial" }, { status: 500 });
  }
}
