-- SentinelRAG-X Database Schema with pgvector
-- Run this in your PostgreSQL database (e.g., sentinelrag)

CREATE EXTENSION IF NOT EXISTS vector;

-- Drop existing tables if re-initializing (in reverse order of dependencies)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS document_permissions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active' or 'disabled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents table
CREATE TABLE documents (
    document_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_reference VARCHAR(512) NOT NULL,
    uploader_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'processing', -- 'processing', 'ready', 'failed', 'quarantined'
    source_label VARCHAR(255)
);

-- 3. Document Permissions table (per-document read permissions)
CREATE TABLE document_permissions (
    permission_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    permission_type VARCHAR(50) NOT NULL DEFAULT 'read',
    granted_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_doc_user_permission UNIQUE (document_id, user_id, permission_type)
);

-- 4. Document Chunks table (with pgvector embedding)
-- Dimension N must match the selected embedding model (e.g., 768 for nomic-embed-text)
CREATE TABLE document_chunks (
    chunk_id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES documents(document_id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    extracted_text TEXT NOT NULL,
    page_number INTEGER,
    embedding VECTOR(768),
    trust_score NUMERIC(5,4),
    evidence_status VARCHAR(50) NOT NULL DEFAULT 'normal', -- 'normal' or 'quarantined'
    CONSTRAINT unique_doc_chunk_index UNIQUE (document_id, chunk_index)
);

-- 5. Audit Logs table
CREATE TABLE audit_logs (
    audit_id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- e.g., 'UPLOAD', 'QUERY', 'QUARANTINE', 'PERMISSION_GRANT', 'LOGIN'
    object_type VARCHAR(100) NOT NULL, -- e.g., 'document', 'chunk', 'user'
    object_id INTEGER,
    outcome VARCHAR(50) NOT NULL, -- 'success', 'failure'
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_permissions_user_id ON document_permissions(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
