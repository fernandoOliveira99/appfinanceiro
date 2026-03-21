import { NextResponse } from "next/server";
import { findUserByEmail, query } from "@lib/db";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

// Simulação de envio de e-mail (em prod, use variáveis SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
    }

    // Buscamos o usuário no banco
    const res = await query("SELECT id, name, email FROM users WHERE email = $1", [email]);
    const user = res.rows[0];

    // Por segurança, não confirmamos se o e-mail existe ou não
    if (!user) {
      return NextResponse.json({ message: "Se o e-mail estiver cadastrado, um link será enviado." });
    }

    // Geramos um token de reset (UUID)
    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hora de expiração

    // Armazenamos o token no banco
    try {
      console.log(`Tentando salvar token de reset para o usuário: ${user.id}`);
      await query(
        `INSERT INTO password_resets (user_id, token, expires_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (user_id) DO UPDATE SET token = $2, expires_at = $3`,
        [user.id, token, expires]
      );
    } catch (e) {
      console.error("ERRO AO SALVAR TOKEN NO BANCO:", e.message);
      return NextResponse.json({ error: "Erro interno ao preparar recuperação." }, { status: 500 });
    }

    // Envio do e-mail real
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    console.log(`Tentando enviar e-mail de recuperação para: ${email}`);
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "fernandojsbkp@gmail.com",
        to: email,
        subject: "Recuperação de Senha - Finance App",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e293b; text-align: center;">Olá, ${user.name}!</h2>
            <p style="color: #64748b; text-align: center; font-size: 16px;">Você solicitou a recuperação de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">Redefinir Minha Senha</a>
            </div>
            <p style="color: #94a3b8; text-align: center; font-size: 14px;">Este link expira em 1 hora por segurança.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #cbd5e1; text-align: center; font-size: 12px;">Se você não solicitou a troca de senha, por favor ignore este e-mail.</p>
          </div>
        `,
      });
      console.log("E-mail de recuperação enviado com sucesso!");
    } catch (mailError) {
      console.error("ERRO CRÍTICO NO ENVIO DO E-MAIL DE RECUPERAÇÃO:", mailError);
      return NextResponse.json({ error: "Falha ao enviar e-mail de recuperação." }, { status: 500 });
    }

    return NextResponse.json({ message: "Link de recuperação enviado." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erro ao processar solicitação." }, { status: 500 });
  }
}
