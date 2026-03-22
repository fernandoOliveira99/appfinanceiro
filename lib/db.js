// DATABASE CONNECTION: lógica de conexão com PostgreSQL centralizada aqui.
import "server-only";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Em desenvolvimento, apenas avisar no console para o dev configurar.
  console.warn(
    "[db] DATABASE_URL não configurada. Configure no .env.local para conectar ao PostgreSQL."
  );
}

const isLocalhost = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: isLocalhost 
    ? connectionString 
    : connectionString + (connectionString?.includes('?') ? '&' : '?') + 'sslmode=verify-full',
  // Habilita SSL apenas fora do localhost ou se explicitamente solicitado
  ssl: isLocalhost 
    ? false 
    : (process.env.PGSSL === "true" || !isLocalhost ? { rejectUnauthorized: false } : undefined)
});

export async function query(text, params) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("executed query", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Database Query Error:", {
      text,
      params,
      error: error.message,
      code: error.code
    });
    throw error;
  }
}

