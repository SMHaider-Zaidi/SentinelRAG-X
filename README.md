# SentinelRAG-X

Secure, local Retrieval-Augmented Generation (RAG) prototype with traceability, document-level permissions, quarantine controls, and audit logging. Built as an academic Software Engineering Complex Engineering Problem (CEP) project in plain JavaScript (modular monolith: React + Node.js/Express + PostgreSQL with pgvector + Ollama).

## Project Rules & Specifications
- **No TypeScript:** Plain JavaScript only across client and server.
- **Single Database:** PostgreSQL with the `pgvector` extension.
- **Local AI:** Ollama for local embeddings and answer generation.
- **Security:** bcryptjs password hashing, JWT authentication, server-side validation, document-level permissions, and quarantine isolation.

---

## Repository Structure

```text
SentinelRAG-X/
├── client/              # React + Vite frontend (Plain CSS)
├── server/              # Node.js + Express backend
│   ├── src/
│   │   ├── config/      # Database & environment config
│   │   ├── middleware/  # Auth, role, validation, error handling
│   │   ├── routes/      # REST API endpoints (/api/...)
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic & AI/RAG integration
│   │   ├── repositories/# Parameterized PostgreSQL queries
│   │   └── utils/       # Chunking & utilities
│   ├── sql/
│   │   └── schema.sql   # Database schema & pgvector setup
│   └── uploads/         # Secure local file storage (ignored in git)
├── docs/                # Architecture & design notes
├── architecture.md      # Detailed technical architecture
├── prd.md               # Product Requirements Document
├── rules.md             # Development & security rules
├── design.md            # UI design guide
├── phases.md            # Three-week implementation plan
├── .env.example         # Environment variables template
└── README.md            # This file
```

---

## Prerequisites & Setup Guide

Since PostgreSQL and Ollama are required for full semantic search and generation:

1. **PostgreSQL (with `pgvector` extension):**
   - Install PostgreSQL (v15+ recommended).
   - Ensure the `vector` extension is installed and enabled in your database:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

2. **Ollama:**
   - Install Ollama from [ollama.com](https://ollama.com).
   - Pull your preferred small models (e.g., `nomic-embed-text` for embeddings and `llama3` or `phi3` for chat):
     ```bash
     ollama pull nomic-embed-text
     ollama pull llama3
     ```

3. **Environment Configuration:**
   - Copy `.env.example` to `server/.env` (or root `.env`) and update your database credentials, JWT secret, and Ollama model names.

---

## Getting Started (Development)

### 1. Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Run Database Migrations / Schema
Execute `server/sql/schema.sql` against your PostgreSQL database.

### 3. Start the Application
- **Backend:**
  ```bash
  cd server
  npm run dev
  ```
- **Frontend:**
  ```bash
  cd client
  npm run dev
  ```

---

## License & Academic Notice
Built for academic demonstration under course guidelines.
