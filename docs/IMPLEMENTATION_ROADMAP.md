# BharatLearn AI — Phased Implementation Roadmap

> **Document Version**: 1.0.0  
> **Status**: Approved Foundation  
> **Target Event**: NIRMIT · NEXTECH 2.0 Agentic AI Hackathon

---

## 1. Roadmap Architecture & Principles

The BharatLearn AI implementation roadmap is structured into disciplined, incremental stages. Each stage is self-contained, strictly testable, and builds directly on prior artifacts without discarding working code.

```
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 0: Foundations, Architecture & Project Directives (COMPLETED)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: Data Models, Pydantic Schemas & Agent Tool Harness           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: LangGraph Pedagogical State Machine & Gemini Integration     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: Odia Science Pilot Content Bank & Backend FastAPI Endpoints  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: React 19 Frontend — Adaptive Learner UI & Multi-Axis Lang    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: Offline Resilience — PWA, IndexedDB Store & Sync Reconciler  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STAGE 6: Teacher Cockpit, Misconception Heatmaps & Hackathon Polish   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│  FUTURE EXTENSIONS: Pan-India 22-Language Scale & 9 Learner Cohorts    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Milestone Specifications

### Stage 0: Foundations, Architecture & Project Directives *(Completed in this task)*
- [x] Establish root `AGENTS.md` with immutable engineering directives.
- [x] Create comprehensive architectural blueprints in `/docs/`.
- [x] Define multi-axis language strategy and pilot scope (Odia Class 9–10 Science).
- [x] Author database relational schemas, index strategies, and security policies.
- [x] Document offline-first sync models and test acceptance criteria.

---

### Stage 1: Real Agentic AI Learning Engine & Tool Registry *(Completed in Prompt 5)*
- **Focus**: Core backend structures, 8-stage state machine, and verified tool registry.
- **Completed Deliverables**:
  1. `server/agents/pedagogicalAgent.ts`: Explicit 8-stage pedagogical loop (`RECEIVE_REQUEST → ASSESS_CONTEXT → CREATE_PLAN → SELECT_TOOL → EXECUTE_TOOL → VERIFY_RESULT → UPDATE_LEARNER_STATE → RESPOND`).
  2. `server/tools/registry.ts`: 10 strictly-typed tools with RBAC validation, timeouts, and execution audit logging:
     - `getLearnerProfile`, `getLearningProgress`, `searchLearningResources`
     - `createStudyPlan`, `getPracticeQuestions`, `checkAnswer`
     - `explainConcept`, `recordLearningActivity`, `updateStudyPlan`
     - `requestParentUnlock`
  3. `server/services/learningStateService.ts`: Persistent storage of learner profiles, study plans, mastery vectors, and idempotent activity logging.
  4. `src/pages/CompanionEntryPage.tsx`: Live observable 8-stage Agent Activity Panel, 3-tier depth switching (`SIMPLER` / `STANDARD` / `DEEPER`), interactive question drills, and progressive hints.
  5. `tests/agentEngine.test.ts`: Automated test suite verifying all 8 critical agent scenarios (36 passed, 0 failed).


---

### Stage 2: Working Application Foundation *(Completed)*
- [x] Complete 10-page React 19 + TypeScript application shell.
- [x] All 8 learner cohorts implemented and accessible.
- [x] 22 constitutionally scheduled languages registry with Odia pilot.
- [x] Accessible dashboard, subject explorer, AI companion, and settings.

---

### Stage 3: Parental Controls, Study Focus & Screen-Time Management *(Completed)*
- [x] Parent Account managing up to 2 linked children (Subhashree Mohanty, Class 10 & Soumya Mohanty, Class 4).
- [x] Separate student identities, private learning records, and role-based permissions.
- [x] Age-and-Class-based default policies (Mandatory for Classes 1–10; optional for 11–12).
- [x] Study Focus Engine with 5 activities: Lessons, Homework, Practice Quizzes, Educational Videos, and Reading.
- [x] Inactivity tracking thresholds:
  - 1-minute: Parent notification alert logged in audit trail.
  - 5-minute: Empathetic re-engagement modal with break suggestion.
  - 10-minute: Auto-lock/restriction requiring parent unlock or PIN override.
- [x] Screen-time management: Daily limits, continuous study session caps, mandatory breaks, study hours windows.
- [x] Optional & consent-governed camera-assisted focus assistance with local sandbox video preview and zero cloud telemetry.
- [x] Parent unlock and override workflows: In-app unlock request submission and direct on-device Parent PIN override.
- [x] Parent Portal UI with real-time status, screen-time meters, policy controls, pending requests, and student switcher.

---

### Stage 4: React 19 Frontend — Adaptive Learner UI & Multi-Axis Language
- **Focus**: High-fidelity, accessible learner experience.
- **Deliverables**:
  1. Responsive, mobile-first learner interface with high-contrast Odia typography.
  2. Step-by-step interactive question runner with immediate feedback animations.
  3. Visual analogy repair view displaying localized illustrations and step-by-step breakdowns.
  4. 4-axis language switcher widget (`ui_lang`, `explanation_lang`, `instructional_lang`, `assessment_lang`).

---

### Stage 5: Offline Resilience — PWA, IndexedDB Store & Sync Reconciler
- **Focus**: Intermittent network resilience.
- **Deliverables**:
  1. Service Worker registration with cache-first static asset strategy.
  2. Client-side IndexedDB repository (`OfflineStore`) storing downloaded chapter packs.
  3. Mutation queue recording offline quiz submissions.
  4. Automatic background sync manager triggered on network restoration with retry limits.
  5. UI offline status indicator and feature gating for server-only actions.

---

### Stage 6: Teacher Cockpit & Hackathon Demonstration Polish
- **Focus**: Educator oversight, misconception analytics, and comprehensive demo flow.
- **Deliverables**:
  1. Teacher dashboard displaying class-wide misconception heatmaps across Odia science topics.
  2. Printable/exportable board revision worksheet generator.
  3. Interactive demo mode showcasing full offline-to-online sync replay.
  4. Final performance, latency, and accessibility audit.

---

## 3. Future Horizon (Post-Hackathon Roadmap)

- **Phase 2 (Pan-India Scale)**: Expand to Hindi, Bengali, Telugu, Tamil, and Marathi across CBSE, ICSE, and UP/Maharashtra/Karnataka state boards.
- **Phase 3 (Full 9-Cohort Coverage)**: Roll out specialized tracks for Competitive Exams (JEE/NEET in vernaculars), Foundational Primary Literacy (FLN voice games), and ITI Vocational Trades.
- **Phase 4 (Bhashini Real-time Voice)**: Integrate Government of India Bhashini APIs for real-time speech-to-speech tutoring in regional rural dialects.
