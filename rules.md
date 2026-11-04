# SentinelRAG-X — Development Rules for Antigravity

These rules are project constraints. Follow them throughout planning, coding, and revisions.

## 1. Scope and working style

1. Build a **three-week academic prototype**, not a production platform.
2. Use plain JavaScript only. Do not introduce TypeScript.
3. Use one React frontend, one Node.js/Express backend, and one PostgreSQL database with pgvector.
4. Build a modular monolith, not microservices.
5. Prefer the simplest correct implementation.
6. Implement in small, testable steps; do not generate the entire app in one giant change.
7. Before coding a phase, inspect the repository and report intended file changes.
8. Do not silently change the approved stack, schema, API contracts, or scope.
9. Never claim a feature works until it has been run and tested.
10. Keep README and setup instructions aligned with the actual implementation.

## 2. Technology rules

### Use
- React + Vite + JavaScript.
- Node.js + Express + JavaScript.
- PostgreSQL with pgvector as the single database/vector-search solution.
- `pg` (node-postgres) with parameterized SQL.
- `bcryptjs` for password hashing.
- `jsonwebtoken` for JWT authentication.
- `zod` for input validation.
- `multer` for controlled uploads.
- Ollama for local embeddings and local answer generation, behind small service functions.
- Vitest or Jest + Supertest for useful tests.
- Plain CSS initially; Tailwind is optional, not required.

### Avoid
- TypeScript.
- MySQL or a second database.
- Paid APIs or any feature requiring a paid subscription/credit card for the core demo.
- Prisma/ORM unless the team explicitly approves a concrete benefit; use `pg` and clear SQL.
- LangChain/LlamaIndex in the first implementation. Build the basic chunking, embedding, retrieval, and prompting flow transparently so the team learns it.
- Microservices, Kubernetes, Redis, message queues, event buses, and distributed systems.
- Fine-tuning, model training, autonomous agents, or complex orchestration.
- Premature optimization, excessive abstraction, and unnecessary dependencies.
- Large UI libraries if simple CSS is sufficient.

## 3. Security rules — required even for a prototype

- Never store plaintext passwords. Hash with bcryptjs.
- Never return `password_hash` from an API.
- Never hardcode JWT secrets, database passwords, or credentials.
- Use `.env` locally and commit only `.env.example`.
- Use parameterized SQL for every query involving input.
- Validate request data and enforce upload size/type restrictions on the server.
- Generate safe server-side filenames; never trust uploaded filenames as filesystem paths.
- Keep uploaded files outside the public static directory.
- Protect private routes with authentication middleware.
- Protect admin routes with role middleware.
- Enforce document-level permissions in backend services and SQL queries.
- Do not rely on frontend visibility or disabled buttons for authorization.
- Apply permission and quarantine filters before retrieval context is sent to the LLM.
- Do not log passwords, JWTs, secrets, or unnecessary document contents.
- Return safe errors; do not expose stack traces, SQL details, hashes, or filesystem paths.
- Configure CORS for the expected local frontend origin.
- Use Helmet and a basic login rate limit where practical.

## 4. RAG and pgvector correctness rules

- Use the same embedding model for document chunks and user questions.
- Verify the embedding dimension from an actual model response/documentation. The PostgreSQL `vector(N)` dimension must match it.
- Do not mix vectors from different embedding models in the same retrieval index.
- Preserve document ID, chunk index, and page number where available.
- Use pgvector cosine distance (`<=>`) consistently for cosine-based retrieval.
- Remember: lower cosine distance means more similar. If showing a similarity value, derive and label it consistently.
- Similarity is relevance, not truth or trust.
- Return source chunks and metadata, not just a score.
- Instruct the LLM to answer only from supplied context and state when evidence is insufficient.
- Return source references for the passages used.
- Never send inaccessible or quarantined text to the model, regardless of similarity.
- If Ollama is unavailable, return a clear service-unavailable response; do not fabricate an answer.
- Tune retrieval thresholds using sample questions; do not claim a universal scientifically validated threshold.

## 5. Sentinel rules

- Keep evidence assessment transparent and rule-based.
- Use a small set of explainable signals; document what the score means and does not mean.
- Quarantine is an explicit exclusion state, not merely a low ranking.
- Quarantined chunks must be excluded from normal retrieval by default.
- Only an admin may quarantine or restore content.
- Record a reason for quarantine/restore.
- Write audit events for uploads, processing failures, permission changes, quarantine, and restore.

## 6. API and code quality rules

- Use REST-style routes under `/api`.
- Keep controllers focused on HTTP input/output.
- Put business logic in service modules and SQL in repository modules, without adding layers that provide no value.
- Use consistent status codes and JSON error formats.
- Avoid duplicated business logic.
- Keep functions small and names descriptive.
- Avoid giant files and giant React components.
- Use async/await and central error handling.
- Test authentication, access restrictions, quarantine filtering, chunking, and vector retrieval.
- Test observable behaviour rather than implementation details.

## 7. Frontend rules

- Keep the interface simple, professional, responsive, and demo-friendly.
- Provide loading, empty, success, and error states.
- Show document processing status.
- Show answer sources clearly and make citations easy to inspect.
- Make insufficient-evidence and AI-service-unavailable states understandable.
- Hide admin controls from standard users, while still enforcing access on the backend.
- Do not spend the schedule on animations or decorative dashboards.

## 8. Git and collaboration rules

- Commit small working increments with descriptive messages.
- Never commit `.env`, private uploads, model weights, `node_modules`, build output, or logs.
- Use non-sensitive sample documents suitable for sharing with the course team.
- Update README when setup, scripts, environment variables, or API behaviour changes.
- Before adding a dependency, explain why it is needed and prefer a maintained minimal package.
- If blocked, report the blocker and propose the smallest workaround rather than expanding scope.

## 9. Antigravity operating instruction

At the start of each phase:
1. Read `prd.md`, `architecture.md`, `rules.md`, `phases.md`, and `design.md`.
2. Summarize the phase goal and acceptance checks.
3. Inspect the current repository.
4. Propose a small plan and list files to change.
5. Wait for approval before broad changes.
6. Implement one vertical slice at a time.
7. Run relevant tests and report exact commands/results.
8. Update documentation and mark tasks complete only when verified.

When requirements conflict, prioritize: (1) security and access control, (2) correct end-to-end prototype behaviour, (3) three-week time limit, (4) optional polish.
