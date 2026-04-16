-- ============================================================
-- VerifyZA / MuniFix AI — PostgreSQL + pgvector Schema
-- Run this on Supabase SQL editor or locally after docker-compose up
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    hashed_password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Chat Messages ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    verification_result TEXT,  -- JSON blob
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Datasets ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS datasets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    description TEXT,
    file_path TEXT,
    document_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Dataset Documents (RAG chunks + embeddings) ───────────
CREATE TABLE IF NOT EXISTS dataset_documents (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER REFERENCES datasets(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small output dim
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Verification Records ──────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    query TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uncertain',
    confidence NUMERIC(4,3) DEFAULT 0.0,
    response_summary TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    recommended_action TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Municipal Reports ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS municipal_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    urgency_score INTEGER DEFAULT 1,
    location TEXT,
    description TEXT NOT NULL,
    municipality TEXT,
    suggested_department TEXT NOT NULL,
    generated_report TEXT NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_dataset ON dataset_documents(dataset_id);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON municipal_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- ── pgvector IVFFLAT Index (after data is loaded) ─────────
-- Run separately after loading at least 100 documents:
-- CREATE INDEX idx_documents_embedding ON dataset_documents
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Default Admin User ────────────────────────────────────
-- Password: Admin@1234 (bcrypt hash — change on first login!)
INSERT INTO users (email, full_name, hashed_password, role)
VALUES (
    'admin@verifyza.co.za',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2VKRbJYG2u',
    'admin'
) ON CONFLICT (email) DO NOTHING;
