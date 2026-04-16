-- ============================================================
-- SizweOS National Intelligence — PostgreSQL + pgvector Schema
-- Run this on Supabase SQL editor or locally after docker-compose up
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Tenancy & RBAC ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'municipality' CHECK (type IN ('municipality', 'shop', 'government', 'system')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]'
);

-- ── Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    hashed_password TEXT NOT NULL,
    role TEXT DEFAULT 'citizen',
    tenant_id TEXT REFERENCES tenants(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed System Tenant
INSERT INTO tenants (id, name, type) VALUES ('system-core', 'SizweOS Sovereign Core', 'system') ON CONFLICT DO NOTHING;

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

-- ── Spaza Admin ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spaza_shops (
    id TEXT PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tax Engine (SpazaAI TaxMate) ───────────────────────────
CREATE TABLE IF NOT EXISTS tax_brackets (
    id SERIAL PRIMARY KEY,
    min_turnover NUMERIC(15,2) NOT NULL,
    max_turnover NUMERIC(15,2) NOT NULL,
    base_tax NUMERIC(15,2) DEFAULT 0.0,
    rate_percentage NUMERIC(5,2) DEFAULT 0.0,
    tax_year INTEGER DEFAULT 2025
);

CREATE TABLE IF NOT EXISTS tax_income_entries (
    id SERIAL PRIMARY KEY,
    shop_id TEXT REFERENCES spaza_shops(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    category TEXT DEFAULT 'sales',
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    metadata_json JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS tax_year_summaries (
    id SERIAL PRIMARY KEY,
    shop_id TEXT REFERENCES spaza_shops(id) ON DELETE CASCADE NOT NULL,
    tax_year INTEGER NOT NULL,
    total_turnover NUMERIC(15,2) DEFAULT 0.0,
    estimated_tax NUMERIC(15,2) DEFAULT 0.0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_reminders (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    remind_at TIMESTAMPTZ
);

-- Seed SARS Turnover Tax Brackets (2025 Estimation)
-- R0 - R150,000: 0%
-- R150,001 - R300,000: 1% of each R1 above R150,000
-- R300,001 - R500,000: R1,500 + 2% of each R1 above R300,000
-- R500,001 - R750,000: R5,500 + 3% of each R1 above R500,000
-- R750,001 - R1,000,000: R13,000 + 3% of each R1 above R750,000
INSERT INTO tax_brackets (min_turnover, max_turnover, base_tax, rate_percentage, tax_year) 
VALUES 
(0, 150000, 0, 0, 2025),
(150001, 300000, 0, 1, 2025),
(30001, 500000, 1500, 2, 2025),
(500001, 750000, 5500, 3, 2025),
(750001, 1000000, 13000, 3, 2025)
ON CONFLICT DO NOTHING;

-- ── QueueLess AI (Gov Concierge) ──────────────────────────
CREATE TABLE IF NOT EXISTS offices (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    office_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    office_id INTEGER REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER DEFAULT 1,
    booked_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    office_id INTEGER REFERENCES offices(id) ON DELETE CASCADE NOT NULL,
    slot_id INTEGER REFERENCES time_slots(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Offices
INSERT INTO offices (name, address, office_type) VALUES
('DHA Sandton', 'Sandton City, Rivonia Rd', 'DHA'),
('SASSA Soweto', 'Chris Hani Rd, Diepkloof', 'SASSA'),
('Post Office Midrand', 'Old Pretoria Rd', 'PostOffice')
ON CONFLICT DO NOTHING;

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_dataset ON dataset_documents(dataset_id);
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_records(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON municipal_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_spaza_owner ON spaza_shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_tax_entries_shop ON tax_income_entries(shop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_slots_office ON time_slots(office_id);

-- ── pgvector IVFFLAT Index (after data is loaded) ─────────
-- Run separately after loading at least 100 documents:
-- CREATE INDEX idx_documents_embedding ON dataset_documents
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Default Admin User ────────────────────────────────────
-- Password: Admin@1234 (bcrypt hash — change on first login!)
INSERT INTO users (email, full_name, hashed_password, role)
VALUES (
    'admin@sizweos.co.za',
    'System Administrator',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2VKRbJYG2u',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- ── SaaS & Billing ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT UNIQUE REFERENCES tenants(id),
    plan TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
    id SERIAL PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    event_type TEXT NOT NULL,
    cost FLOAT DEFAULT 0.0,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata_json JSONB DEFAULT '{}'
);

INSERT INTO subscriptions (tenant_id, plan, status) VALUES ('system-core', 'enterprise', 'active') ON CONFLICT DO NOTHING;
