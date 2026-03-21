import { NextResponse } from "next/server";
import { query } from "@lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    // Verificar se o token é válido e não expirou
    const res = await query(
      "SELECT user_id FROM password_resets WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    const resetRequest = res.rows[0];

    if (!resetRequest) {
      return NextResponse.json({ error: "Link de recuperação inválido ou expirado." }, { status: 400 });
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Atualizar a senha do usuário
    await query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, resetRequest.user_id]
    );

    // Remover o token usado
    await query("DELETE FROM password_resets WHERE token = $1", [token]);

    return NextResponse.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erro ao redefinir senha." }, { status: 500 });
  }
}
