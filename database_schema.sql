-- ESQUEMA COMPLETO DO BANCO DE DADOS (FINANCE APP) --
-- Gerado em: 2026-03-20

-- Extensões Necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT,
    email TEXT UNIQUE,
    password_hash TEXT,
    avatar TEXT,
    avatar_url TEXT,
    provider TEXT,
    email_verified BOOLEAN DEFAULT false,
    "emailVerified" TIMESTAMPTZ,
    image TEXT,
    first_login BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: transactions
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    amount NUMERIC(15,2),
    category TEXT,
    type TEXT, -- 'income' ou 'expense'
    date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Tabela: goals
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT,
    target_amount NUMERIC(15,2),
    current_amount NUMERIC(15,2) DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: recurring_transactions (Contas Fixas)
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT,
    amount NUMERIC(15,2),
    category TEXT,
    type TEXT,
    frequency TEXT, -- 'monthly', 'weekly', etc.
    next_date DATE,
    last_processed DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: accounts (NextAuth OAuth)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
);

-- Tabela: sessions (NextAuth Sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL,
    "sessionToken" TEXT NOT NULL
);

-- Tabela: verification_token (NextAuth Tokens)
CREATE TABLE IF NOT EXISTS verification_token (
    identifier TEXT NOT NULL,
    expires TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Tabela: email_verifications
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: password_resets
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: user_settings
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    salary NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: achievements (Catálogo de Conquistas)
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    condition_type TEXT NOT NULL,
    target_value NUMERIC(15,2) DEFAULT 0,
    category TEXT, -- 'saving', 'spending', 'consistency'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: user_achievements (Conquistas Desbloqueadas pelos Usuários)
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Inserção de Conquistas Padrão
INSERT INTO achievements (name, description, icon, condition_type, target_value, category) 
VALUES 
('Mestre do Jejum', 'Fique 7 dias sem gastos com Delivery/iFood.', '🍔', 'no_delivery_7d', 7, 'spending'),
('Economista Iniciante', 'Atinja sua primeira meta de economia.', '🎯', 'goal_reached_100', 1, 'saving'),
('Investidor Fiel', 'Faça seu primeiro registro na categoria Investimentos.', '📈', 'first_investment', 1, 'saving'),
('Foco Total', 'Registre gastos por 7 dias seguidos (Consistência).', '🔥', '7_day_streak', 7, 'consistency'),
('Gastador Inteligente', 'Reduza os gastos em qualquer categoria comparado ao mês passado.', '💡', 'reduced_spending_category', 1, 'spending')
ON CONFLICT DO NOTHING;

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
