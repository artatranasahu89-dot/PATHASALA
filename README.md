# BharatLearn AI (ଭାରତଲର୍ଣ୍ଣ ଏଆଇ / भारतलर्न एआई)

> **Agentic, Adaptive, Multilingual EdTech Platform for India**  
> Developed for the **NIRMIT · NEXTECH 2.0 Agentic AI Hackathon**

---

## 1. Project Overview

**BharatLearn AI** is an agentic, inclusive, and multilingual learning platform engineered to dismantle the systemic barriers of language, connectivity, and curriculum disparity across India. Rather than serving as a standard chatbot or static video repository, BharatLearn AI employs a **stateful, autonomous LangGraph learning agent** that continuously diagnoses knowledge gaps, generates culturally grounded explanations, runs interactive diagnostic assessments, and adapts dynamically to each learner's pace.

### Pilot Implementation
- **Target Learner**: Secondary Education (Classes 9 & 10)
- **Subject**: General Science (Physical & Life Sciences aligned with Odisha Board BSE & NCERT)
- **Pilot Language**: **Odia (ଓଡ଼ିଆ)** with seamless code-switching to English terminology
- **Architecture**: Designed for direct extensibility to all 22 Eighth-Schedule Indian languages and 9 distinct learner cohorts.

---

## 2. Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend / Agent Service**: Node.js / Express with TypeScript (`server/index.ts`), structured into routers, services, agents, and tools.
- **AI Intelligence**: Google Gemini API via official `@google/genai` TypeScript SDK (`gemini-2.5-pro` for deep pedagogical planning and reasoning; `gemini-2.5-flash` for high-throughput multilingual evaluation and explanation generation).
- **Client Storage & Offline Resilience**: IndexedDB (`idb`), PWA Service Worker, Background Sync Queue with deterministic idempotent replay.

---

## 3. Documentation Directory Index

All engineering specifications and architectural standards are thoroughly documented:

| Document | Purpose & Contents |
|---|---|
| **[AGENTS.md](/AGENTS.md)** | Prime directives, code standards, tool execution rules, and instructions for future coding agents. |
| **[docs/PRODUCT_REQUIREMENTS.md](/docs/PRODUCT_REQUIREMENTS.md)** | Full PRD covering all 9 learner categories, functional/non-functional requirements, and the Odia pilot scope. |
| **[docs/SYSTEM_ARCHITECTURE.md](/docs/SYSTEM_ARCHITECTURE.md)** | High-level system topology, service boundaries, learning agent loop, data flow, and deployment models. |
| **[docs/AGENT_DESIGN.md](/docs/AGENT_DESIGN.md)** | Complete pedagogical state machine, tool contracts, retry/fallback mechanisms, and trace logging. |
| **[docs/SECURITY_AND_PRIVACY.md](/docs/SECURITY_AND_PRIVACY.md)** | DPDP Act 2023 compliance, minor data protection, threat modeling, prompt injection defenses, and secret management. |
| **[docs/IMPLEMENTATION_ROADMAP.md](/docs/IMPLEMENTATION_ROADMAP.md)** | Phased engineering roadmap from Stage 0 (Foundations) to Stage 6 (Demonstration) and national scale. |

---

## 4. How Subsequent Coding Tasks Should Begin

1. **Review Rules**: Read `/AGENTS.md` before making any modifications.
2. **Consult Roadmap**: Inspect `docs/IMPLEMENTATION_ROADMAP.md` to identify the active milestone.
3. **Verify Contracts**: Inspect `docs/AGENT_DESIGN.md` and `docs/SYSTEM_ARCHITECTURE.md` before adding endpoints or tool schemas.
4. **Execute Incrementally**:
   - Write typed schemas and agent tools in `server/` with input/output validation.
   - Implement typed frontend hooks and accessible UI components in `src/`.
   - Run type checking and build verification (`tsc --noEmit`, `npm run build`).
