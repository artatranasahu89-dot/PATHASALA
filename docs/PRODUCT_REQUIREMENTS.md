# BharatLearn AI — Product Requirements Document (PRD)

> **Document Version**: 1.0.0  
> **Status**: Approved Foundation  
> **Target Event**: NIRMIT · NEXTECH 2.0 Agentic AI Hackathon

---

## 1. Executive Summary & Vision

India's education system encompasses over 250 million school students, 40 million higher education enrollments, and tens of millions of competitive exam and vocational learners spread across 28 states and 8 union territories. However, access to high-quality, personalized instruction is constrained by:
1. **Linguistic Disconnect**: High-quality educational AI and web resources are overwhelmingly concentrated in English, alienating vernacular-medium students.
2. **Connectivity & Device Limitations**: Millions of learners rely on budget smartphones (sub-₹8,000, 2GB RAM) with intermittent 3G/4G connectivity and shared family access.
3. **Passive Consumption vs. Active Pedagogy**: Conventional platforms offer static video lectures or generic chatbot wrappers that hallucinate curricula and cannot diagnose root conceptual misconceptions.
4. **Curricular Diversity**: Educational standards span NCERT/CBSE, ICSE, NIOS, and numerous State Boards with differing syllabi, examination patterns, and terminologies.

**BharatLearn AI** addresses this gap by creating an **agentic, adaptive learning platform** driven by stateful pedagogical workflows, native regional language support (starting with Odia for Classes 9–10 Science), offline resilience, and curriculum-verified content.

---

## 2. Target Learner Categories

BharatLearn AI's modular architecture accommodates nine distinct learner cohorts:

| # | Learner Category | Target Age / Level | Core Needs & Learning Characteristics | Pedagogical Mode |
|---|---|---|---|---|
| **1** | **Primary Education** | Classes 1–5 (Ages 6–10) | Foundational Literacy and Numeracy (FLN), gamified bite-sized concepts, audio-visual storytelling, high parental/teacher oversight. | Story-based, visual discovery, guided audio prompts. |
| **2** | **Middle School** | Classes 6–8 (Ages 11–13) | Transition from concrete to abstract reasoning, introductory science/social sciences, bilingual scaffolding. | Guided inquiry, interactive concept maps, scaffolded practice. |
| **3** | **Secondary Education** *(MVP Pilot)* | Classes 9–10 (Ages 14–16) | Board exam preparation (BSE Odisha, CBSE), rigorous science and math foundation, structured practice, error remediation. | **Diagnostic-driven mastery loop, step-by-step problem solving, board exam simulation.** |
| **4** | **Senior Secondary** | Classes 11–12 (Ages 16–18) | Stream-specific tracks (Science [PCM/PCB], Commerce, Humanities), deep analytical rigor, formula mastery. | Concept breakdown, rigorous derivation analysis, targeted problem banks. |
| **5** | **Higher Education** | Undergraduate & Postgraduate | University curricula, engineering, basic sciences, humanities, research synthesis, conceptual deep dives. | Socratic dialogue, literature/syllabus mapping, self-paced research assistance. |
| **6** | **Competitive Exam Aspirants** | Post-School / College | JEE, NEET, UPSC, SSC, Banking, State PSCs; high-speed problem solving, time management, mock tests, negative-marking tactics. | Timed drills, error pattern analytics, high-yield concept review. |
| **7** | **Vocational & Skill Learners** | Youth / Adults (Ages 16–35) | ITI trades, polytechnic diplomas, solar technician, healthcare nursing assistants, digital/financial skills. | Practical task checklists, visual equipment simulators, vernacular voice tutorials. |
| **8** | **Adult & Continuing Learners** | Adults (Ages 18+) | Functional literacy, digital payments safety, government scheme navigation, agricultural best practices. | Plain vernacular voice, large touch targets, zero educational jargon. |
| **9** | **Teachers & Educators** | School & Tuition Teachers | Lesson planning in regional languages, creating diagnostic quizzes aligned to board blueprints, tracking class-level gap analytics. | Teacher cockpit, automated rubric scoring, differentiated assignment generator. |

---

## 3. Scope of Initial Pilot (MVP)

### 3.1 Pilot Focus: Secondary Science in Odia
- **Target Audience**: Students in Odisha studying in Classes 9 and 10 under the Board of Secondary Education (BSE) Odisha and NCERT/CBSE Odia-medium schools.
- **Pilot Subject**: General Science (Physical Science & Life Science).
- **Pilot Chapters**:
  1. *Class 10 Life Science*: Nutrition & Respiration (ପୋଷଣ ଓ ଶ୍ଵାସକ୍ରିୟା)
  2. *Class 10 Physical Science*: Chemical Reactions & Equations (ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମୀକରଣ)
  3. *Class 9 Physical Science*: Structure of the Atom (ପରମାଣୁର ଗଠନ)
- **Language Mode**:
  - UI Language: Odia (ଓଡ଼ିଆ) with English toggle.
  - Explanation Language: Odia conversational explanation with English technical keywords in parentheses (e.g. *ଆଲୋକ ସଂଶ୍ଳେଷଣ (Photosynthesis)*).
  - Assessment Language: Odia BSE board pattern questions (MCQ, Short Answer, Concept Matching).
- **Core Agent Loop**: Autonomous 12-stage learning workflow running via LangGraph, selecting from 10 verified tools.

---

## 4. Functional Requirements

### 4.1 Authentication & Profile Management
- **FR-AUTH-1**: Phone number / OTP and username-based sign-in optimized for rural and low-digital-literacy contexts.
- **FR-AUTH-2**: Multi-profile support on a single shared household device (e.g. older sibling in Class 10, younger sibling in Class 6).
- **FR-AUTH-3**: Persistent local session storage with PIN-based quick switch on shared devices.

### 4.2 Learner Profile & Diagnostic Engine
- **FR-DIAG-1**: Maintain a dynamic knowledge state vector across curriculum topics: `MasteryState = { NotStarted, Novice, Developing, Competent, Mastered }`.
- **FR-DIAG-2**: Track specific misconception tags (e.g., confusing mass vs. weight, exothermic vs. endothermic reactions).
- **FR-DIAG-3**: Calculate mastery confidence using Bayesian Knowledge Tracing (BKT) or evidence-weighted scoring—never raw ungrounded LLM guesses.

### 4.3 Pedagogical Agent Workflow
- **FR-AGT-1**: Stateful agent graph managing learner state across sessions.
- **FR-AGT-2**: Tool execution for diagnostic retrieval, content querying, question generation, and score recording.
- **FR-AGT-3**: Automatic remediation: if a learner fails a question twice, the agent drops one abstraction level, switches to a concrete real-life analogy from Odisha rural/urban life, and re-evaluates.
- **FR-AGT-4**: Explicit decision auditing: every tool invocation, latency, and reasoning output must be persisted for pedagogical transparency.

### 4.4 Offline-First Capabilities
- **FR-OFF-1**: Complete PWA installation with Service Worker offline caching.
- **FR-OFF-2**: Pre-caching of pilot chapter bundles (text, diagrams, glossaries, practice questions) into IndexedDB.
- **FR-OFF-3**: Offline practice quiz execution with local answer evaluation against cached rubrics.
- **FR-OFF-4**: Automatic background synchronization upon network reconnection with idempotency keys.

### 4.5 Teacher Cockpit (MVP Slice)
- **FR-TCH-1**: Class-level heat map showing misconception prevalence across Odia science topics.
- **FR-TCH-2**: One-click generation of board-aligned printable revision worksheets in Odia.

---

## 5. Non-Functional Requirements

### 5.1 Performance & Latency
- **NFR-PERF-1**: Initial page load under 2.5 seconds on simulated 3G connection (1.5 Mbps, 300ms RTT).
- **NFR-PERF-2**: PWA cached shell load under 800ms when offline.
- **NFR-PERF-3**: Agent tool loop roundtrip under 3.5 seconds for deterministic actions, under 6 seconds for generative evaluations.

### 5.2 Accessibility & Usability (India-Specific)
- **NFR-ACC-1**: Compliance with WCAG 2.1 Level AA standards.
- **NFR-ACC-2**: High-contrast mode for outdoor sunlight viewing on dim mobile displays.
- **NFR-ACC-3**: Support for Odia Kalinga/Nirmala Unicode fonts with appropriate line-height (1.6x) to avoid diacritic clipping.
- **NFR-ACC-4**: Large touch targets (minimum 48x48px) for budget touchscreens.

### 5.3 Reliability & Fault Tolerance
- **NFR-REL-1**: Graceful degradation when Gemini API quotas or network timeouts occur; fall back immediately to curated static chapter content.
- **NFR-REL-2**: 100% data integrity for offline submitted answers during browser crash or battery exhaustion.

---

## 6. Success Metrics & KPIs for Hackathon & Pilot

1. **Agent Tool Execution Rate**: >95% valid tool executions without unhandled exceptions.
2. **Pedagogical Relevance Score**: >90% expert alignment on Odia board science explanations.
3. **Offline Sync Reliability**: Zero duplicate records or lost answers across 100 simulated intermittent disconnections.
4. **Latency Budget Compliance**: 90th percentile response under 4.0 seconds for interactive quiz steps.
