import { NextResponse } from "next/server";
import { query } from "@lib/db";

export async function POST(request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "E-mail e código são obrigatórios." }, { status: 400 });
    }

    // Buscar usuário pelo e-mail
    const userRes = await query("SELECT id FROM users WHERE email = $1", [email]);
    const user = userRes.rows[0];

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 400 });
    }

    // Verificar se o código é válido e não expirou
    const res = await query(
      "SELECT id FROM email_verifications WHERE user_id = $1 AND token = $2 AND expires_at > NOW()",
      [user.id, code]
    );
    const verifyRequest = res.rows[0];

    if (!verifyRequest) {
      return NextResponse.json({ error: "Código inválido ou expirado." }, { status: 400 });
    }

    // Atualizar o usuário para verificado
    // Usamos tanto "email_verified" (boolean) quanto "emailVerified" (timestamptz para NextAuth)
    await query(
      `UPDATE users SET 
        "emailVerified" = NOW(),
        email_verified = true 
       WHERE id = $1`,
      [user.id]
    );

    // Remover o código usado
    await query("DELETE FROM email_verifications WHERE user_id = $1", [user.id]);

    return NextResponse.json({ message: "E-mail verificado com sucesso!" });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json({ error: "Erro ao verificar e-mail." }, { status: 500 });
  }
}
