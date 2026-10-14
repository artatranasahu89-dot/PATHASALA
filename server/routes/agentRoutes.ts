/**
 * BharatLearn AI — Agent API Router
 * Exposes the full 8-stage pedagogical orchestrator, interactive hints,
 * study plan management, diagnostic answer evaluations, and audit traces.
 */

import { Router } from 'express';
import { AuthenticatedRequest, requireAuth, requireRole } from './authRoutes';
import { PedagogicalAgent } from '../agents/pedagogicalAgent';
import { ToolRegistry } from '../tools/registry';
import { learningStateService } from '../services/learningStateService';

export const agentRouter = Router();
agentRouter.use(requireAuth, requireRole(['STUDENT']));

// Primary 8-stage interactive learning loop
agentRouter.post('/interact', async (req, res) => {
  try {
    const { sessionId, learnerId, message, subjectId, topic, depth } = req.body;

    const result = await PedagogicalAgent.interact({
      sessionId,
      learnerId: (req as AuthenticatedRequest).user!.uid,
      message: message || 'ଆଲୋକ ସଂଶ୍ଳେଷଣ କିପରି ହୁଏ ବୁଝାଇ ଦିଅନ୍ତୁ',
      subjectId,
      topic,
      depth,
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Agent interaction error';
    res.status(500).json({ error: msg });
  }
});

// Start or load a learning session
agentRouter.post('/session/start', async (req, res) => {
  try {
    const { curriculumCode, subjectId, chapterId, conceptId, topic, learnerId } = req.body;
    const lId = (req as AuthenticatedRequest).user!.uid;

    const state = await PedagogicalAgent.startSession({
      learnerId: lId,
      curriculumCode: curriculumCode || 'BSE_ODISHA',
      subjectId: subjectId || 'BSE_OD_10_LIFE_SCIENCE',
      chapterId: chapterId || 'ch_bse_od_10_bio_01_nutrition',
      conceptId: conceptId || 'concept_light_reaction',
      topic,
    });

    res.json({
      sessionId: state.sessionId,
      learnerId: state.learnerId,
      gradeLevel: state.gradeLevel,
      assignedClass: state.assignedClass,
      activeConcept: {
        id: state.conceptId,
        titleNative: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍',
        titleEn: 'Light Reaction & Photolysis of Water',
      },
      currentWorkflowState: state.currentWorkflowState,
      pedagogicalAction: state.pedagogicalAction,
      masteryScore: state.masteryScore,
      traces: state.traces,
      workflowEvents: state.workflowEvents,
      activePlan: state.activePlan,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Session creation error';
    res.status(500).json({ error: msg });
  }
});

// Step submission (for question answer or action)
agentRouter.post('/step', async (req, res) => {
  try {
    const { sessionId, learnerId, questionId, conceptId, selectedOptionIndex, notes } = req.body;

    const result = await PedagogicalAgent.checkAnswer({
      sessionId,
      learnerId: (req as AuthenticatedRequest).user!.uid,
      questionId: questionId || 'q_light_01',
      conceptId: conceptId || 'concept_light_reaction',
      selectedOptionIndex,
      writtenAnswer: notes,
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Step execution error';
    res.status(500).json({ error: msg });
  }
});

// Progressive pedagogical hint without revealing answer
agentRouter.post('/hint', async (req, res) => {
  try {
    const { questionPrompt, options, conceptName, language, hintLevel } = req.body;

    const hint = await PedagogicalAgent.requestHint({
      questionPrompt,
      options,
      conceptName: conceptName || 'ଆଲୋକ ସଂଶ୍ଳେଷଣ',
      language: language || 'or',
      hintLevel: hintLevel === 2 ? 2 : 1,
    });

    res.json(hint);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Hint generation error';
    res.status(500).json({ error: msg });
  }
});

// Check diagnostic answer
agentRouter.post('/answer/check', async (req, res) => {
  try {
    const { sessionId, learnerId, questionId, conceptId, selectedOptionIndex, writtenAnswer } = req.body;

    const result = await PedagogicalAgent.checkAnswer({
      sessionId,
      learnerId: learnerId || 'learner_pilot_odia_01',
      questionId: questionId || 'q_light_01',
      conceptId: conceptId || 'concept_light_reaction',
      selectedOptionIndex,
      writtenAnswer,
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Answer check error';
    res.status(500).json({ error: msg });
  }
});

// Create study plan
agentRouter.post('/plan/create', async (req, res) => {
  try {
    const { learnerId, subjectId, topic, availableMinutes, goalType } = req.body;

    const result = await ToolRegistry.createStudyPlan({
      learnerId: learnerId || 'learner_pilot_odia_01',
      subjectId: subjectId || 'BSE_OD_10_LIFE_SCIENCE',
      topic: topic || 'ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ',
      availableMinutes: Number(availableMinutes) || 30,
      goalType,
    });

    res.json(result.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Plan creation error';
    res.status(500).json({ error: msg });
  }
});

// Update study plan milestone
agentRouter.post('/plan/update', async (req, res) => {
  try {
    const { planId, completedStepIndex, learnerId } = req.body;

    const result = await ToolRegistry.updateStudyPlan({
      planId,
      completedStepIndex: Number(completedStepIndex),
      learnerId: learnerId || 'learner_pilot_odia_01',
    });

    res.json(result.data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Plan update error';
    res.status(500).json({ error: msg });
  }
});

// Real persistent progress & history
agentRouter.get('/progress/:learnerId', async (req, res) => {
  try {
    const learnerId = (req as AuthenticatedRequest).user!.uid;
    const progress = learningStateService.getLearningProgress(learnerId);
    res.json(progress);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching progress';
    res.status(500).json({ error: msg });
  }
});

// Retrieve audit traces for observability
agentRouter.get('/trace/:sessionId', (req, res) => {
  const session = PedagogicalAgent.getSession(req.params.sessionId);
  if (session && session.learnerId !== (req as AuthenticatedRequest).user!.uid) {
    res.status(403).json({ error: 'Access denied to another learner session.' });
    return;
  }
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json({
    traces: session.traces,
    workflowEvents: session.workflowEvents,
    currentWorkflowState: session.currentWorkflowState,
    masteryScore: session.masteryScore,
  });
});
