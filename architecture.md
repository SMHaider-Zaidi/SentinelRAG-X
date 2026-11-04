# SentinelRAG-X — Architecture and Technical Design

## 1. Architecture principles

- Build a **modular monolith**: one React frontend, one Express API, one PostgreSQL database.
- Use plain JavaScript throughout. TypeScript is not required.
- Keep the RAG pipeline understandable and testable.
- Enforce authorization and quarantine rules in backend retrieval before context reaches the LLM.
- Keep AI provider calls behind small service functions so Ollama can be changed without rewriting the app.
- Avoid unnecessary frameworks and abstractions.

## 2. Final technology stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | React + Vite (JavaScript) | Free |
| Styling | Plain CSS; Tailwind optional, not required | Free |
| Backend | Node.js + Express.js (JavaScript) | Free |
| Database | PostgreSQL | Free |
| Vector search | pgvector extension | Free |
| Database driver | `pg` (node-postgres) | Free |
| Authentication | `bcryptjs` + `jsonwebtoken` | Free |
| Validation | `zod` | Free |
| File upload | `multer` | Free |
| PDF extraction | `pdf-parse` (verify installed version/API) | Free |
| AI runtime | Ollama local runtime | Free |
| Embeddings | A small Ollama-compatible embedding model | Free model options |
| Answer generation | A small local instruct/chat model | Free model options |
| Tests | Vitest or Jest + Supertest | Free |

No paid API key or subscription should be required for the core demonstration. Local model downloads use disk space, and inference speed depends on available RAM/VRAM.

## 3. High-level architecture

```text
React UI
   |
   | HTTP JSON / multipart upload
   v
Express API
   |
   +--> Authentication middleware (JWT)
   +--> Validation + role/document authorization
   |
   +--> Application services
   |      |
   |      +--> Document service
   |      |      +--> Local file storage
   |      |      +--> Text extraction
   |      |      +--> Chunking
   |      |      +--> Embedding service (Ollama)
   |      |
   |      +--> RAG service
   |      |      +--> Permission-filtered vector retrieval
   |      |      +--> Quarantine filter
   |      |      +--> Context assembly
   |      |      +--> Answer generation (Ollama)
   |      |
   |      +--> Sentinel service
   |      |      +--> Simple evidence heuristic
   |      |      +--> Quarantine / restore
   |      |
   |      +--> Audit service
   |
   v
PostgreSQL + pgvector
(users, documents, permissions, chunks/vectors, audit logs)
```

## 4. Repository / folder structure

```text
SentinelRAG-X/
├── client/
│   ├── src/
│   │   ├── api/                 # API client and endpoint functions
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # Authentication state
│   │   ├── pages/               # Login, Register, Dashboard, Documents, Chat
│   │   ├── styles/              # Global and page styles
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/              # Environment and database configuration
│   │   ├── middleware/          # Auth, role, validation, error handling
│   │   ├── routes/              # Route definitions
│   │   ├── controllers/         # HTTP request/response handling
│   │   ├── services/            # Auth, documents, RAG, Sentinel, audit
│   │   ├── repositories/        # PostgreSQL queries
│   │   ├── utils/               # Chunking, similarity helpers, utilities
│   │   ├── app.js
│   │   └── server.js
│   ├── sql/
│   │   └── schema.sql
│   ├── uploads/                 # Local uploads; never commit user files
│   └── package.json
├── docs/                        # Diagrams and demo notes
├── .env.example
├── .gitignore
└── README.md
```

Do not create empty folders/files just to match this tree. Add modules when functionality is implemented.

## 5. PostgreSQL + pgvector setup

- Use PostgreSQL as the only database.
- Enable the extension in the project database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

- Confirm pgvector is installed and available on the local PostgreSQL server before building retrieval. Installation steps vary by operating system/distribution; document the team's actual setup.
- Use a vector column with a dimension matching the selected embedding model. Do not guess the dimension; verify it from the model documentation or a test embedding.
- Keep the embedding model consistent for all indexed chunks and user queries.
- For a small prototype, exact vector search is sufficient. Do not add approximate indexes unless the dataset grows enough to justify them.
- Use pgvector cosine distance (`<=>`) for cosine-distance ranking. Lower distance means closer vectors. If displaying a similarity value, derive it consistently (for normalized vectors, `1 - cosine_distance` is commonly used) and label it as relevance, not truth.
- Store model identity/configuration so the team does not silently mix vectors from different embedding models.

Example query shape (adapt column/table names to the final schema):

```sql
SELECT
    dc.chunk_id,
    dc.document_id,
    dc.extracted_text,
    dc.page_number,
    d.title,
    dc.embedding <=> $1::vector AS cosine_distance
FROM document_chunks AS dc
JOIN documents AS d ON d.document_id = dc.document_id
WHERE d.status = 'ready'
  AND dc.evidence_status <> 'quarantined'
ORDER BY dc.embedding <=> $1::vector
LIMIT $2;
```

**Important:** the example above illustrates vector ordering only. The real retrieval query must also enforce the requesting user's document permissions (or join against the permitted document IDs) before returning candidates. Never fetch unrestricted chunks and rely on the frontend to hide them.

## 6. Suggested logical database schema

This is the minimum prototype schema. Use primary keys, foreign keys, sensible indexes, `NOT NULL` where appropriate, and timestamps. Preserve SRS naming if it differs; document any mapping.

### users
- `user_id` — primary key
- `name`
- `email` — unique
- `password_hash`
- `role` — `admin` or `user`
- `status` — `active` or `disabled`
- `created_at`

### documents
- `document_id` — primary key
- `title`
- `file_reference`
- `uploader_id` — FK to users
- `uploaded_at`
- `version` — simple integer/default if needed
- `status` — `processing`, `ready`, `failed`, or `quarantined`
- `source_label` — optional display/source description

### document_permissions
- `permission_id` — primary key
- `document_id` — FK to documents
- `user_id` — FK to users
- `permission_type` — e.g. `read`
- `granted_by` — FK to users
- Unique constraint on `(document_id, user_id, permission_type)`

### document_chunks
- `chunk_id` — primary key
- `document_id` — FK to documents
- `chunk_index`
- `extracted_text`
- `page_number` — nullable
- `embedding` — `vector(N)`, where N is the actual selected embedding model dimension
- `trust_score` — nullable numeric value, only if used
- `evidence_status` — `normal` or `quarantined`
- Unique constraint on `(document_id, chunk_index)`

### audit_logs
- `audit_id` — primary key
- `actor_id` — nullable FK to users
- `event_type`
- `object_type`
- `object_id` — nullable
- `outcome`
- `reason` — nullable
- `created_at`

Do not add speculative tables or fields. A single per-user permission table is enough for this prototype.

## 7. RAG ingestion and question-answering flows

### Ingestion
1. Authenticate and authorize uploader (admin).
2. Validate MIME type, extension, and maximum file size.
3. Save the file using a generated safe filename.
4. Create document record with `processing` status.
5. Extract text from PDF/TXT; preserve page numbers where available.
6. Split into moderate, overlapping chunks; keep chunk index and page.
7. Request embeddings from Ollama.
8. Validate embedding length and numeric values against configured vector dimension.
9. Save chunk text, metadata, and vector to PostgreSQL.
10. Mark document `ready`; on failure mark `failed` and record a safe reason.
11. Write audit event.

### Question answering
1. Authenticate user and validate question.
2. Determine accessible document IDs.
3. Generate question embedding using the same embedding model.
4. Run a pgvector similarity query that includes permission, document-status, and quarantine filters.
5. Apply a configurable minimum-evidence rule and top-k limit, tuned with the demo dataset.
6. Assemble a bounded context with source metadata.
7. Send only the selected passages and question to the LLM.
8. Instruct the model to answer only from context and explicitly say when context is insufficient.
9. Return answer, sources, and a simple evidence indicator.
10. Record audit event without storing unnecessary sensitive content.

**Critical:** unauthorized and quarantined text must never enter the context sent to Ollama. Apply filters in the retrieval query/backend before prompt construction.

## 8. API outline

Use REST-style routes under `/api`, consistent JSON responses, and correct HTTP status codes.

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Documents
- `POST /api/documents` — admin upload
- `GET /api/documents` — only documents visible to caller
- `GET /api/documents/:id` — metadata after authorization
- `DELETE /api/documents/:id` — optional, admin only, if safe and time allows

### Permissions
- `POST /api/documents/:id/permissions` — admin grants access
- `DELETE /api/documents/:id/permissions/:userId` — admin revokes access

### RAG
- `POST /api/chat/query` — question, answer, sources
- `GET /api/health` — API/database health
- `GET /api/ai/health` — optional Ollama readiness check

### Sentinel and audit
- `PATCH /api/chunks/:id/quarantine` — admin quarantine/restore with reason
- `GET /api/audit` — admin only; basic pagination if time permits

Implement only routes backed by working features.

## 9. Authentication and security basics

- Hash passwords with bcryptjs; never store plaintext passwords.
- Use JWT expiry and a strong secret loaded from environment variables.
- Keep secrets out of source control; commit `.env.example`, never real `.env`.
- Validate request bodies, params, query strings, and uploaded files.
- Use parameterized SQL queries with `pg`; never concatenate user input into SQL.
- Configure CORS for the local frontend origin.
- Use Helmet and a modest login rate limit if feasible.
- Enforce role and document-level authorization in backend routes/services/queries.
- Do not expose stack traces, password hashes, tokens, or filesystem paths in API errors.
- Keep uploaded files outside the publicly served frontend directory.
- Add `.env`, uploads, model files, logs, and `node_modules` to `.gitignore`.

## 10. Local AI setup and fallback

- Use Ollama as the preferred local runtime.
- Choose one small embedding model and one small chat/instruct model after checking the team's hardware.
- Pull models once during setup; do not download models on every app start.
- Configure Ollama base URL and model names through environment variables.
- Add an AI health check and a clear message if Ollama is unavailable.
- Keep embedding and chat calls in separate small service modules.
- The rest of the app should be testable with a mock AI provider. Mock embeddings are for tests/development only and must not be presented as real semantic retrieval in the final demo.
- If local inference is too slow, assess a smaller local model first. A free external API may be considered only if its current limits and terms are checked; do not make a paid API mandatory.

## 11. Environment variables

Provide placeholders in `.env.example`:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d

DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=sentinelrag

UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=choose_installed_embedding_model
OLLAMA_CHAT_MODEL=choose_installed_chat_model
EMBEDDING_DIMENSIONS=verify_from_selected_model
```

Never commit real credentials. Set `EMBEDDING_DIMENSIONS` to the actual model output dimension and make the database vector column match it.

## 12. Definition of done

A feature is done only when its happy path, a relevant failure path, and its key authorization rule have been tested. Prefer a small reliable end-to-end path over many incomplete screens.
