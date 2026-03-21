import { NextResponse } from "next/server";
import { createUser, findUserByEmail, EMAIL_VERIFICATION_ENABLED } from "@lib/auth";
import { query } from "@lib/db";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Ajuda com problemas de certificado em alguns provedores
  }
});

export async function POST(request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Preencha nome, e-mail e senha." },
      { status: 400 }
    );
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Já existe um usuário com este e-mail." },
      { status: 400 }
    );
  }

  const user = await createUser({ name, email, password });

  // Gerar código de 6 dígitos
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 30 * 60 * 1000); // Expira em 30 minutos

  console.log("CÓDIGO DE VERIFICAÇÃO GERADO:", verificationCode); // Log para depuração se e-mail falhar

  try {
    // Tenta inserir o código de verificação
    // Primeiro limpamos qualquer código anterior para este usuário se houver
    await query("DELETE FROM email_verifications WHERE user_id = $1", [user.id]);
    
    await query(
      "INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, verificationCode, expires]
    );

    console.log("Tentando enviar e-mail de verificação para:", email);
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@financeapp.com",
      to: email,
      subject: "Código de Verificação - Finance App",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #1e293b; text-align: center;">Olá, ${name}!</h2>
          <p style="color: #64748b; text-align: center; font-size: 16px;">Seu código de verificação para o Finance App é:</p>
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #7c3aed;">${verificationCode}</span>
          </div>
          <p style="color: #94a3b8; text-align: center; font-size: 14px;">Este código expira em 30 minutos.</p>
        </div>
      `,
    });
    console.log("E-mail enviado com sucesso!");
  } catch (e) {
    console.error("ERRO CRÍTICO NO ENVIO DE E-MAIL:", e);
  }

  try {
    await query("INSERT INTO user_settings (user_id, salary) VALUES ($1, 0)", [user.id]);
  } catch (e) {
    console.warn("Failed to create default settings:", e.message);
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    requiresVerification: true
  });
}

