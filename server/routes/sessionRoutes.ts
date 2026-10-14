/**
 * BharatLearn AI — Study Session API Router
 * Handles study session lifecycles, real-time inactivity pulse checks,
 * break timers, screen time enforcement, and student unlock requests.
 */

import { Router, Request, Response } from 'express';
import { parentService } from '../services/parentService';

export const sessionRouter = Router();

/**
 * POST /api/v1/study/session/start
 * Starts a new study session for the student
 */
sessionRouter.post('/start', (req: Request, res: Response) => {
  const { studentId, activityType, title, subjectId, idempotencyKey } = req.body;

  if (!studentId || !activityType || !title || !subjectId) {
    return res.status(400).json({ error: 'studentId, activityType, title, and subjectId are required.' });
  }

  const result = parentService.startStudySession(studentId, activityType, title, subjectId, idempotencyKey);
  if (!result.success) {
    return res.status(403).json({ error: result.error });
  }

  res.json({
    status: 'STARTED',
    session: result.session,
  });
});

/**
 * POST /api/v1/study/session/pause
 * Pause an active study session
 */
sessionRouter.post('/pause', (req: Request, res: Response) => {
  const { sessionId, studentId, idempotencyKey } = req.body;

  if (!sessionId || !studentId) {
    return res.status(400).json({ error: 'sessionId and studentId are required.' });
  }

  try {
    const session = parentService.pauseStudySession(sessionId, studentId, idempotencyKey);
    res.json({ session, status: 'PAUSED' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/v1/study/session/resume
 * Resume a paused study session
 */
sessionRouter.post('/resume', (req: Request, res: Response) => {
  const { sessionId, studentId, idempotencyKey } = req.body;

  if (!sessionId || !studentId) {
    return res.status(400).json({ error: 'sessionId and studentId are required.' });
  }

  try {
    const session = parentService.resumeStudySession(sessionId, studentId, idempotencyKey);
    res.json({ session, status: 'RESUMED' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/v1/study/session/pulse
 * Periodic pulse from client (every 3-5 seconds).
 * Checks inactivity thresholds:
 * - 1 minute: triggers parent alert
 * - 5 minutes: flags SHOW_5MIN_REMINDER
 * - 10 minutes: flags RESTRICT_APP
 */
sessionRouter.post('/pulse', (req: Request, res: Response) => {
  const { sessionId, studentId, hasUserInteraction, deltaSeconds } = req.body;

  if (!sessionId || !studentId) {
    return res.status(400).json({ error: 'sessionId and studentId are required.' });
  }

  try {
    const { session, actionRequired } = parentService.pulseStudySession(
      sessionId,
      studentId,
      Boolean(hasUserInteraction),
      Number(deltaSeconds) || 3
    );

    res.json({
      session,
      actionRequired,
      inactivitySeconds: session.inactivitySeconds,
      accumulatedStudySeconds: session.accumulatedStudyDurationSeconds,
    });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/v1/study/session/break
 * Start or resume from break
 */
sessionRouter.post('/break', (req: Request, res: Response) => {
  const { sessionId, start } = req.body;

  if (!sessionId || typeof start !== 'boolean') {
    return res.status(400).json({ error: 'sessionId and start boolean are required.' });
  }

  try {
    const session = parentService.toggleBreak(sessionId, start);
    res.json({ session, status: start ? 'ON_BREAK' : 'BREAK_ENDED' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/v1/study/session/end
 * Finish study session
 */
sessionRouter.post('/end', (req: Request, res: Response) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required.' });
  }

  try {
    const session = parentService.endStudySession(sessionId);
    res.json({ session, status: 'COMPLETED' });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

/**
 * POST /api/v1/study/session/request-unlock
 * Student submits an unlock request to their linked parent
 */
sessionRouter.post('/request-unlock', (req: Request, res: Response) => {
  const { studentId, sessionId, reason, studentNote } = req.body;

  if (!studentId || !sessionId || !reason) {
    return res.status(400).json({ error: 'studentId, sessionId, and reason are required.' });
  }

  try {
    const unlockReq = parentService.requestUnlock(studentId, sessionId, reason, studentNote);
    res.json({ status: 'REQUEST_SUBMITTED', request: unlockReq });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/v1/study/session/status/:studentId
 * Get current session status for student
 */
sessionRouter.get('/status/:studentId', (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const session = parentService.getActiveSession(studentId);
  const policy = parentService.getPolicy(studentId);

  res.json({
    activeSession: session,
    policy,
  });
});
