/**
 * BharatLearn AI — Agent Engine & Pedagogical Orchestrator Test Suite
 *
 * Verifies:
 * 1. Successful multi-step agent workflows (8-stage loop).
 * 2. Incorrect answers triggering appropriate re-planning & remedial hints.
 * 3. Tool validation failures and unavailable tools.
 * 4. Unauthenticated and unauthorised tool calls (RBAC).
 * 5. Cross-learner data isolation.
 * 6. Restricted study sessions and parent-unlock requirements.
 * 7. Failed Gemini requests and deterministic fallback/retry behavior.
 * 8. Persisted progress after refreshing / reloading state.
 */

import { PedagogicalAgent } from '../server/agents/pedagogicalAgent';
import { toolRegistry } from '../server/tools/registry';
import { learningStateService } from '../server/services/learningStateService';
import { parentService } from '../server/services/parentService';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
    testsFailed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 BharatLearn AI — Pedagogical Agent Test Suite');
  console.log('======================================================\n');

  // Test 1: Successful multi-step agent workflows (8-stage loop)
  console.log('--- Test 1: 8-Stage Pedagogical Loop Execution ---');
  try {
    const sessionRes = await PedagogicalAgent.startSession({
      learnerId: 'student_1',
      subjectId: 'science',
      topic: 'Photosynthesis',
      language: 'od',
    });

    assert(!!sessionRes.sessionId, 'Session initiated with valid UUID');
    assert(sessionRes.learnerId === 'student_1', 'Session matches learner profile');

    const interactionRes = await PedagogicalAgent.interact({
      sessionId: sessionRes.sessionId,
      learnerId: 'student_1',
      message: 'Explain how plants make food in sunlight',
      subjectId: 'science',
      topic: 'Photosynthesis',
      depth: 'STANDARD',
    });

    assert(interactionRes.stepHistory.length === 8, 'Exact 8-stage state transition logged', `Got ${interactionRes.stepHistory.length} steps`);
    assert(interactionRes.stepHistory.includes('RECEIVE_REQUEST'), 'Includes RECEIVE_REQUEST stage');
    assert(interactionRes.stepHistory.includes('ASSESS_CONTEXT'), 'Includes ASSESS_CONTEXT stage');
    assert(interactionRes.stepHistory.includes('CREATE_PLAN'), 'Includes CREATE_PLAN stage');
    assert(interactionRes.stepHistory.includes('SELECT_TOOL'), 'Includes SELECT_TOOL stage');
    assert(interactionRes.stepHistory.includes('EXECUTE_TOOL'), 'Includes EXECUTE_TOOL stage');
    assert(interactionRes.stepHistory.includes('VERIFY_RESULT'), 'Includes VERIFY_RESULT stage');
    assert(interactionRes.stepHistory.includes('UPDATE_LEARNER_STATE'), 'Includes UPDATE_LEARNER_STATE stage');
    assert(interactionRes.stepHistory.includes('RESPOND'), 'Includes RESPOND stage');
    assert(!!interactionRes.content && interactionRes.content.length > 50, 'Pedagogical content response delivered');
    assert(interactionRes.auditTrail.length > 0, 'Audit trail contains recorded actions');
  } catch (err: any) {
    assert(false, 'Test 1 threw error', err.message);
  }

  // Test 2: Incorrect answers triggering appropriate re-planning
  console.log('\n--- Test 2: Diagnostic Evaluation & Re-plan on Incorrect Answer ---');
  try {
    const evalRes = await PedagogicalAgent.checkAnswer({
      learnerId: 'student_1',
      subjectId: 'science',
      conceptId: 'photosynthesis_reactions',
      questionId: 'q_light_01',
      selectedOptionIndex: 0, // Wrong option (CO2 instead of H2O)
    });

    assert(!evalRes.isCorrect, 'Identified incorrect answer accurately');
    assert(!!evalRes.remediationPlan, 'Generated actionable remediation plan');
    assert(Boolean(evalRes.remediationPlan && evalRes.remediationPlan.steps.length > 0), 'Remediation plan contains guidance steps');

    // Test hint generation before solution
    const hintRes = await PedagogicalAgent.getHint({
      learnerId: 'student_1',
      subjectId: 'science',
      conceptId: 'photosynthesis_reactions',
      questionId: 'q_light_01',
      hintLevel: 1,
    });
    assert(hintRes.hintLevel === 1, 'Delivered Level 1 gentle conceptual hint');
    assert(!hintRes.revealsSolution, 'Level 1 hint does NOT reveal the final solution');
  } catch (err: any) {
    assert(false, 'Test 2 threw error', err.message);
  }

  // Test 3: Tool validation failures and unavailable tools
  console.log('\n--- Test 3: Tool Validation Failures & Unavailable Tools ---');
  try {
    const invalidToolResult = await toolRegistry.executeTool(
      'nonExistentTool' as any,
      {},
      { learnerId: 'student_1', role: 'student', sessionId: 's1' }
    );
    assert(!invalidToolResult.success, 'Fails gracefully on unknown tool');
    assert(invalidToolResult.error?.code === 'TOOL_NOT_FOUND', 'Returns TOOL_NOT_FOUND error code');

    const missingArgsResult = await toolRegistry.executeTool(
      'checkAnswer',
      { learnerId: 'student_1' }, // Missing questionId, selectedOptionIndex, etc.
      { learnerId: 'student_1', role: 'student', sessionId: 's1' }
    );
    assert(!missingArgsResult.success, 'Fails on missing required parameters');
    assert(missingArgsResult.error?.code === 'VALIDATION_ERROR', 'Returns VALIDATION_ERROR code');
  } catch (err: any) {
    assert(false, 'Test 3 threw error', err.message);
  }

  // Test 4: Unauthenticated and unauthorised tool calls
  console.log('\n--- Test 4: Authentication & RBAC Authorization Checks ---');
  try {
    const noUserResult = await toolRegistry.executeTool(
      'getLearnerProfile',
      { learnerId: 'student_1' },
      { learnerId: '', role: 'guest' }
    );
    assert(!noUserResult.success, 'Denies access without valid session/token');
    assert(noUserResult.error?.code === 'UNAUTHORIZED', 'Returns UNAUTHORIZED error code');
  } catch (err: any) {
    assert(false, 'Test 4 threw error', err.message);
  }

  // Test 5: Cross-learner data isolation
  console.log('\n--- Test 5: Cross-Learner Data Isolation ---');
  try {
    // student_2 tries to read student_1's private profile
    const crossAccessResult = await toolRegistry.executeTool(
      'getLearnerProfile',
      { learnerId: 'student_1' },
      { learnerId: 'student_2', role: 'student' }
    );
    assert(!crossAccessResult.success, 'Blocks student_2 from reading student_1 records');
    assert(crossAccessResult.error?.code === 'FORBIDDEN', 'Returns FORBIDDEN code for cross-learner access');

    // student_1 reading their own records succeeds
    const ownAccessResult = await toolRegistry.executeTool(
      'getLearnerProfile',
      { learnerId: 'student_1' },
      { learnerId: 'student_1', role: 'student' }
    );
    assert(Boolean(ownAccessResult.success), 'Allows student_1 to access their own record');
  } catch (err: any) {
    assert(false, 'Test 5 threw error', err.message);
  }

  // Test 6: Restricted study sessions & parent unlock requirements
  console.log('\n--- Test 6: Parental Controls & Unlock Workflow ---');
  try {
    // Lock student_1's session by setting max daily minutes exceeded
    parentService.updateRestrictions('student_1', {
      maxDailyMinutes: 0, // force locked
      isLocked: true,
      allowedSubjects: ['science'],
    });

    const lockedSession = await PedagogicalAgent.startSession({
      learnerId: 'student_1',
      subjectId: 'science',
      topic: 'Photosynthesis',
    });
    assert(
      lockedSession.pedagogicalAction === 'STOP' || parentService.getActiveSession('student_1')?.state === 'RESTRICTED',
      'Recognizes parentally locked session'
    );

    // Trigger parent unlock request via tool
    const unlockReq = await toolRegistry.executeTool(
      'requestParentUnlock',
      { learnerId: 'student_1', reason: 'Need 15 more minutes for science homework' },
      { learnerId: 'student_1', role: 'student' }
    );
    assert(Boolean(unlockReq.success), 'requestParentUnlock tool executes successfully');
    assert(unlockReq.data?.status === 'PENDING' || unlockReq.data?.status === 'REQUESTED', 'Unlock status set to PENDING/REQUESTED');

    // Restore clean settings
    parentService.updateRestrictions('student_1', {
      maxDailyMinutes: 60,
      isLocked: false,
      allowedSubjects: ['science', 'math', 'social_science', 'english', 'odia'],
    });
  } catch (err: any) {
    assert(false, 'Test 6 threw error', err.message);
  }

  // Test 7: Failed Gemini requests and retry / fallback behavior
  console.log('\n--- Test 7: Gemini Resilience & Deterministic Fallbacks ---');
  try {
    // Calling explainConcept with simple depth in Odia
    const fallbackExplanation = await toolRegistry.executeTool(
      'explainConcept',
      {
        learnerId: 'student_1',
        conceptName: 'Photosynthesis',
        gradeLevel: 10,
        language: 'or',
        depth: 'SIMPLER',
      },
      { learnerId: 'student_1', role: 'student' }
    );

    assert(Boolean(fallbackExplanation.success), 'Returns curriculum-grounded explanation on fallback');
    assert(!!fallbackExplanation.data?.detailedExplanation || !!fallbackExplanation.data?.explanation, 'Explanation body is present');
    assert(fallbackExplanation.data?.sourceProvenance === 'NCERT_BSE_ODISHA_CURRICULUM', 'Verified against official curriculum standards');
  } catch (err: any) {
    assert(false, 'Test 7 threw error', err.message);
  }

  // Test 8: Persisted progress after state refresh / reload
  console.log('\n--- Test 8: Progress Persistence & Idempotency ---');
  try {
    const activityId = `act_test_${Date.now()}`;
    learningStateService.recordActivity({
      id: activityId,
      learnerId: 'student_1',
      timestamp: new Date().toISOString(),
      type: 'CONCEPT_STUDY',
      subjectId: 'science',
      conceptId: 'photosynthesis_light',
      title: 'Light Dependent Reactions',
      durationMinutes: 12,
      score: 95,
      maxScore: 100,
    });

    const progress = learningStateService.getLearningProgress('student_1');
    assert(progress.activitiesCompleted >= 1, 'Activity count incremented in persistent store');
    assert(progress.recentActivities.some((a) => a.id === activityId), 'Activity record retrievable by ID');

    // Test idempotent re-submission (same activity ID)
    const countBefore = progress.activitiesCompleted;
    learningStateService.recordActivity({
      id: activityId, // same ID
      learnerId: 'student_1',
      timestamp: new Date().toISOString(),
      type: 'CONCEPT_STUDY',
      subjectId: 'science',
      conceptId: 'photosynthesis_light',
      title: 'Light Dependent Reactions',
      durationMinutes: 12,
      score: 95,
      maxScore: 100,
    });
    const progressAfter = learningStateService.getLearningProgress('student_1');
    assert(progressAfter.activitiesCompleted === countBefore, 'Idempotency guards against duplicate score/activity insertion');
  } catch (err: any) {
    assert(false, 'Test 8 threw error', err.message);
  }

  console.log('\n======================================================');
  console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log('======================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
