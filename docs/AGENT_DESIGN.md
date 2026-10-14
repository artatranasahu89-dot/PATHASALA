# BharatLearn AI — Agent Design & Orchestration Specification

> **Document Version**: 1.0.0  
> **Status**: Approved Foundation  
> **Engine**: LangGraph StateGraph + Google GenAI (Gemini 2.5)

---

## 1. Pedagogical Agent Philosophy

BharatLearn AI does **not** employ a standard conversational LLM wrapper. A conversational wrapper generates unconstrained text directly from a system prompt, resulting in curriculum hallucination, lack of deterministic state tracking, and inability to maintain pedagogical pacing.

Instead, BharatLearn AI runs an **observable, stateful, goal-directed LangGraph agent** that operates according to established mastery learning principles (Bloom's 2 Sigma Problem / Direct Instruction). The agent maintains an explicit Knowledge State Vector for each student, executes verified tools, inspects student answers against curriculum rubrics, and dynamically decides whether to reinforce, explain with simpler analogies, practice, or advance.

---

## 2. Agent State Schema (LangGraph State)

The agent workflow is modeled around an explicit, type-checked Pydantic state model passed across all graph nodes:

```python
from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field

class ConceptMastery(BaseModel):
    concept_id: str
    concept_name: str
    mastery_score: float = Field(ge=0.0, le=1.0)  # 0.0 to 1.0
    attempts_count: int = 0
    correct_count: int = 0
    last_misconception_tag: Optional[str] = None
    level: Literal["NOT_STARTED", "NOVICE", "DEVELOPING", "COMPETENT", "MASTERED"]

class AgentState(BaseModel):
    # Session Identifiers
    session_id: str
    learner_id: str
    class_grade: int = 10
    curriculum: str = "BSE_ODISHA"  # e.g. BSE_ODISHA, NCERT_CBSE
    subject: str = "SCIENCE_LIFE"
    
    # Language Configuration
    ui_language: str = "or"
    explanation_language: str = "or"
    instructional_language: str = "or"
    assessment_language: str = "or"

    # Learning Path Context
    current_chapter_id: str
    current_concept_id: str
    current_goal: str
    mastery_history: Dict[str, ConceptMastery] = {}
    
    # Active Turn Interaction
    current_step_index: int = 0
    max_steps_per_turn: int = 8
    pedagogical_action: Literal["INTRODUCE", "EXPLAIN", "ANALOGY_REPAIR", "PRACTICE", "EVALUATE", "ADVANCE", "STOP"] = "INTRODUCE"
    remediation_depth: int = 0  # 0: standard, 1: simpler local analogy, 2: foundational prerequisite
    
    # Working Scratchpad & Tool Execution Trace
    last_tool_executed: Optional[str] = None
    last_tool_output: Optional[Dict[str, Any]] = None
    active_question: Optional[Dict[str, Any]] = None
    learner_response: Optional[str] = None
    evaluation_result: Optional[Dict[str, Any]] = None
    
    # Trace & Observability
    decision_traces: List[Dict[str, Any]] = []
    error_flags: List[str] = []
```

---

## 3. LangGraph State Machine & Node Flow

The graph executes across deterministic nodes with conditional branching:

```
                  ┌──────────────────────┐
                  │      [START]         │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  load_context_node   │  <-- tool: get_learner_profile & get_learning_progress
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ diagnose_gaps_node   │  <-- tool: diagnose_knowledge_gaps
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  plan_pedagogy_node  │  <-- Policy decision: INTRODUCE / PRACTICE / REMEDIATE
                  └──────────┬───────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │ [Action=INTRODUCE] │ [Action=PRACTICE]  │ [Action=REMEDIATE]
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ search_      │     │ generate_    │     │ fetch_       │
│ approved_    │     │ practice_    │     │ analogy_     │
│ content_node │     │ questions_   │     │ repair_node  │
└───────┬──────┘     │ node         │     └───────┬──────┘
        │            └───────┬──────┘             │
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ present_to_learner   │  <-- Formatted Odia delivery
                  └──────────┬───────────┘
                             │
                    (Waits for Learner Input)
                             │
                             ▼
                  ┌──────────────────────┐
                  │ evaluate_answer_node │  <-- tool: evaluate_answer
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ update_mastery_node  │  <-- tool: save_learning_progress
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ branch_decision_node │
                  └──────────┬───────────┘
                             │
       ┌─────────────────────┴─────────────────────┐
       │ (Score >= 0.8)                            │ (Score < 0.8)
       ▼                                           ▼
┌──────────────┐                          ┌──────────────────┐
│ recommend_   │                          │ increase_        │
│ next_lesson  │                          │ remediation_     │
└──────┬───────┘                          │ depth_node       │
       │                                  └────────┬─────────┘
       │                                           │ (remediation_depth > 2)
       ▼                                           ▼
┌──────────────┐                          ┌──────────────────┐
│ [FINISH /    │                          │ schedule_        │
│  CHECKPOINT] │                          │ followup_node    │
└──────────────┘                          └──────────────────┘
```

---

## 4. Tool Registry Contracts

All tools adhere to strict interface contracts with timeouts, authorization, and structured return envelopes.

### Tool 1: `get_learner_profile`
- **Purpose**: Retrieves learner details, educational board, grade, language preferences, and accessibility settings.
- **Input**: `{ "learner_id": "uuid" }`
- **Output**: `{ "grade": 10, "curriculum": "BSE_ODISHA", "languages": {"ui": "or", "explanation": "or"}, "special_needs": null }`
- **Timeout**: 2000ms | **Permission**: `STUDENT` (self) or `TEACHER` (assigned class)

### Tool 2: `get_learning_progress`
- **Purpose**: Fetches historical mastery scores, completed chapters, and current concept queue.
- **Input**: `{ "learner_id": "uuid", "subject": "SCIENCE_LIFE" }`
- **Output**: `{ "active_chapter": "ch_10_nutrition", "concepts_completed": 4, "overall_mastery": 0.72 }`
- **Timeout**: 2000ms | **Permission**: `STUDENT` (self)

### Tool 3: `diagnose_knowledge_gaps`
- **Purpose**: Evaluates recent error patterns across prerequisites to identify root misconceptions.
- **Input**: `{ "learner_id": "uuid", "concept_id": "concept_photosynthesis_dark_reaction" }`
- **Output**: `{ "gap_identified": true, "misconception": "Confusing ATP/NADPH role with light absorption", "prerequisite_concept": "concept_light_reaction" }`
- **Timeout**: 3000ms | **Permission**: System internal

### Tool 4: `search_approved_learning_content`
- **Purpose**: Retrieves verified Odia curriculum textbook paragraphs and diagrams. Never invents textbook citations.
- **Input**: `{ "curriculum": "BSE_ODISHA", "grade": 10, "concept_id": "concept_photosynthesis", "language": "or" }`
- **Output**: `{ "source_book": "BSE Odia Jiba Bigyan Class 10", "page_ref": 42, "content_text": "...", "diagram_url": "/assets/bio/photosynthesis_odia.svg" }`
- **Timeout**: 2500ms | **Permission**: Read-only public

### Tool 5: `generate_practice_questions`
- **Purpose**: Fetches or synthesizes curriculum-aligned questions at a targeted difficulty level.
- **Input**: `{ "concept_id": "concept_photosynthesis", "difficulty": "MEDIUM", "language": "or", "count": 2 }`
- **Output**: `{ "questions": [{ "question_id": "q_101", "prompt_or": "ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ଅମ୍ଳଜାନ କେଉଁଠାରୁ ନିର୍ଗତ ହୁଏ?", "options_or": ["ପାଣିରୁ", "କାର୍ବନ ଡାଇଅକ୍ସାଇଡରୁ", "ଗ୍ଲୁକୋଜରୁ", "ହରିତକଣାରୁ"], "correct_index": 0 }] }`
- **Timeout**: 4000ms | **Permission**: System internal

### Tool 6: `evaluate_answer`
- **Purpose**: Compares student submission against the verified rubric, diagnosing specific misconceptions.
- **Input**: `{ "question_id": "q_101", "selected_option_index": 1, "written_explanation": "କାର୍ବନ ଡାଇଅକ୍ସାଇଡର ଅମ୍ଳଜାନ ନିର୍ଗତ ହୁଏ" }`
- **Output**: `{ "is_correct": false, "score": 0.0, "misconception_tag": "MISCONCEPTION_CO2_OXYGEN_SPLIT", "feedback_or": "ଭୁଲ୍ ଧାରଣା! ମନେରଖନ୍ତୁ, ନିର୍ଗତ ଅମ୍ଳଜାନ (O2) ଜଳ (H2O) ର ଆଲୋକ ବିଶ୍ଳେଷଣରୁ ଆସିଥାଏ, CO2 ରୁ ନୁହେଁ।" }`
- **Timeout**: 3500ms | **Permission**: System internal

### Tool 7: `recommend_next_lesson`
- **Purpose**: Computes the optimal next pedagogical target based on updated mastery states.
- **Input**: `{ "learner_id": "uuid", "current_concept_id": "concept_photosynthesis", "mastery_score": 0.88 }`
- **Output**: `{ "next_action": "ADVANCE", "next_concept_id": "concept_aerobic_respiration", "rationale": "High mastery (>0.85) demonstrated in photosynthesis light/dark reactions." }`
- **Timeout**: 2000ms | **Permission**: System internal

### Tool 8: `save_learning_progress`
- **Purpose**: Persists mastery updates, time spent, answers given, and error tags in PostgreSQL.
- **Input**: `{ "learner_id": "uuid", "concept_id": "concept_photosynthesis", "score": 0.88, "attempts": 2 }`
- **Output**: `{ "status": "SAVED", "timestamp": "2026-10-14T06:15:00Z" }`
- **Timeout**: 2000ms | **Permission**: System internal

### Tool 9: `schedule_learning_followup`
- **Purpose**: Enqueues spaced repetition reminders or alerts the teacher if persistent difficulty is detected.
- **Input**: `{ "learner_id": "uuid", "concept_id": "concept_photosynthesis", "interval_days": 3, "notify_teacher": false }`
- **Output**: `{ "scheduled_id": "sched_909", "scheduled_date": "2026-10-17" }`
- **Timeout**: 2000ms | **Permission**: System internal

### Tool 10: `get_offline_learning_resources`
- **Purpose**: Packages verified chapter content, questions, and glossary vectors for client IndexedDB caching.
- **Input**: `{ "chapter_id": "ch_10_nutrition", "language": "or" }`
- **Output**: `{ "package_id": "pkg_ch10_v1", "size_bytes": 184500, "checksum": "sha256_hash", "concepts": [...] }`
- **Timeout**: 4000ms | **Permission**: Authenticated learner

---

## 5. Decision Trace & Observability Format

Every execution step logs an immutable JSON trace:

```json
{
  "trace_id": "tr_88f92b7c-1290-4e3a",
  "session_id": "sess_91283",
  "step": 3,
  "timestamp": "2026-10-14T06:12:10.450Z",
  "node": "evaluate_answer_node",
  "pedagogical_intent": "Validate student answer on photolysis of water",
  "tool_invoked": "evaluate_answer",
  "tool_duration_ms": 312,
  "inputs": {
    "question_id": "q_101",
    "selected_option_index": 1
  },
  "outputs": {
    "is_correct": false,
    "misconception_tag": "MISCONCEPTION_CO2_OXYGEN_SPLIT"
  },
  "agent_decision": "BRANCH_TO_ANALOGY_REPAIR",
  "justification": "Student demonstrates common misunderstanding that released oxygen comes from carbon dioxide rather than photolysis of water. Remediation depth set to 1."
}
```

---

## 6. End-to-End Pilot Learning Session (Odia Class 10 Science)

### Scenario:
*Subhashree*, a Class 10 student in a government high school in Cuttack, Odisha, opens BharatLearn AI on her father's Android phone. Her goal is preparing for the BSE Odisha board exam topic: **"ଆଲୋକ ସଂଶ୍ଳେଷଣ (Photosynthesis) - ପ୍ରକ୍ରିୟା ଓ ରାସାୟନିକ ସମୀକରଣ"**.

1. **Step 1: Session Initiation**  
   - Agent invokes `get_learner_profile("subhashree_id")` and `get_learning_progress("subhashree_id")`.
   - Learner preference: Language = Odia (`or`), Grade = 10, Board = BSE Odisha.
   - History: Completed plant cell structure (Competent, 0.85); Photosynthesis: Not Started.

2. **Step 2: Pedagogical Introduction**  
   - Agent invokes `search_approved_learning_content(concept="concept_photosynthesis", board="BSE_ODISHA")`.
   - Returns verified text from BSE Odisha *Jiba Bigyan* Chapter 1.
   - Agent formats introductory explanation in clear Odia:
     > "ସୁଭଶ୍ରୀ, ଆଜି ଆମେ ଦଶମ ଶ୍ରେଣୀ ଜୀବ ବିଜ୍ଞାନର ଏକ ଗୁରୁତ୍ଵପୂର୍ଣ୍ଣ ପ୍ରସଙ୍ଗ **ଆଲୋକ ସଂଶ୍ଳେଷଣ (Photosynthesis)** ବିଷୟରେ ପଢ଼ିବା। ସବୁଜ ଉଦ୍ଭିଦ କିପରି ସୂର୍ଯ୍ୟାଲୋକ, କାର୍ବନ ଡାଇଅକ୍ସାଇଡ (CO2) ଏବଂ ଜଳ (H2O) ବ୍ୟବହାର କରି ଗ୍ଲୁକୋଜ ଓ ଅମ୍ଳଜାନ ତିଆରି କରେ ତାହା ଦେଖିବା।"

3. **Step 3: Diagnostic Assessment**  
   - Agent invokes `generate_practice_questions(concept="concept_photosynthesis", difficulty="EASY")`.
   - Question presented in Odia:
     > *"ପ୍ରଶ୍ନ: ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ଉପଜାତ (by-product) ଭାବରେ ନିର୍ଗତ ହେଉଥିବା ଅମ୍ଳଜାନ ଗ୍ୟାସର ମୁଖ୍ୟ ଉତ୍ସ କ’ଣ?"*  
     > ୧. କାର୍ବନ ଡାଇଅକ୍ସାଇଡ (CO2)  
     > ୨. ଜଳ (H2O)  
     > ୩. ଗ୍ଲୁକୋଜ  
     > ୪. କ୍ଲୋରୋଫିଲ  

4. **Step 4: Learner Response & Misconception Diagnosis**  
   - Subhashree selects Option 1 (CO2).
   - Agent invokes `evaluate_answer`.
   - Misconception flagged: `MISCONCEPTION_CO2_OXYGEN_SPLIT`.

5. **Step 5: Culturally Grounded Analogy Repair**  
   - Instead of generic repetition, the agent uses a localized Odia farming analogy:
     > "ଭଲ ଚେଷ୍ଟା! କିନ୍ତୁ ଏହା ଏକ ସାଧାରଣ ଭ୍ରମ ଧାରଣା। ଆସ ଗୋଟିଏ ସରଳ ଉଦାହରଣ ଦେଖିବା: ଯେତେବେଳେ ତୁମ ଗାଁ ନଈକୂଳରେ ଖରା ପଡ଼େ, ଜଳୀୟ ବାଷ୍ପ ହୁଏ। ଗଛ ଭିତରେ ସୂର୍ଯ୍ୟାଲୋକର ଶକ୍ତି ଦ୍ଵାରା **ପାଣି (H2O) ଭାଙ୍ଗିଯାଏ (Photolysis)**। ଏହି ପାଣି ଭାଙ୍ଗିବା ଫଳରେ ହିଁ ଅମ୍ଳଜାନ (O2) ବାହାରକୁ ଆସେ ଏବଂ ହାଇଡ୍ରୋଜେନ ଗ୍ଲୁକୋଜ ତିଆରିରେ ଲାଗେ। ତେଣୁ ମନେରଖ: ଅମ୍ଳଜାନ ଜଳରୁ ଆସେ, ଅଙ୍ଗାରକାମ୍ଳରୁ ନୁହେଁ!"

6. **Step 6: Follow-up Verification & Progression**  
   - Re-checks with a board-style question: *"Van Niel ଙ୍କ ପରୀକ୍ଷାରେ କେଉଁ ତଥ୍ୟ ପ୍ରମାଣିତ ହୋଇଥିଲା?"*  
   - Subhashree answers correctly.
   - Agent invokes `save_learning_progress` (Mastery updated to 0.78, status: DEVELOPING).
   - Agent invokes `recommend_next_lesson`, suggesting the dark reaction (*ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା / କାଲଭିନ ଚକ୍ର*).
   - Trace logged and session checkpointed.

---

## 7. Stage 5: Explicit 8-Stage Pedagogical Loop Specification

BharatLearn AI Stage 5 transitions the prototype loop into a fully productionized, verifiable 8-stage state machine:

```
[1. RECEIVE_REQUEST] 
       │
[2. ASSESS_CONTEXT] ──► Checks authenticated profile, class level, language, 
       │                and active parental control restrictions (halts if locked)
       ▼
[3. CREATE_PLAN] ─────► Gemini (gemini-3.8-flash) reasons on pedagogical goal, 
       │                selects registered tool, and generates 3-step pathway
       ▼
[4. SELECT_TOOL] ─────► Deterministic RBAC validation, schema validation, and timeout binding
       │
[5. EXECUTE_TOOL] ────► Real invocation of ToolRegistry function (Promise.race timeout)
       │
[6. VERIFY_RESULT] ───► Grounding audit: verifies facts match BSE Odisha / CBSE curriculum;
       │                falls back to curated textbooks if tool returns invalid data
       ▼
[7. UPDATE_LEARNER_STATE] ► Saves activity record, updates mastery vector in 
       │                    LearningStateService, and advances active study plan milestones
       ▼
[8. RESPOND] ─────────► Synthesizes age-appropriate response in learner's language with 
                        localized analogies, takeaways, reflection prompts, and next actions
```

### 7.1 Real Tool Registry (10 Typed Tools)
1. `getLearnerProfile`: Returns authenticated profile (grade, class, curriculum, languages, minor status).
2. `getLearningProgress`: Retrieves persistent concept mastery vector and recent activities.
3. `searchLearningResources`: Searches verified curriculum chapters, definitions, diagrams, and citations.
4. `createStudyPlan`: Generates milestone steps with minute estimates based on available time.
5. `getPracticeQuestions`: Retrieves board-aligned diagnostic and practice questions.
6. `checkAnswer`: Evaluates student answers, identifies misconceptions, and provides pedagogical feedback.
7. `explainConcept`: Generates class-adapted explanations with Standard, Simpler (cultural analogy), or Deeper (exam drill) depth.
8. `recordLearningActivity`: Persists learning activities, time spent, and updates mastery scores.
9. `updateStudyPlan`: Marks study plan milestones completed and advances active steps.
10. `requestParentUnlock`: Submits formal unlock request to parent service if session is restricted.

### 7.2 Safety & Privacy Guarantees
- **Strict Role Boundaries**: Students cannot view or alter other learners' data or parental control settings.
- **Parental Lock Respect**: The agent checks active session state. If restricted by 10-minute inactivity or screen-time rules, the agent halts instruction and prompts for a parent unlock request.
- **Child Privacy**: No PII exposed in prompts or logs; all LLM operations are routed via the backend proxy using `@google/genai`.

