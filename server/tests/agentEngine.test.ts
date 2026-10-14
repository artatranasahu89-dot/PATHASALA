/**
 * BharatLearn AI — Agentic AI Learning Engine Verification Suite
 * Tests:
 * 1. 8-Stage Pedagogical Loop execution
 * 2. ToolRegistry typed tools (10 tools)
 * 3. Localized explanations & depth modes (Standard, Simpler with analogy, Deeper)
 * 4. Progressive hint generation without answer leakage
 * 5. Diagnostic answer check & misconception detection
 * 6. Parental restriction enforcement & unlock workflow
 * 7. Persistent learning state & study plan milestone updates
 */

import { PedagogicalAgent } from '../agents/pedagogicalAgent';
import { ToolRegistry } from '../tools/registry';
import { learningStateService } from '../services/learningStateService';
import { parentService } from '../services/parentService';

async function runTests() {
  console.log('🧪 Starting BharatLearn AI Agent Engine Test Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      process.exitCode = 1;
    }
  }

  // --- Test 1: Start Session & Context Assessment ---
  console.log('--- Test 1: Session Initiation & Profile Loading ---');
  const sessionState = await PedagogicalAgent.startSession({
    learnerId: 'learner_pilot_odia_01',
    subjectId: 'BSE_OD_10_LIFE_SCIENCE',
    topic: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ଫୋଟୋଲାଇସିସ୍',
  });
  assert(Boolean(sessionState.sessionId), 'Session ID generated');
  assert(sessionState.gradeLevel === 10, 'Grade level correctly loaded (Class 10)');
  assert(sessionState.currentWorkflowState === 'ASSESS_CONTEXT', 'Workflow state is ASSESS_CONTEXT');
  assert(sessionState.traces.length >= 2, 'Initial decision traces recorded');
  assert(sessionState.workflowEvents.length >= 2, 'Initial workflow events recorded');

  // --- Test 2: 8-Stage Interaction Loop ---
  console.log('\n--- Test 2: Full 8-Stage Pedagogical Interaction Loop ---');
  const interactionResult = await PedagogicalAgent.interact({
    sessionId: sessionState.sessionId,
    learnerId: 'learner_pilot_odia_01',
    message: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ କିପରି ହୁଏ ବୁଝାଇ ଦିଅନ୍ତୁ',
    subjectId: 'BSE_OD_10_LIFE_SCIENCE',
    topic: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ଫୋଟୋଲାଇସିସ୍',
    depth: 'STANDARD',
  });
  assert(interactionResult.currentWorkflowState === 'RESPOND', 'Completed full loop reaching RESPOND');
  assert(interactionResult.workflowEvents.length >= 8, 'Recorded all 8 workflow events');
  assert(Boolean(interactionResult.explanation), 'Generated concept explanation');
  assert(interactionResult.explanation!.title.length > 0, 'Explanation has authentic title');
  assert(interactionResult.explanation!.keyTakeaways.length >= 2, 'Explanation includes key takeaways');

  // --- Test 3: Simpler Depth with Cultural Analogy ---
  console.log('\n--- Test 3: Cultural Analogy Mode (Simpler Depth) ---');
  const simplerResult = await PedagogicalAgent.interact({
    sessionId: sessionState.sessionId,
    learnerId: 'learner_pilot_odia_01',
    message: 'ମୋତେ ସରଳ ଗାଉଁଲି ଉଦାହରଣ ମାଧ୍ୟମରେ ବୁଝାନ୍ତୁ',
    subjectId: 'BSE_OD_10_LIFE_SCIENCE',
    topic: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ଫୋଟୋଲାଇସିସ୍',
    depth: 'SIMPLER',
  });
  assert(simplerResult.pedagogicalAction === 'ANALOGY_REPAIR', 'Action branched to ANALOGY_REPAIR');
  assert(Boolean(simplerResult.explanation?.culturalAnalogy), 'Explanation contains cultural analogy');
  assert(
    Boolean(simplerResult.explanation?.culturalAnalogy?.sourceContext),
    'Cultural analogy has verified local context'
  );

  // --- Test 4: Progressive Hint Generation ---
  console.log('\n--- Test 4: Progressive Hint Generation (No Answer Spoilers) ---');
  const hint1 = await PedagogicalAgent.requestHint({
    questionPrompt: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ନିର୍ଗତ ଅମ୍ଳଜାନ କେଉଁଠାରୁ ମିଳିଥାଏ?',
    options: ['CO2', 'H2O', 'ଗ୍ଲୁକୋଜ', 'କ୍ଲୋରୋଫିଲ'],
    conceptName: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ',
    language: 'or',
    hintLevel: 1,
  });
  assert(Boolean(hint1.hintText), 'Generated Level 1 gentle conceptual hint');
  assert(!hint1.hintText.includes('Option 2') && !hint1.hintText.includes('ସଠିକ୍ ଉତ୍ତର ୨'), 'Level 1 hint does not spoil option number');

  // --- Test 5: Diagnostic Answer Evaluation & Misconception Check ---
  console.log('\n--- Test 5: Diagnostic Answer Check & Misconception Detection ---');
  // Wrong answer (Option 0 = CO2 instead of H2O)
  const wrongEvaluation = await PedagogicalAgent.checkAnswer({
    sessionId: sessionState.sessionId,
    learnerId: 'learner_pilot_odia_01',
    questionId: 'q_light_01',
    conceptId: 'concept_light_reaction',
    selectedOptionIndex: 0,
  });
  assert(!wrongEvaluation.evaluation.isCorrect, 'Correctly identified wrong answer');
  assert(
    wrongEvaluation.evaluation.misconceptionTag === 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
    'Correctly diagnosed MISCONCEPTION_CO2_OXYGEN_SPLIT'
  );
  assert(wrongEvaluation.state?.pedagogicalAction === 'ANALOGY_REPAIR', 'Branched to ANALOGY_REPAIR after misconception');

  // Correct answer (Option 1 = H2O)
  const correctEvaluation = await PedagogicalAgent.checkAnswer({
    sessionId: sessionState.sessionId,
    learnerId: 'learner_pilot_odia_01',
    questionId: 'q_light_01',
    conceptId: 'concept_light_reaction',
    selectedOptionIndex: 1,
  });
  assert(correctEvaluation.evaluation.isCorrect, 'Correctly identified correct answer');
  assert(correctEvaluation.evaluation.score === 1.0, 'Full score awarded for correct answer');
  assert(correctEvaluation.state?.pedagogicalAction === 'ADVANCE', 'Branched to ADVANCE after correct answer');

  // --- Test 6: Study Plan Creation & Milestone Updates ---
  console.log('\n--- Test 6: Persistent Study Plan Generation & Milestone Tracking ---');
  const plan = await ToolRegistry.createStudyPlan({
    learnerId: 'learner_pilot_odia_01',
    subjectId: 'BSE_OD_10_LIFE_SCIENCE',
    topic: 'ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ',
    availableMinutes: 30,
  });
  assert(Boolean(plan.data.id), 'Study plan created with unique ID');
  assert(plan.data.milestones.length === 3, 'Plan created with 3 structured milestones');
  assert(plan.data.totalMinutes === 30, 'Total minutes aligned with user allocation');

  // Complete milestone 0
  const updateRes = await ToolRegistry.updateStudyPlan({
    planId: plan.data.id,
    completedStepIndex: 0,
    learnerId: 'learner_pilot_odia_01',
  });
  assert(updateRes.data.success, 'Milestone update reported success');
  assert(updateRes.data.plan?.milestones[0].completed === true, 'Milestone 0 marked completed');
  assert(updateRes.data.plan?.activeMilestoneIndex === 1, 'Active milestone advanced to index 1');

  // --- Test 7: Parental Control Hard Boundary Enforcement ---
  console.log('\n--- Test 7: Parental Control Session Restriction Enforcement ---');
  // Start study session and restrict it
  const studySessionRes = parentService.startStudySession(
    'learner_pilot_odia_01',
    'LESSON',
    'ଆଲୋକ ସଂଶ୍ଳେଷଣ ଅଧ୍ୟୟନ',
    'BSE_OD_10_LIFE_SCIENCE'
  );
  assert(Boolean(studySessionRes.session), 'Study session started');

  // Simulate 10-minute inactivity restriction
  const restrictedSession = studySessionRes.session!;
  restrictedSession.state = 'RESTRICTED';
  restrictedSession.restrictionReason = 'INACTIVITY_LIMIT';

  // Agent interaction must halt and provide unlock mechanism
  const restrictedAgentRes = await PedagogicalAgent.interact({
    learnerId: 'learner_pilot_odia_01',
    message: 'ମୋତେ ଆଗକୁ ପଢ଼ାନ୍ତୁ',
    subjectId: 'BSE_OD_10_LIFE_SCIENCE',
    topic: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ',
  });
  assert(restrictedAgentRes.isRestricted === true, 'Agent recognized parental restriction');
  assert(restrictedAgentRes.pedagogicalAction === 'STOP', 'Agent pedagogical action stopped');
  assert(
    restrictedAgentRes.responseText.includes('ଅଭିଭାବକଙ୍କ ଦ୍ୱାରା ନିୟନ୍ତ୍ରିତ'),
    'Agent instructed student on parental restriction'
  );

  // Restore session
  restrictedSession.state = 'ACTIVE_STUDY';

  // --- Test 8: Persistent Progress Loading ---
  console.log('\n--- Test 8: Real Persistent Learning Progress Verification ---');
  const persistentProgress = learningStateService.getLearningProgress('learner_pilot_odia_01');
  assert(persistentProgress.totalConceptsTracked >= 3, 'Tracked multiple concepts in mastery vector');
  assert(persistentProgress.recentActivities.length >= 2, 'Tracked recent study activities');
  assert(Boolean(persistentProgress.activePlan), 'Persistent active plan retained across sessions');

  console.log(`\n🎉 Verification Complete: ${passed} / ${total} tests passed!`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
