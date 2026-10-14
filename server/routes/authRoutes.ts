/**
 * BharatLearn AI — Authentication and Session API Router
 * Implements server-side identity verification, separate parent/student roles,
 * student pairing code generation, and profile loading.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authService, UserRole } from '../services/authService';
import { parentService } from '../services/parentService';

export const authRouter = Router();

// Extended Request interface
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    role: UserRole;
    email: string;
    displayName: string;
  };
}

/**
 * Authentication Middleware: Validates Bearer token or Authorization header
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-auth-token'] as string) || (req.headers['x-session-token'] as string);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const session = authService.verifySession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = {
    uid: session.uid,
    role: session.role,
    email: session.email,
    displayName: session.displayName,
  };

  next();
}

/**
 * Role Enforcement Middleware: Never trusts client-supplied roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access Denied: Requires one of [${allowedRoles.join(', ')}] role. Your role is ${req.user?.role || 'NONE'}.`,
      });
    }
    next();
  };
}

/**
 * POST /api/v1/auth/login
 * Unified secure login for parents or students
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { identifier, secret } = req.body;

  if (!identifier || !secret) {
    return res.status(400).json({ error: 'identifier (email or phone) and secret (password or PIN) are required.' });
  }

  try {
    const { user, token } = authService.login(identifier, secret);
    
    // Also load profile details
    let studentProfile = null;
    let parentProfile = null;

    if (user.role === 'STUDENT') {
      studentProfile = parentService.getStudentById(user.uid);
    } else if (user.role === 'PARENT') {
      parentProfile = parentService.getParentById(user.uid);
    }

    res.json({
      status: 'AUTHENTICATED',
      user,
      token,
      studentProfile,
      parentProfile,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
});

/**
 * POST /api/v1/auth/register-student
 * Student self-registration (hard-coded role: 'STUDENT')
 */
authRouter.post('/register-student', (req: Request, res: Response) => {
  const { email, displayName, secret, category, gradeLevel, assignedClass, curriculumCode } = req.body;

  if (!email || !displayName || !secret || !category || !assignedClass) {
    return res.status(400).json({
      error: 'email, displayName, secret, category, and assignedClass are required.',
    });
  }

  try {
    const { user, token } = authService.registerStudent({
      email,
      displayName,
      secret,
      category,
      gradeLevel: Number(gradeLevel) || 10,
      assignedClass,
      curriculumCode,
    });

    // Register student in parentService store
    parentService.registerStudent({
      id: user.uid,
      fullName: user.displayName,
      category,
      gradeLevel: Number(gradeLevel) || 10,
      assignedClass,
      curriculumCode: curriculumCode || 'BSE_ODISHA',
      isMinor: (Number(gradeLevel) || 10) <= 10,
    });

    const studentProfile = parentService.getStudentById(user.uid);

    res.status(201).json({
      status: 'REGISTERED',
      user,
      token,
      studentProfile,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/v1/auth/register-parent
 * Parent registration (hard-coded role: 'PARENT')
 */
authRouter.post('/register-parent', (req: Request, res: Response) => {
  const { email, phoneNumber, displayName, pin } = req.body;

  if (!email || !displayName || !pin) {
    return res.status(400).json({ error: 'email, displayName, and 4-digit PIN are required.' });
  }

  try {
    const { user, token } = authService.registerParent({
      email,
      phoneNumber,
      displayName,
      pin,
    });

    parentService.registerParent({
      id: user.uid,
      fullName: user.displayName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      linkedChildIds: [],
    });

    res.status(201).json({
      status: 'REGISTERED',
      user,
      token,
      parentProfile: parentService.getParentById(user.uid),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/v1/auth/me
 * Validate session token and return identity
 */
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let studentProfile = null;
  let parentProfile = null;

  if (user.role === 'STUDENT') {
    studentProfile = parentService.getStudentById(user.uid);
  } else if (user.role === 'PARENT') {
    parentProfile = parentService.getParentById(user.uid);
  }

  res.json({
    user,
    studentProfile,
    parentProfile,
  });
});

/**
 * POST /api/v1/auth/logout
 * Invalidate session token
 */
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (req.headers['x-auth-token'] as string);

  if (token) {
    authService.invalidateSession(token);
  }

  res.json({ status: 'LOGGED_OUT' });
});

/**
 * POST /api/v1/auth/student/generate-pairing-code
 * Student generates a secure, time-limited 6-character pairing code
 */
authRouter.post(
  '/student/generate-pairing-code',
  requireAuth,
  requireRole(['STUDENT']),
  (req: AuthenticatedRequest, res: Response) => {
    const studentUid = req.user!.uid;
    const student = parentService.getStudentById(studentUid);

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    const codeInfo = authService.generateStudentPairingCode(student);

    res.json({
      status: 'CODE_GENERATED',
      ...codeInfo,
    });
  }
);

/**
 * GET /api/v1/auth/student/profile/:studentId
 * Loads authoritative server-persisted profile.
 * Prevents tampering with assignedClass or category.
 */
authRouter.get('/student/profile/:studentId', (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const student = parentService.getStudentById(studentId);

  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const policy = parentService.getPolicy(studentId);

  res.json({
    student,
    policy,
  });
});
