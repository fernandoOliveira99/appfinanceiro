import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { query } from "@lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return NextResponse.json(user);
}

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { name, avatar_url } = await req.json();

  try {
    const finalAvatar = avatar_url === "" ? null : (avatar_url || user.avatar_url);
    const finalName = name || user.name;
    
    const result = await query(
      "UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING id, name, email, avatar_url",
      [finalName, finalAvatar, user.id]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}
