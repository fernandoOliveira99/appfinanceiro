import { NextResponse } from "next/server";
import { query } from "@lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Sincronização robusta de tipos para TEXT (Necessário para NextAuth e IDs dinâmicos)
    await query(`
      DO $$ 
      BEGIN 
        -- 1. Remover todas as constraints de chave estrangeira que referenciam users(id)
        ALTER TABLE IF EXISTS goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
        ALTER TABLE IF EXISTS recurring_transactions DROP CONSTRAINT IF EXISTS recurring_transactions_user_id_fkey;
        ALTER TABLE IF EXISTS transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
        ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
        ALTER TABLE IF EXISTS user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
        ALTER TABLE IF EXISTS accounts DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";
        ALTER TABLE IF EXISTS sessions DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";
        ALTER TABLE IF EXISTS email_verifications DROP CONSTRAINT IF EXISTS email_verifications_user_id_fkey;

        -- 2. Alterar tipos das colunas para TEXT em todas as tabelas
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='id' AND data_type='integer') THEN
          ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='goals') THEN
          ALTER TABLE goals ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='recurring_transactions') THEN
          ALTER TABLE recurring_transactions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='transactions') THEN
          ALTER TABLE transactions ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='notifications') THEN
          ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_settings') THEN
          ALTER TABLE user_settings ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='accounts') THEN
          ALTER TABLE accounts ALTER COLUMN "userId" TYPE TEXT USING "userId"::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='sessions') THEN
          ALTER TABLE sessions ALTER COLUMN "userId" TYPE TEXT USING "userId"::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='email_verifications') THEN
          ALTER TABLE email_verifications ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='password_resets') THEN
          ALTER TABLE password_resets ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='id' AND data_type='integer') THEN
          -- If somehow it was created with integer ID, let's keep it but ensure user_id exists
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='user_id') THEN
           -- If table exists but column doesn't, we might need to drop and recreate or add it
           -- Given it's a new table, dropping is safer to ensure all constraints
           EXECUTE 'DROP TABLE IF EXISTS categories CASCADE';
        END IF;

        -- 3. Recriar as tabelas base e constraints
      END $$;
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        type TEXT,
        target_amount NUMERIC(15,2),
        current_amount NUMERIC(15,2) DEFAULT 0,
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS recurring_transactions (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT,
        amount NUMERIC(15,2),
        category TEXT,
        type TEXT,
        frequency TEXT,
        next_date DATE,
        last_processed DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`);

    // NextAuth Tables for PostgresAdapter
    await query(`
      CREATE TABLE IF NOT EXISTS verification_token (
        identifier TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        token TEXT NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        id_token TEXT,
        scope TEXT,
        session_state TEXT,
        token_type TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL,
        "sessionToken" TEXT NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS email_verifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add provider and emailVerified columns to users table if they don't exist
    await query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='provider') THEN
          ALTER TABLE users ADD COLUMN provider TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='emailVerified') THEN
          ALTER TABLE users ADD COLUMN "emailVerified" TIMESTAMPTZ;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='image') THEN
          ALTER TABLE users ADD COLUMN image TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='first_login') THEN
          ALTER TABLE users ADD COLUMN first_login BOOLEAN DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='role') THEN
          ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
        END IF;
      END $$;
    `);

    // Criar administrador nandoo9
    const adminPasswordHash = await bcrypt.hash("@Bartolomeu1", 10);
    const adminEmail = "nandoo9@finance.com";
    const adminName = "Administrador Nando";

    await query(`
      INSERT INTO users (name, email, password_hash, role, email_verified)
      VALUES ($1, $2, $3, 'admin', true)
      ON CONFLICT (email) DO UPDATE 
      SET role = 'admin', password_hash = $3;
    `, [adminName, adminEmail, adminPasswordHash]);

    await query(`
      UPDATE users 
      SET email_verified = true 
      WHERE provider = 'google' OR email LIKE '%@gmail.com';
    `);

    return NextResponse.json({ 
      success: true, 
      message: "Migração completa e administrador configurado."
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
