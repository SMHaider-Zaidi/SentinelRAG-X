# SentinelRAG-X — Product Requirements Document

## 1. Project overview

**SentinelRAG-X** is an academic Software Engineering Complex Engineering Problem (CEP) project. It is a small, working Retrieval-Augmented Generation (RAG) application that answers questions from uploaded documents and shows the evidence supporting its answers.

The prototype explores document-based AI with source traceability, basic evidence assessment, document permissions, quarantine, and audit logging.

**Delivery constraint:** build a reliable, demonstrable course prototype within three weeks while balancing other coursework. This is not a production-ready enterprise RAG platform.

## 2. Problem and intended outcome

A language model can produce confident answers without making clear which document supports them. SentinelRAG-X should retrieve relevant passages from a controlled document collection, use those passages to draft an answer, and show the user where the answer came from.

The complete demonstration flow is:

1. A user registers or signs in.
2. An authorized administrator uploads a document.
3. The system extracts text, splits it into chunks, generates embeddings, and stores them.
4. An authorized user asks a question.
5. The system searches only documents that user may access and excludes quarantined content.
6. The LLM answers using retrieved passages and returns source references.
7. Important actions are recorded in an audit log.

## 3. Target users and roles

### Standard user
- Register and sign in.
- View documents they are permitted to access.
- Ask questions about accessible documents.
- Review answers and supporting source references.

### Administrator
- All standard user capabilities.
- Upload and manage documents.
- Grant or revoke document access for users.
- Review processing status.
- Quarantine and restore documents/chunks.
- View basic audit events.

Keep roles simple: `admin` and `user`. Do not build a complex role-management system.

## 4. Functional requirements

### P0 — Required for the prototype

#### Authentication
- Registration and login.
- Store password hashes only; never store plaintext passwords.
- Use bcryptjs (or bcrypt) with an appropriate work factor.
- Issue and verify expiring JWTs.
- Protect private API routes with authentication middleware.
- Restrict administrative routes using role middleware.
- Validate inputs and return safe, consistent errors.
- Never return password hashes or tokens unnecessarily in API responses.

#### Document ingestion
- Admin can upload PDF and TXT files.
- Validate file type and size on the server.
- Store files locally using generated safe filenames; store metadata and file reference in PostgreSQL.
- Extract text, split into chunks, generate an embedding for each chunk, and save text, metadata, and vector.
- Track processing status: `processing`, `ready`, or `failed`.
- Preserve document title, chunk index, and page number where available.
- Handle extraction or embedding failures without crashing the API.

#### RAG question answering
- Accept questions from authenticated users.
- Retrieve relevant chunks using vector similarity search with pgvector.
- Apply document permissions and quarantine filters before retrieved text is sent to the LLM.
- Generate an answer grounded in retrieved passages.
- Return source references: document title, page where available, and a short excerpt.
- If relevant evidence is insufficient, say so rather than inventing an answer.
- Display a clear error if the local AI service is unavailable.

#### Sentinel evidence controls
- Implement a transparent, rule-based prototype evidence assessment. It may use simple signals such as retrieval similarity, source availability, and processing/verification state.
- Store an evidence status such as `normal` or `quarantined`; optionally store a simple trust/evidence score.
- Quarantined content must be excluded from normal retrieval by default.
- Clearly label any score as a prototype heuristic, not proof of truth or a validated credibility measure.
- Admin can quarantine and restore content, with a reason recorded.

#### Permissions
- Users can retrieve only documents they are allowed to access.
- Admin can manage all documents.
- Enforce permissions in backend routes/services and retrieval queries—not just in React.
- A simple per-document, per-user read permission model is sufficient.

#### Audit log
- Record important events: upload, processing failure, permission change, quarantine/restore, and question request. Record login outcomes where practical.
- Store actor, event type, target object, outcome/reason, and timestamp.
- Do not log passwords, JWTs, secrets, or full sensitive document contents.

### P1 — Only if time permits
- Basic document filtering/search and pagination.
- Retry processing for failed documents.
- Simple admin audit-log screen.
- Additional automated integration tests.
- Basic document preview/download, only if safe and straightforward.

## 5. Main user journeys

### Admin uploads a document
1. Admin signs in.
2. Selects a PDF or TXT file.
3. Backend validates and stores it.
4. Processing extracts text, chunks it, creates embeddings, and stores chunks/vectors.
5. UI displays `ready` or `failed`.
6. The action is recorded.

### User asks a question
1. User signs in and opens the chat page.
2. Enters a question.
3. Backend identifies the user and permitted documents.
4. Vector search retrieves eligible chunks only.
5. The system sends the question and selected evidence to the LLM.
6. UI displays the answer and source references.
7. If evidence is insufficient or Ollama is unavailable, the UI explains that clearly.

### Admin quarantines content
1. Admin selects a document or chunk.
2. Admin quarantines it and provides a reason.
3. The change is recorded.
4. Future retrieval excludes the quarantined content.
5. Admin can restore it; restoration is also recorded.

## 6. Acceptance criteria

The prototype is successful when:

- A user can register, log in, and access protected routes.
- Passwords are securely hashed and never returned by the API.
- An admin can upload PDF and TXT documents.
- The system extracts text, creates chunks and embeddings, and persists them in PostgreSQL with pgvector.
- A user can ask a question and receive an answer based on retrieved passages.
- Answers display source references and page numbers where available.
- Unsupported questions receive an insufficient-evidence response.
- A user cannot retrieve content from a document they are not permitted to access.
- Quarantined chunks are not included in retrieval or sent to the LLM.
- Important administrative actions are recorded in audit logs.
- The app can be started from documented setup instructions.

## 7. Explicit non-goals

Do not build these for this course prototype:

- Production-grade security certification or compliance.
- Multi-tenant enterprise architecture.
- Microservices, Kubernetes, distributed processing, or message queues.
- Agentic workflows or autonomous agents.
- Fine-tuning or training a language model.
- Complex hybrid search, reranking pipelines, or knowledge graphs.
- OCR for every scanned-document format.
- Billing, subscriptions, paid APIs, or cloud deployment requirements.
- Guaranteed truth detection or automatic fact verification.
- Large analytics dashboards or elaborate design systems.

## 8. Demo dataset

Use 3–10 small, non-sensitive PDF/TXT documents. Prepare:
- Several questions with known supporting passages.
- At least one question whose answer is absent from the documents.
- One document permission test.
- One quarantine test.

## 9. Constraints and assumptions

- Three weeks of calendar time, shared with other coursework.
- Use free/open-source software and local development tools; no paid API is required.
- PostgreSQL + pgvector is the single database/vector-search solution.
- Ollama is the preferred local runtime for embeddings and answer generation. Model choice depends on hardware.
- Keep AI integration isolated so application development and tests can continue with a mock provider if local inference is temporarily unavailable.
- Small dataset and modest concurrency; prioritize correctness and clarity over scale.
