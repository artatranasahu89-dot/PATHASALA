/**
 * BharatLearn AI — Parent Portal API Router
 * Endpoints for parent authentication, child management, policy enforcement,
 * unlock requests, and screen time monitoring.
 */

import { Router, Request, Response } from 'express';
import { parentService } from '../services/parentService';
import { authService } from '../services/authService';

export const parentRouter = Router();

// Middleware: Authenticate parent (checks session token or fallback for dev)
function requireParentAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-auth-token'] as string);

  if (token) {
    const session = authService.verifySession(token);
    if (session && session.role === 'PARENT') {
      (req as any).parentId = session.uid;
      return next();
    }
    if (session && session.role !== 'PARENT') {
      return res.status(403).json({ error: 'Access denied: Parent role required.' });
    }
  }

  const parentId = (req.headers['x-parent-id'] as string) || 'parent_mohanty_01';
  const parent = parentService.getParentById(parentId);
  if (!parent) {
    return res.status(401).json({ error: 'Unauthorized: Valid Parent credentials required.' });
  }
  (req as any).parentId = parentId;
  next();
}

/**
 * POST /api/v1/parent/login
 * Parent authentication via phone/email and PIN
 */
parentRouter.post('/login', (req: Request, res: Response) => {
  const { phoneOrEmail, pin } = req.body;
  if (!phoneOrEmail || !pin) {
    return res.status(400).json({ error: 'phoneOrEmail and pin are required.' });
  }

  const result = parentService.verifyParentLogin(phoneOrEmail, pin);
  if (!result) {
    return res.status(401).json({ error: 'Invalid credentials or PIN.' });
  }

  res.json({
    status: 'AUTHENTICATED',
    parent: result.parent,
    token: result.token,
  });
});

/**
 * GET /api/v1/parent/children
 * Returns the list of linked children (strict max 2) with profiles
 */
parentRouter.get('/children', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const parent = parentService.getParentById(parentId)!;

  const children = parent.linkedChildIds.map((childId) => {
    const student = parentService.getStudentById(childId);
    const policy = parentService.getPolicy(childId);
    const session = parentService.getActiveSession(childId);
    return {
      student,
      policy,
      activeSession: session,
    };
  });

  res.json({
    parentId: parent.id,
    parentName: parent.fullName,
    linkedChildrenCount: parent.linkedChildIds.length,
    maxAllowedChildren: 2,
    children,
  });
});

/**
 * GET /api/v1/parent/dashboard/:childId
 * Fetch full dashboard metrics for a specific linked child
 */
parentRouter.get('/dashboard/:childId', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const childId = req.params.childId;

  try {
    const metrics = parentService.getDashboardMetricsForChild(parentId, childId);
    res.json(metrics);
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Access denied' });
  }
});

/**
 * PUT /api/v1/parent/policy/:childId
 * Update parental control policy for child (enforcing age-based rules)
 */
parentRouter.put('/policy/:childId', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const childId = req.params.childId;
  const updates = req.body;

  const result = parentService.updatePolicy(parentId, childId, updates);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    status: 'POLICY_UPDATED',
    policy: result.policy,
  });
});

/**
 * POST /api/v1/parent/link-child
 * Link an existing child to this parent account (max 2)
 */
parentRouter.post('/link-child', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId is required' });
  }

  const result = parentService.linkChild(parentId, studentId);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({ status: 'LINKED', message: result.message });
});

/**
 * POST /api/v1/parent/link-with-code
 * Secure pairing-code workflow: verifies time-limited 6-character code and links child
 */
parentRouter.post('/link-with-code', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Pairing code (e.g. BL-XXXX) is required.' });
  }

  const result = parentService.linkChildWithPairingCode(parentId, code);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    status: 'LINKED',
    message: result.message,
    child: result.child,
  });
});

/**
 * POST /api/v1/parent/unlock-request/respond
 * Parent responds to unlock request (Approve with extension or Reject)
 */
parentRouter.post('/unlock-request/respond', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const { requestId, approved, extensionMinutes } = req.body;

  if (!requestId || typeof approved !== 'boolean') {
    return res.status(400).json({ error: 'requestId and approved boolean are required.' });
  }

  try {
    const result = parentService.respondToUnlockRequest(requestId, parentId, approved, extensionMinutes || 15);
    res.json({
      status: approved ? 'UNLOCKED' : 'REJECTED',
      request: result.request,
      session: result.session,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/v1/parent/override-pin
 * Instant on-device override using parent PIN
 */
parentRouter.post('/override-pin', (req: Request, res: Response) => {
  const { studentId, pin, extensionMinutes } = req.body;

  if (!studentId || !pin) {
    return res.status(400).json({ error: 'studentId and pin are required.' });
  }

  const result = parentService.directPinOverride(studentId, pin, extensionMinutes || 30);
  if (!result.success) {
    return res.status(403).json({ error: result.message });
  }

  res.json({
    status: 'PIN_OVERRIDE_SUCCESSFUL',
    session: result.session,
    message: result.message,
  });
});

/**
 * POST /api/v1/parent/emergency-restrict/:childId
 * Instantly restricts/locks a child's active study session
 */
parentRouter.post('/emergency-restrict/:childId', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const childId = req.params.childId;

  try {
    const result = parentService.emergencyRestrict(parentId, childId);
    res.json({ status: 'RESTRICTED', session: result.session });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

/**
 * GET /api/v1/parent/alerts
 * Fetch alerts for parent
 */
parentRouter.get('/alerts', requireParentAuth, (req: Request, res: Response) => {
  const parentId = (req as any).parentId;
  const alerts = parentService.getAlertsForParent(parentId);
  res.json({ alerts });
});
