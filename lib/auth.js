import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query } from "./db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import { v4 as uuidv4 } from "uuid";

const EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED === "true";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function findUserByEmail(email) {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

export async function createUser({ name, email, password }) {
  const passwordHash = await hashPassword(password);
  const id = uuidv4();
  // O usuário começa com e-mail não verificado
  const result = await query(
    `INSERT INTO users (id, name, email, password_hash, email_verified)
     VALUES ($1, $2, $3, $4, false)
     RETURNING id, name, email, avatar, created_at`,
    [id, name, email, passwordHash]
  );
  return result.rows[0];
}

export { EMAIL_VERIFICATION_ENABLED };

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id) {
    const result = await query(
      "SELECT id, name, email, avatar, avatar_url, created_at, first_login FROM users WHERE id = $1",
      [session.user.id]
    );
    return result.rows[0] || null;
  }

  if (session?.user?.email) {
    const result = await query(
      "SELECT id, name, email, avatar, avatar_url, created_at, first_login FROM users WHERE email = $1",
      [session.user.email]
    );
    return result.rows[0] || null;
  }

  return null;
}

