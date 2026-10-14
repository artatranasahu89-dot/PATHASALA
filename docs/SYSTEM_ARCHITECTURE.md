# BharatLearn AI — System Architecture Specification

> **Document Version**: 1.0.0  
> **Status**: Approved Foundation  
> **Target Event**: NIRMIT · NEXTECH 2.0 Agentic AI Hackathon

---

## 1. High-Level Architecture Topology

BharatLearn AI is built as a distributed, service-oriented web application designed to withstand intermittent connectivity while delivering stateful, observable agentic workflows.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER / PWA)                         │
│                                                                         │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ React 19 UI Engine    │  │ Offline Storage   │  │ Service Worker  │  │
│  │ (Vite, TS, Tailwind)  │  │ (IndexedDB / Dexie)│ │ (Cache Storage) │  │
│  └───────────┬───────────┘  └─────────▲─────────┘  └────────▲────────┘  │
│              │                        │                      │          │
│              ▼                        ▼                      │          │
│      [Sync Manager & Background Mutation Queue]──────────────┘          │
└──────────────────────────────────────┬──────────────────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (PYTHON / FASTAPI GATEWAY)                   │
│                                                                         │
│  ┌───────────────────────┐  ┌───────────────────┐  ┌─────────────────┐  │
│  │ Auth & RBAC Security  │  │ REST & WebSocket  │  │ Idempotent Sync │  │
│  │ (JWT / Secure Session)│  │ Routers           │  │ Controller      │  │
│  └───────────┬───────────┘  └─────────┬─────────┘  └────────┬────────┘  │
│              │                        │                      │          │
│              ▼                        ▼                      ▼          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │              AGENT ORCHESTRATION LAYER (LANGGRAPH)                │  │
│  │                                                                   │  │
│  │  StateGraph Engine ───> Pedagogical Policy ───> Tool Executor     │  │
│  │         │                                             │           │  │
│  │         ▼                                             ▼           │  │
│  │  [Session Checkpointer]                    [Verified Tool Registry]│  │
│  └───────────────────┬───────────────────────────────────┬───────────┘  │
└──────────────────────┼───────────────────────────────────┼──────────────┘
                       │                                   │
                       ▼                                   ▼
        ┌─────────────────────────────┐     ┌────────────────────────────┐
        │     POSTGRESQL DATABASE     │     │      EXTERNAL SERVICES     │
        │                             │     │                            │
        │ - User Profiles & Roles     │     │ - Google Gemini API        │
        │ - Curricula & Content Bank  │     │   (2.5-Pro / 2.5-Flash)    │
        │ - Knowledge State Vectors   │     │ - Regional TTS/STT         │
        │ - Tool Traces & Audit Logs  │     │   (Bhashini / Fallback)    │
        └─────────────────────────────┘     └────────────────────────────┘
```

---

## 2. Component Responsibilities

### 2.1 Frontend Client (React 19, TypeScript, Vite)
- **Role**: Presentation, user interaction, client-side routing, speech playback, local state management, and offline operation.
- **Key Modules**:
  - `LearnerApp`: Main adaptive learning flow with question display, step-by-step guidance, and real-time explanation rendering.
  - `OfflineStore`: Client-side persistence layer utilizing IndexedDB for downloaded chapter packs and pending interaction events.
  - `SyncManager`: Background monitor that detects network transitions and pushes queued mutations to the backend.
  - `LanguageSelector`: Independent 4-axis language control (`ui_lang`, `explanation_lang`, `instructional_lang`, `assessment_lang`).

### 2.2 Backend Gateway (Python, FastAPI, Pydantic v2)
- **Role**: API routing, request validation, authentication, authorization, session state management, and rate limiting.
- **Key Modules**:
  - `api/auth`: Phone/OTP and token validation.
  - `api/learn`: Endpoints for initiating learning steps, answering diagnostic questions, and retrieving chapter packs.
  - `api/sync`: Idempotent batch sync handler for offline transactions.
  - `api/teacher`: Diagnostic analytics and class-level misconception reports.

### 2.3 Agent Orchestration Layer (LangGraph)
- **Role**: Executes the multi-step pedagogical loop. Unlike simple prompt-response chains, the agent maintains an explicit execution graph with conditional branching, tool invocation, safety guards, and trace logging.
- **Key Modules**:
  - `AgentState`: Pydantic model representing active learner session, current concept node, working memory, and tool execution history.
  - `Nodes`: `load_context_node`, `plan_action_node`, `tool_execution_node`, `evaluate_response_node`, `update_knowledge_node`, `remediation_branch_node`.
  - `ToolRegistry`: Validated execution harness enforcing timeouts, schema checks, and permission checks.

### 2.4 Persistence Layer (PostgreSQL)
- **Role**: Single source of truth for users, curriculum taxonomy, question banks, learner mastery states, and diagnostic event streams.
- **Access Pattern**: Handled via SQLAlchemy ORM (async) with migrations managed strictly by Alembic.

---

## 3. Frontend-to-Backend Communication

1. **Standard REST Endpoints**: Used for stateless operations, profile retrieval, chapter pack downloads, and offline batch sync. All payload contracts are strictly typed using Pydantic on the backend and TypeScript interfaces on the frontend.
2. **Server-Sent Events (SSE) / Streaming**: Used for agent responses to provide instantaneous, token-by-token feedback to learners on slow connections, rendering explanations progressively.
3. **Idempotency Headers**: Every state-altering HTTP request includes an `X-Client-Action-ID` (UUIDv4). The backend records processed IDs in an `idempotency_keys` table to prevent double-scoring or duplicate progress logs.

---

## 4. Agent Orchestration & Tool Execution Flow

```
[Incoming Learner Action]
         │
         ▼
[StateGraph.invoke(current_state)]
         │
         ├─► [load_context_node] ───► Fetches learner profile, recent errors, active goal
         │
         ├─► [diagnose_node]     ───► Inspects BKT mastery vector for active concept
         │
         ├─► [plan_action_node]  ───► Determines action: EXPLAIN | PRACTICE | REMEDIATE | ADVANCE
         │
         ├─► [tool_exec_node]    ───► Executes tool (e.g. `generate_practice_questions` or `search_approved_learning_content`)
         │                            - Schema validation
         │                            - Permission check
         │                            - Execution within 5s timeout
         │                            - Provenance verification (source citation)
         │
         ├─► [evaluate_node]     ───► Analyzes learner answer against rubric and concept misconceptions
         │
         ├─► [update_state_node] ───► Calculates updated mastery probability; saves checkpoint
         │
         └─► [output_node]       ───► Formats age-appropriate bilingual response
```

---

## 5. Database Boundaries & Data Ownership

| Domain Boundary | Tables | Primary Purpose | Ownership & Access Rules |
|---|---|---|---|
| **Identity & Access** | `users`, `roles`, `guardian_links` | Authentication, credentials, role mapping | Admin management; users read self |
| **Curriculum & Content**| `curricula`, `subjects`, `chapters`, `concepts`, `content_blocks`, `question_bank` | Sourced educational material, verified Odia glossaries | Read-only for learners; authoring by Teachers/Admins |
| **Learner Mastery** | `learner_mastery`, `concept_diagnostics`, `misconception_logs` | Dynamic knowledge estimates (BKT) | Student reads self; assigned Teacher reads class; Agent updates |
| **Agent Execution** | `agent_sessions`, `agent_traces`, `tool_logs` | Audit trail of all tool executions, LLM calls, and decisions | Admin audit; read-only for internal observability |
| **Offline Sync** | `sync_records`, `idempotency_keys` | Reconciliation of offline activities | System owned |

---

## 6. Authentication and Authorisation (RBAC)

1. **Token Authentication**: Short-lived JSON Web Tokens (JWT, 60 minutes) paired with rotating refresh tokens stored in HTTP-only, secure, SameSite=Strict cookies (or secure client storage for PWA).
2. **Role Hierarchy**:
   - `STUDENT`: Read/write self progress, read curriculum.
   - `TEACHER`: Read student progress for assigned school/class; author lesson plans.
   - `ADMIN`: Global configuration, curriculum approval, agent policy tuning.
3. **Permission Enforcement**: Backend dependency injection `SecurityScopes` enforces access control on every endpoint and tool call.

---

## 7. Gemini Integration & Secret Management

1. **Architecture Isolation**: The Gemini API key (`GEMINI_API_KEY`) is stored solely in server environment variables (managed via Google Cloud Run / Secret Manager).
2. **SDK & Models**:
   - Google GenAI SDK (`@google/genai` or Python `google-genai`).
   - `gemini-2.5-pro`: Complex pedagogical planning, misconception diagnosis, dialect alignment.
   - `gemini-2.5-flash`: Fast response formatting, real-time rubric checking, vocabulary translation.
3. **Prompt Injection & Safety Boundary**:
   - User inputs are wrapped in structured data envelopes and never concatenated directly into system instructions.
   - Outputs are checked against safety blocks and curriculum grounding rules before delivery.

---

## 8. Offline Execution & Synchronisation

1. **Local Storage**: IndexedDB stores static chapter metadata, approved Odia questions, glossary definitions, and the pending mutation queue.
2. **Service Worker**: Intercepts requests for static assets, fonts (Kalinga/Nirmala), and pre-downloaded curriculum packs.
3. **Reconciliation Strategy**: Client uses an append-only event queue (`client_action_id`, `event_type`, `payload`, `timestamp`). When network connectivity is restored, the client posts batches to `/api/sync/batch`. The backend processes events sequentially in a database transaction, rejecting conflicts with deterministic resolution (server-authoritative timestamps for mastery calculations).

---

## 9. Error Handling & Observability

1. **Graceful Tool Degradation**: If an agent tool fails or times out, the agent catches the error, logs a warning trace, and falls back to pre-rendered curriculum content from the database.
2. **Audit Logging**: Every agent step logs:
   - `session_id`, `step_index`, `action_type`, `tool_name`, `input_args`, `execution_time_ms`, `success_flag`, and `error_reason`.
3. **Health Endpoints**: `/healthz` provides live status of the database connection, Gemini API latency, and queue depths.

---

## 10. Deployment Architecture

- **Frontend**: Built via Vite as static assets, served via CDN or lightweight Node.js/Express server (AI Studio runner), with PWA manifest and service worker.
- **Backend**: Containerized FastAPI application running on Cloud Run or container orchestration, scaling from 0 to N instances.
- **Database**: Managed PostgreSQL with connection pooling (e.g. pgBouncer or asyncpg pool).
