# BharatLearn AI — Architectural Decision Records (ADR)

> **Document Version**: 1.0.0  
> **Project**: BharatLearn AI (Agentic AI Multilingual Learning Engine)

---

## ADR-001: Explicit 8-Stage Pedagogical Loop vs. Unstructured LLM Chat

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: Standard chat wrappers generate unconstrained text, hallucinate non-existent textbook pages, and fail to track persistent student mastery or respect parental session locks.
- **Decision**: Implemented an explicit 8-stage state machine:
  `RECEIVE_REQUEST → ASSESS_CONTEXT → CREATE_PLAN → SELECT_TOOL → EXECUTE_TOOL → VERIFY_RESULT → UPDATE_LEARNER_STATE → RESPOND`.
- **Consequences**:
  - Gemini (`gemini-3.8-flash`) is used for reasoning, pedagogical planning, and tool selection.
  - Deterministic server code executes all tools, enforces RBAC, validates schemas, verifies results, and persists mastery.
  - Complete observability: Every step generates an immutable `AgentDecisionTrace` and `WorkflowEventAudit`.

---

## ADR-002: Real Typed Tool Registry with Timeout & Grounding Fallbacks

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: The agent requires access to real student data, curriculum chapters, diagnostic question generators, answer validators, and study planners.
- **Decision**: Built a central `ToolRegistry` with 10 typed tools:
  1. `getLearnerProfile`
  2. `getLearningProgress`
  3. `searchLearningResources`
  4. `createStudyPlan`
  5. `getPracticeQuestions`
  6. `checkAnswer`
  7. `explainConcept`
  8. `recordLearningActivity`
  9. `updateStudyPlan`
  10. `requestParentUnlock`
- **Consequences**:
  - All tools are bound to a strict timeout (2000ms–5000ms) with `Promise.race`.
  - All educational content is grounded against authentic BSE Odisha Class 9–10 Science, CBSE NCERT, and Primary datasets.
  - Curated deterministic fallbacks guarantee 100% availability even during transient network or API dropouts.

---

## ADR-003: Three-Tier Pedagogical Depth & Localized Cultural Analogies

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: Rural and first-generation learners often struggle with dense textbook jargon. Merely rephrasing with generic machine translation does not build conceptual intuition.
- **Decision**: Built a 3-tier depth toggle:
  - `STANDARD`: Balanced, board-exam aligned conceptual explanation.
  - `SIMPLER`: Intuitive explanation using local cultural analogies from Odisha everyday life (e.g., Chilika lake ecology, earthen pots, hand-pump photolysis analogies).
  - `DEEPER`: Comprehensive exam-drill mode with biochemical equations, reactions, and distinction tables.
- **Consequences**:
  - High engagement across diverse student comprehension levels.
  - Preserves academic rigor while fostering intuitive conceptual grasp.

---

## ADR-004: Parental Control & Study Session Hard Boundaries

- **Date**: 2026-10-14
- **Status**: Accepted
- **Context**: Inactivity (10 min) or daily screen-time limits set by parents must be strictly enforced on the server.
- **Decision**: The agent checks the active study session in `ASSESS_CONTEXT`. If the session is `RESTRICTED`, the agent halts instruction and only allows the student to trigger `requestParentUnlock`.
- **Consequences**:
  - Students cannot bypass screen-time restrictions by manipulating frontend chat state.
  - Transparent notification and unlock workflow for parents.

---

## ADR-005: 8-Stage Pedagogical Agent Loop, 10-Tool Registry & Observable Telemetry

- **Date**: 2026-10-14
- **Status**: Implemented & Verified
- **Context**: Prompt 5 requires replacing open-ended single-turn conversational LLM prompts with an explicit 8-state pedagogical state engine (`RECEIVE_REQUEST → ASSESS_CONTEXT → CREATE_PLAN → SELECT_TOOL → EXECUTE_TOOL → VERIFY_RESULT → UPDATE_LEARNER_STATE → RESPOND`), a typed 10-tool registry with RBAC and timeouts, persistent study plan and mastery stores, and automated verification.
- **Decision**:
  - Implemented `PedagogicalAgent` in `server/agents/pedagogicalAgent.ts` executing the formal 8-stage loop.
  - Built `ToolRegistry` in `server/tools/registry.ts` with 10 typed tools enforcing RBAC context, argument schemas, timeouts, and execution audits.
  - Built `LearningStateService` in `server/services/learningStateService.ts` for real persistent mastery vectors, study plans, diagnostic answer history, and idempotent activity logging.
  - Re-engineered `GeminiService` using `gemini-3.8-flash` with structured JSON schemas and curriculum fallbacks from BSE Odisha / NCERT.
  - Redesigned `CompanionEntryPage.tsx` with a live visible 8-stage Agent Activity Panel, depth switching (`SIMPLER` / `STANDARD` / `DEEPER`), interactive question drills, and progressive hints.
  - Added automated test suite `tests/agentEngine.test.ts` covering all 8 prompt scenarios (36 passing assertions, 0 failures).
- **Consequences**:
  - Full observability of agent decisions, tool invocations, and execution latencies.
  - Cross-learner isolation and parental lock boundaries mathematically enforced on the server.
  - High resilience with seamless fallbacks under API timeouts or rate limits.

