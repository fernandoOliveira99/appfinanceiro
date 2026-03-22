import { NextResponse } from "next/server";
import { findUserByEmail } from "@lib/auth";
import { query } from "@lib/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
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

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 400 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: "E-mail já verificado." }, { status: 400 });
    }

    // Gerar novo código de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // Expira em 30 minutos

    // Limpar códigos anteriores e inserir o novo
    await query("DELETE FROM email_verifications WHERE user_id = $1", [user.id]);
    await query(
      "INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, verificationCode, expires]
    );

    console.log(`NOVO CÓDIGO PARA ${email}:`, verificationCode);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "no-reply@financeapp.com",
        to: email,
        subject: "Novo Código de Verificação - Finance App",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #1e293b; text-align: center;">Olá, ${user.name}!</h2>
            <p style="color: #64748b; text-align: center; font-size: 16px;">Aqui está o seu novo código de verificação:</p>
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #7c3aed;">${verificationCode}</span>
            </div>
            <p style="color: #94a3b8; text-align: center; font-size: 14px;">Este código expira em 30 minutos.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Erro ao enviar e-mail de reenvio:", e);
      // Não falha a requisição aqui para permitir ver o código no log em desenvolvimento
    }

    return NextResponse.json({ message: "Novo código enviado com sucesso!" });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: "Erro ao reenviar código." }, { status: 500 });
  }
}
