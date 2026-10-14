# AGENTS.md — BharatLearn AI Engineering & Agent Instructions

> **Permanent Directive for AI Coding Agents and Human Engineers**  
> This file establishes mandatory rules, principles, and architectural standards for all development on **BharatLearn AI** (NIRMIT · NEXTECH 2.0 Agentic AI Hackathon). Every subsequent session and coding task MUST comply with these instructions.

---

## 1. Prime Directives for Coding Agents

1. **Read Before Writing**:
   - Always read `AGENTS.md` and relevant design documents in `/docs/` before making modifications.
   - Inspect existing files and reuse established models, utilities, schemas, and components.
2. **Never Replace Working Features Merely to Simplify**:
   - Do not degrade, mock out, or delete existing features or working logic to make a new feature easier to implement.
   - Preserve working endpoints, tests, UI controls, and agent workflows.
3. **Make Small, Incremental, Testable Changes**:
   - Deliver code in coherent, focused increments.
   - Never generate large unverified dumps of code.
4. **Follow Established Architectural Boundaries & Contracts**:
   - Strictly maintain separation between:
     - **Frontend**: React (v19) + TypeScript + Vite + Tailwind CSS.
     - **Backend / Agent Service**: Express + TypeScript in `server/` (or Python FastAPI when a separate Python runtime is explicitly configured), structured into routers, services, agents, and tools.
     - **Agent Orchestrator**: Explicit state machine with typed state schemas, checkpoints, and observable tool traces.
     - **Data & Model Layer**: Typed entity schemas, PostgreSQL/in-memory repository, and Google GenAI SDK (`@google/genai`).
     - **Offline Layer**: IndexedDB + Service Worker with deterministic sync queue and conflict resolution.
5. **No AI Slop, No Fake Controls, No Fabricated Capabilities**:
   - Never render non-functional buttons, fake status badges, or mock data disguised as live backend results.
   - Never claim an AI or speech service is available in a language when it has not been implemented and tested.
   - Ground all learning recommendations and diagnostic assertions in actual evidence or approved curriculum content.
6. **Strict Security and Secret Hygiene**:
   - **Never** expose `GEMINI_API_KEY`, database passwords, or JWT secrets to the client browser, source control, client logs, or responses.
   - All LLM operations must execute exclusively via the secure backend proxy/agent service.
7. **Database & Schema Rigor**:
   - Strictly maintain schema migrations or versioned entity definitions.
   - Never run raw unverified schema mutations.
8. **Add and Run Tests for All Critical Paths**:
   - Every agent tool, authorization rule, sync algorithm, and state transition must have automated verification.
   - Keep the application compiling cleanly (`npm run lint`, `npm run build`).
9. **Keep Documentation Synchronized**:
   - Keep the 5 core documents in `/docs/` updated: `PRODUCT_REQUIREMENTS.md`, `SYSTEM_ARCHITECTURE.md`, `AGENT_DESIGN.md`, `SECURITY_AND_PRIVACY.md`, and `IMPLEMENTATION_ROADMAP.md`.
10. **Ask Before Destructive Operations**:
    - Never run destructive data actions, database drops, or major library migrations without explicit consent.
    - Never delete learner data or progress logs.

---

## 2. Core Architecture Rules

### 2.1 Technology Stack Consistency

| Layer | Approved Technology | Prohibited Alternatives |
|---|---|---|
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS | Vanilla JS, raw unimported CSS files, inline styling styles |
| **Backend API** | Express with TypeScript (`server/`), or Python FastAPI | Unstructured scripts, direct frontend Gemini calls |
| **Agent Engine** | Deterministic stateful pedagogical loop & tool registry | Unstructured single-prompt LLM chat loops, direct raw string prompts in UI |
| **AI Provider** | Official Google GenAI SDK (`@google/genai`) via backend | Direct browser calls to Gemini, third-party unvetted proxies |
| **Data Layer** | Relational / Typed repositories with schema migrations | Unvalidated schema-less stores for critical academic records |
| **Client Storage** | IndexedDB (`idb`) + PWA Cache API | `localStorage` for large content or sensitive educational records |

### 2.2 Agentic Workflow Discipline
A chat UI that outputs text directly from a prompt does **NOT** count as an agent. The BharatLearn AI core agent must execute an explicit, stateful, goal-directed loop:
```
[1. Load Profile & Progress] 
       │
[2. Identify Learning Goal] 
       │
[3. Inspect Diagnostic Evidence] 
       │
[4. Plan Next Pedagogical Action (Policy + Reasoning)]
       │
[5. Tool Selection & Execution (with RBAC & Timeout)]
       │
[6. Validate Tool Output & Content Provenance]
       │
[7. Deliver Age-Appropriate Multilingual Step]
       │
[8. Evaluate Learner Response / Interaction]
       │
[9. Update Mastery & Knowledge-State Estimate]
       │
[10. Branching Decision: Repeat / Simpler / Practice / Advance]
       │
[11. Persist State, Decision Trace & Outcome]
       │
[12. Queue Follow-up / Spaced Repetition if needed]
```

### 2.3 Tool Registry Standards
Every agent tool must:
1. Reside in backend module `backend/app/agent/tools/`.
2. Have strict Pydantic input (`ArgsSchema`) and output schemas.
3. Validate user session permissions (`require_role` / `verify_learner_access`).
4. Execute with timeouts (default 5.0 seconds for internal queries, 10.0 seconds for AI-assisted tools).
5. Return structured, serializable responses including an audit entry (`tool_name`, `elapsed_ms`, `status`, `error_code`).
6. Fall back gracefully to curated static curriculum content if external services fail.

---

## 3. Multilingual Strategy Standards
1. **Four Independent Language Dimensions**:
   - `ui_language`: Language used for navigation, buttons, and app shell.
   - `explanation_language`: Language used for teaching, conceptual analogies, and AI scaffolding.
   - `instructional_language`: Language of the official curriculum/textbook (e.g. Odia medium or English medium).
   - `assessment_language`: Language in which questions are framed and answers are submitted.
2. **No Literal Machine-Translation Blunders**:
   - Subject-matter terms (e.g., Photosynthesis = "ଆଲୋକ ସଂଶ୍ଳେଷଣ" in Odia) must come from approved glossary mappings.
   - Explanations must use local culturally-resonant analogies (e.g., Odisha regional geography, local farming, Chilika lake ecology).
3. **Truth in Capabilities**:
   - Clearly document TTS/STT and LLM translation capabilities per language in `docs/INDIAN_LANGUAGE_STRATEGY.md`.
   - Never promise real-time voice recognition for a dialect or scheduled language unless explicitly integrated and verified. Provide text input and keyboard alternatives as default fallbacks.

---

## 4. Offline & Low-Bandwidth Principles
1. **Low-Resource Environments First**:
   - Design for sub-₹8,000 Android devices with 2GB RAM and 3G/intermittent 4G connectivity.
   - Initial bundle size must remain under 300KB gzipped.
2. **Offline Capability Boundaries**:
   - **Allowed Offline**: Reading cached lessons, practicing pre-downloaded question sets, viewing past progress, taking offline assessments, queueing answers.
   - **Requires Online**: Fresh generative remediation, open-ended voice interaction, real-time live teacher sync.
   - UI must clearly display an **Offline Badge** and inform the learner: *"Working offline. Your 4 completed answers will sync automatically when connected."*
3. **Idempotent Sync Queue**:
   - Every mutation generated offline must carry a client-generated UUID (`client_action_id`) and timestamp.
   - Backend sync endpoints must guarantee idempotency: retrying the same payload must not duplicate marks, XP, or progress events.

---

## 5. Security, Minors & Role-Based Access Control (RBAC)

1. **Role Separation**:
   - `STUDENT`: Can only read/write their own enrolled learning records, answers, and profile.
   - `TEACHER`: Can only view assigned classes, students within those classes, and aggregate diagnostics; can author approved lesson modules.
   - `ADMIN`: Platform operations, curriculum audit, user lifecycle management.
2. **Child Safety and Minors' Privacy**:
   - Minors (Classes 1–10) must never have their PII exposed.
   - No open, unmoderated social feeds or direct messaging between unverified accounts.
   - Strictly filter all LLM prompt responses for child safety (COPPA / Indian DPDP Act 2023 principles).

---

## 6. Development Workflow for Each Task

When starting any task on BharatLearn AI:
1. **Step 1**: Check `docs/IMPLEMENTATION_ROADMAP.md` to identify the current milestone and scope.
2. **Step 2**: Read the relevant doc (`AGENT_DESIGN.md`, `API_CONTRACTS.md`, etc.).
3. **Step 3**: Implement backend logic, schemas, and tests first.
4. **Step 4**: Implement frontend UI consuming the typed contracts.
5. **Step 5**: Run test suites (`npm test` and `npm run lint`).
6. **Step 6**: Update documentation and log decisions in `docs/DECISIONS.md`.

---

## 7. Real Agentic AI Learning Engine (Prompt 5 Implementation)

The system implements the mandatory 8-stage agentic state machine:
`RECEIVE_REQUEST → ASSESS_CONTEXT → CREATE_PLAN → SELECT_TOOL → EXECUTE_TOOL → VERIFY_RESULT → UPDATE_LEARNER_STATE → RESPOND`

### Registered & Enforced Tools:
1. `getLearnerProfile`: Retrieves verified Class, medium, and minority status with cross-learner RBAC.
2. `getLearningProgress`: Delivers persistent mastery scores, activity counts, and tracked concepts.
3. `searchLearningResources`: Searches curriculum-aligned textbooks and local educational bundles.
4. `createStudyPlan`: Creates personalized milestones based on available study minutes and learner goals.
5. `getPracticeQuestions`: Delivers multi-tier practice questions with native Odia/English prompts.
6. `checkAnswer`: Evaluates submissions, detects misconceptions, updates mastery vectors, and triggers re-plans.
7. `explainConcept`: Multi-depth conceptual explanations with rural Odisha cultural analogies and curriculum provenance.
8. `recordLearningActivity`: Persists learning events with client idempotency key guarantees.
9. `updateStudyPlan`: Modifies active milestones and tracks completion.
10. `requestParentUnlock`: Submits emergency unlock requests when parental screen-time or inactivity limits trigger.

