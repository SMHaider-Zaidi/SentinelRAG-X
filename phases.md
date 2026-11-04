# SentinelRAG-X — Three-Week Implementation Plan

## Delivery goal

At the end of three weeks, demonstrate a complete small application: users can sign in, an admin can upload documents, the system processes them, authorized users can ask questions, answers show sources, and Sentinel controls prevent unauthorized or quarantined evidence from being used.

Protect the core end-to-end path. Cut optional polish before correctness.

## Phase 0 — Repository and environment (Day 1)

**Goal:** the team can run the skeleton and connect to PostgreSQL + pgvector.

Tasks:
- Create `client` and `server` structure.
- Initialize Vite React app and Express server.
- Configure `.gitignore` and `.env.example`.
- Verify PostgreSQL is installed and running.
- Verify pgvector extension is available on the local PostgreSQL server; install/enable it using OS-appropriate instructions.
- Create project database and enable `vector` extension.
- Connect Express to PostgreSQL using `pg`.
- Add `GET /api/health` and a basic frontend page that calls it.
- Check Node.js/npm, PostgreSQL, and Ollama availability.
- Agree on API response shape, roles, document statuses, vector dimension, and sample dataset.

Acceptance:
- Frontend starts.
- Backend starts.
- Backend connects to PostgreSQL.
- `CREATE EXTENSION vector` succeeds in the project database.
- Health endpoint returns success.
- No secrets, uploads, or model files are committed.

## Phase 1 — Authentication and database foundation (Days 2–4)

**Goal:** secure basic access works before document content is exposed.

Tasks:
- Create users table and safely seed one admin account (hash password; no hardcoded secret).
- Implement registration and login.
- Hash passwords using bcryptjs.
- Issue and verify expiring JWTs.
- Implement authentication and admin-role middleware.
- Implement `/api/auth/register`, `/login`, and `/me`.
- Add basic login/register UI.
- Add validation and safe error handling.

Acceptance:
- User can register and log in.
- Wrong password is rejected.
- Password hash is never returned.
- Protected route rejects missing/invalid token.
- Admin-only route rejects a standard user.

## Phase 2 — Document upload and processing (Days 5–8)

**Goal:** documents become vector-searchable.

Tasks:
- Implement admin PDF/TXT upload with server-side size/type validation.
- Store files under generated safe filenames in local uploads directory.
- Create document records and processing statuses.
- Extract text and preserve page number where available.
- Implement and test a simple chunking strategy with modest overlap.
- Install/configure Ollama and select a small embedding model appropriate for team hardware.
- Verify actual embedding dimension using a test input.
- Enable pgvector and create the `vector(N)` column using that verified dimension.
- Implement embedding service and store chunk text, metadata, and vectors.
- Handle failures and update document status.
- Build a simple document list/upload screen.

Acceptance:
- Admin uploads sample PDF and TXT.
- Processing creates chunks and embeddings.
- Chunks/vectors persist in PostgreSQL.
- Vector dimension matches the embedding output.
- Document status becomes `ready` or clearly `failed`.
- Invalid/oversized files are rejected.
- Ollama failure does not crash the API.

**Checkpoint:** If Ollama or hardware blocks progress, use a mock provider for tests and continue unrelated work. Do not present mock vectors as real semantic search in the final demonstration.

## Phase 3 — Semantic retrieval and RAG answers (Days 9–12)

**Goal:** the app answers questions from documents and cites evidence.

Tasks:
- Embed user questions using the same model as document chunks.
- Implement pgvector cosine-distance retrieval.
- Apply permission, ready-document, and quarantine filters in the retrieval query.
- Add top-k and configurable minimum-evidence rule.
- Assemble bounded context with document title, page, and chunk reference.
- Call Ollama chat model with a grounded-answer prompt.
- Return answer and source references.
- Add chat UI with loading, error, and insufficient-evidence states.
- Test known questions and one question absent from the dataset.

Acceptance:
- Relevant sample question retrieves relevant chunks.
- Answer is grounded in supplied context.
- Sources show document title and page where available.
- Unsupported question gets insufficient-evidence response.
- Ollama unavailable state is clear; no fabricated answer.

## Phase 4 — Sentinel controls and audit (Days 13–16)

**Goal:** demonstrate controlled and traceable retrieval.

Tasks:
- Implement per-document user permissions.
- Ensure document list, detail, and retrieval APIs enforce access.
- Ensure unauthorized documents are excluded before vector results reach context assembly.
- Add chunk/document quarantine state and admin action with reason.
- Ensure quarantined chunks are excluded by the retrieval query before LLM context is built.
- Implement a simple, documented evidence heuristic if required by the SRS.
- Record upload, processing failure, question, permission change, quarantine, and restore events.
- Add minimal admin controls for permissions and quarantine.

Acceptance:
- User A cannot retrieve User B's restricted document.
- Admin can manage documents.
- Quarantined chunks never appear in retrieved context.
- Restored content becomes eligible for retrieval.
- Audit records include actor, event, target, outcome/reason, and timestamp.
- Evidence score, if present, is labelled as a heuristic, not a truth guarantee.

## Phase 5 — Stabilization, tests, and demo (Days 17–21)

**Goal:** make implemented features reliable and easy to present.

Tasks:
- Fix end-to-end bugs before adding features.
- Test registration/login, upload, processing, query, citations, permissions, quarantine, and audit.
- Add tests for password handling, authorization, chunking, pgvector retrieval, and quarantine filtering.
- Test invalid files, empty documents, AI service failure, no matching evidence, and invalid/expired tokens.
- Improve UI spacing, responsive behaviour, statuses, and source display.
- Prepare 3–10 safe sample documents and repeatable demo questions.
- Update README with setup, database/pgvector installation, environment variables, Ollama models, run commands, limitations, and screenshots if useful.
- Ensure team members can start the app from a clean checkout.

Acceptance:
- Fresh setup follows README and runs the app.
- End-to-end demo works without manual database edits.
- Core security and Sentinel acceptance checks pass.
- Known limitations are stated honestly.

## Priority if time slips

Do not sacrifice:
1. Password hashing and protected API routes.
2. PostgreSQL persistence and pgvector extension working.
3. Document extraction and chunking.
4. Real embeddings and semantic retrieval (mock only for tests/development).
5. Grounded answer with source references.
6. Backend permission and quarantine filtering.

Cut/simplify first:
- Analytics dashboard.
- Fancy charts and animations.
- Document preview/download.
- Advanced pagination.
- Complex role management.
- Elaborate trust scoring.
- OCR for scanned PDFs.
- Automated deployment.

## Suggested team split (if four members)

- **Member 1 — RAG:** extraction, chunking, embeddings, pgvector retrieval, answer generation.
- **Member 2 — Backend/security:** Express API, auth, permissions, PostgreSQL integration.
- **Member 3 — Sentinel/data:** quarantine, evidence heuristic, audit logs, test cases.
- **Member 4 — Frontend/integration:** React pages, API integration, chat and document UI.

Agree on schema and API contracts before parallel work. Integrate continuously; do not wait until the final week.

## Daily working rule

At the end of each work session:
- Have one runnable increment or a clearly isolated task.
- Commit working changes with a descriptive message.
- Note what works, what fails, and what comes next.
- Do not merge untested generated code into the main branch.
