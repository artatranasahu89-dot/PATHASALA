/**
 * BharatLearn AI — Parental Guidance, Study Focus & Screen-Time Management Service
 * Strictly enforces child linking limits (max 2), age-based policies, session timers,
 * 1m/5m/10m progressive thresholds, duplicate alert suppression, and RBAC authorization.
 */

import type {
  ParentAccountEntity,
  ParentalControlPolicyEntity,
  StudySessionEntity,
  ParentAlertEntity,
  ParentUnlockRequestEntity,
} from '../types';

export class ParentalService {
  // In-memory data store with predefined pilot accounts
  private static parents: Map<string, ParentAccountEntity> = new Map();
  private static students: Map<string, {
    id: string;
    fullName: string;
    gradeLevel: number;
    category: string;
    assignedClass: string;
    curriculumCode: string;
    schoolName: string;
    isMinor: boolean;
    parentLinkId?: string;
    privacyConsentGiven?: boolean;
  }> = new Map();
  private static policies: Map<string, ParentalControlPolicyEntity> = new Map(); // key = studentId
  private static sessions: Map<string, StudySessionEntity> = new Map(); // key = sessionId
  private static activeSessionByStudent: Map<string, string> = new Map(); // studentId -> sessionId
  private static alerts: ParentAlertEntity[] = [];
  private static unlockRequests: Map<string, ParentUnlockRequestEntity> = new Map();

  static {
    // Seed Parent Account: Rajesh Mohanty
    const parentId = 'parent_rajesh_01';
    const child1Id = 'learner_pilot_odia_01'; // Subhashree (Class 10)
    const child2Id = 'learner_aarav_02'; // Aarav (Class 4)

    this.parents.set(parentId, {
      id: parentId,
      fullName: 'ରାଜେଶ ମହାନ୍ତି (Rajesh Mohanty)',
      phoneNumber: '+919876543210',
      email: 'rajesh.mohanty@example.in',
      linkedChildIds: [child1Id, child2Id],
      notificationPrefs: {
        inAppAlerts: true,
        emailSummary: true,
        smsUrgentAlerts: true,
      },
      createdAt: '2026-09-01T08:00:00Z',
    });

    // Seed Child 1: Subhashree (Class 10, Secondary Pilot)
    this.students.set(child1Id, {
      id: child1Id,
      fullName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)',
      gradeLevel: 10,
      category: 'SECONDARY',
      assignedClass: 'Class 10-A, BSE Odisha',
      curriculumCode: 'BSE_ODISHA',
      schoolName: 'ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, କଟକ (Govt High School, Cuttack)',
      isMinor: true,
      parentLinkId: parentId,
      privacyConsentGiven: true,
    });

    // Seed Child 2: Aarav (Class 4, Primary School)
    this.students.set(child2Id, {
      id: child2Id,
      fullName: 'ଆରଭ ମହାନ୍ତି (Aarav Mohanty)',
      gradeLevel: 4,
      category: 'PRIMARY',
      assignedClass: 'Class 4-B, Primary School',
      curriculumCode: 'BSE_ODISHA',
      schoolName: 'ପ୍ରାଥମିକ ବିଦ୍ୟାଳୟ, କଟକ (Primary School, Cuttack)',
      isMinor: true,
      parentLinkId: parentId,
      privacyConsentGiven: true,
    });

    // Seed Child 3 (Unlinked, for testing max 2 limit rejection)
    this.students.set('learner_third_child_03', {
      id: 'learner_third_child_03',
      fullName: 'ରୋହିତ ମହାନ୍ତି (Rohit Mohanty)',
      gradeLevel: 7,
      category: 'MIDDLE',
      assignedClass: 'Class 7-A',
      curriculumCode: 'BSE_ODISHA',
      schoolName: 'ସରକାରୀ ମଧ୍ୟମ ବିଦ୍ୟାଳୟ',
      isMinor: true,
    });

    // Seed Policy for Child 1 (Classes 6-10: controls enabled by default)
    this.policies.set(child1Id, {
      studentId: child1Id,
      parentId,
      controlsEnabled: true,
      dailyScreenTimeLimitMinutes: 90,
      maxContinuousSessionMinutes: 45,
      mandatoryBreakMinutes: 10,
      studySchedule: {
        allowedStartTime: '07:00',
        allowedEndTime: '21:00',
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
      permittedActivities: {
        allowLessons: true,
        allowPracticeQuizzes: true,
        allowEducationalVideos: true,
        allowReading: true,
      },
      inactivityThresholds: {
        notifyParentMinutes: 1,
        studentReminderMinutes: 5,
        restrictAppMinutes: 10,
        notifyParentEnabled: true,
        studentReminderEnabled: true,
        restrictAppEnabled: true,
      },
      cameraFocusAssistance: {
        enabledByParent: false,
        requireStudentConsent: true,
      },
      updatedAt: '2026-10-14T00:00:00Z',
    });

    // Seed Policy for Child 2 (Classes 1-5: controls enabled by default, 45 min screen limit)
    this.policies.set(child2Id, {
      studentId: child2Id,
      parentId,
      controlsEnabled: true,
      dailyScreenTimeLimitMinutes: 45,
      maxContinuousSessionMinutes: 20,
      mandatoryBreakMinutes: 15,
      studySchedule: {
        allowedStartTime: '08:00',
        allowedEndTime: '19:00',
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
      permittedActivities: {
        allowLessons: true,
        allowPracticeQuizzes: true,
        allowEducationalVideos: false,
        allowReading: true,
      },
      inactivityThresholds: {
        notifyParentMinutes: 1,
        studentReminderMinutes: 5,
        restrictAppMinutes: 10,
        notifyParentEnabled: true,
        studentReminderEnabled: true,
        restrictAppEnabled: true,
      },
      cameraFocusAssistance: {
        enabledByParent: false,
        requireStudentConsent: true,
      },
      updatedAt: '2026-10-14T00:00:00Z',
    });
  }

  // ==========================================
  // AUTHENTICATION & LINKING
  // ==========================================

  static getParentAccount(parentId: string): ParentAccountEntity | undefined {
    return this.parents.get(parentId);
  }

  static getStudentProfile(studentId: string) {
    return this.students.get(studentId);
  }

  /**
   * Links a child to a parent account.
   * Strict Rule: Max 2 children per parent account! Rejects a 3rd child.
   */
  static linkChild(parentId: string, studentId: string): { success: boolean; error?: string; parent?: ParentAccountEntity } {
    const parent = this.parents.get(parentId);
    if (!parent) {
      return { success: false, error: 'Parent account not found' };
    }

    if (parent.linkedChildIds.includes(studentId)) {
      return { success: true, parent };
    }

    // ENFORCE LIMIT: Maximum 2 children
    if (parent.linkedChildIds.length >= 2) {
      return {
        success: false,
        error: 'Account limit reached: A parent account can link a maximum of 2 children.',
      };
    }

    const student = this.students.get(studentId);
    if (!student) {
      return { success: false, error: 'Student ID not found in system' };
    }

    // Link student
    parent.linkedChildIds.push(studentId);
    student.parentLinkId = parentId;

    // Apply default policy based on age/grade
    const isSeniorSecondary = student.gradeLevel >= 11;
    this.policies.set(studentId, {
      studentId,
      parentId,
      controlsEnabled: !isSeniorSecondary, // Classes 1-10: enabled; Classes 11-12: optional
      dailyScreenTimeLimitMinutes: student.gradeLevel <= 5 ? 45 : 90,
      maxContinuousSessionMinutes: student.gradeLevel <= 5 ? 20 : 45,
      mandatoryBreakMinutes: 10,
      studySchedule: {
        allowedStartTime: '07:00',
        allowedEndTime: student.gradeLevel <= 5 ? '19:00' : '21:00',
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
      permittedActivities: {
        allowLessons: true,
        allowPracticeQuizzes: true,
        allowEducationalVideos: student.gradeLevel > 5,
        allowReading: true,
      },
      inactivityThresholds: {
        notifyParentMinutes: 1,
        studentReminderMinutes: 5,
        restrictAppMinutes: 10,
        notifyParentEnabled: true,
        studentReminderEnabled: true,
        restrictAppEnabled: true,
      },
      cameraFocusAssistance: {
        enabledByParent: false,
        requireStudentConsent: true,
      },
      updatedAt: new Date().toISOString(),
    });

    return { success: true, parent };
  }

  /**
   * Verify if a parent is authorized to access a student's records
   */
  static isParentAuthorized(parentId: string, studentId: string): boolean {
    const parent = this.parents.get(parentId);
    if (!parent) return false;
    return parent.linkedChildIds.includes(studentId);
  }

  // ==========================================
  // POLICY & CONTROLS MANAGEMENT
  // ==========================================

  static getPolicy(studentId: string, requesterId: string, requesterRole: string): ParentalControlPolicyEntity | null {
    // Authorization check
    if (requesterRole === 'PARENT') {
      if (!this.isParentAuthorized(requesterId, studentId)) {
        throw new Error('FORBIDDEN: Parent is not authorized to access this student record.');
      }
    } else if (requesterRole === 'STUDENT') {
      if (requesterId !== studentId) {
        throw new Error('FORBIDDEN: Students can only view their own policy status.');
      }
    }

    return this.policies.get(studentId) || null;
  }

  static updatePolicy(
    parentId: string,
    studentId: string,
    updates: Partial<ParentalControlPolicyEntity>
  ): ParentalControlPolicyEntity {
    if (!this.isParentAuthorized(parentId, studentId)) {
      throw new Error('FORBIDDEN: Unauthorized parent access.');
    }

    const existing = this.policies.get(studentId);
    if (!existing) {
      throw new Error('Policy not found for student.');
    }

    const updated: ParentalControlPolicyEntity = {
      ...existing,
      ...updates,
      studentId,
      parentId,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(studentId, updated);
    return updated;
  }

  static updateChildClass(parentId: string, studentId: string, assignedClass: string, gradeLevel?: number) {
    if (!this.isParentAuthorized(parentId, studentId)) {
      throw new Error('FORBIDDEN: Unauthorized parent access.');
    }

    const student = this.students.get(studentId);
    if (!student) throw new Error('Student not found.');

    student.assignedClass = assignedClass;
    if (gradeLevel) {
      student.gradeLevel = gradeLevel;
      student.isMinor = gradeLevel <= 10;
    }
    return student;
  }

  // ==========================================
  // STUDY SESSION STATE MACHINE & TIMERS
  // ==========================================

  static startSession(params: {
    studentId: string;
    activityType: StudySessionEntity['activityType'];
    title: string;
    subjectId: string;
    cameraMonitoringActive?: boolean;
  }): StudySessionEntity {
    const student = this.students.get(params.studentId);
    if (!student) throw new Error('Student not found.');

    const policy = this.policies.get(params.studentId);
    const now = new Date();
    const nowIso = now.toISOString();

    // Check policy schedule if enabled
    if (policy && policy.controlsEnabled) {
      const currentHoursMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHoursMinutes < policy.studySchedule.allowedStartTime || currentHoursMinutes > policy.studySchedule.allowedEndTime) {
        const session: StudySessionEntity = {
          id: `sess_${crypto.randomUUID().slice(0, 8)}`,
          studentId: params.studentId,
          activityType: params.activityType,
          title: params.title,
          subjectId: params.subjectId,
          state: 'RESTRICTED',
          startTime: nowIso,
          accumulatedStudyDurationSeconds: 0,
          lastActiveTimestamp: nowIso,
          inactivitySeconds: 0,
          totalBreakDurationSeconds: 0,
          cameraMonitoringActive: false,
          restrictionReason: 'OUTSIDE_ALLOWED_HOURS',
          events: [
            {
              id: `evt_${Date.now()}`,
              sessionId: '',
              studentId: params.studentId,
              eventType: 'RESTRICTION_APPLIED',
              timestamp: nowIso,
              details: { reason: 'OUTSIDE_ALLOWED_HOURS' },
            },
          ],
          triggeredAlertMilestones: { oneMinute: false, fiveMinute: false, tenMinute: false },
        };
        this.sessions.set(session.id, session);
        return session;
      }
    }

    const sessionId = `sess_${crypto.randomUUID().slice(0, 8)}`;
    const session: StudySessionEntity = {
      id: sessionId,
      studentId: params.studentId,
      activityType: params.activityType,
      title: params.title,
      subjectId: params.subjectId,
      state: 'ACTIVE_STUDY',
      startTime: nowIso,
      accumulatedStudyDurationSeconds: 0,
      lastActiveTimestamp: nowIso,
      inactivitySeconds: 0,
      totalBreakDurationSeconds: 0,
      cameraMonitoringActive: !!params.cameraMonitoringActive,
      events: [
        {
          id: `evt_${Date.now()}`,
          sessionId,
          studentId: params.studentId,
          eventType: 'SESSION_START',
          timestamp: nowIso,
          details: { activityType: params.activityType, title: params.title },
        },
      ],
      triggeredAlertMilestones: {
        oneMinute: false,
        fiveMinute: false,
        tenMinute: false,
      },
    };

    this.sessions.set(sessionId, session);
    this.activeSessionByStudent.set(params.studentId, sessionId);
    return session;
  }

  static getActiveSession(studentId: string): StudySessionEntity | null {
    const sessionId = this.activeSessionByStudent.get(studentId);
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session || session.state === 'SESSION_COMPLETED') return null;

    // Recalculate duration & heartbeat against real server clock
    return this.evaluateHeartbeat(sessionId, studentId);
  }

  /**
   * Resets inactivity tracking when legitimate learning activity occurs:
   * reading, scrolling, answering questions, playing lesson video, etc.
   */
  static recordInteraction(sessionId: string, studentId: string, interactionType = 'USER_INTERACTION'): StudySessionEntity {
    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Session not found or ownership mismatch.');
    }

    if (session.state === 'RESTRICTED' || session.state === 'SESSION_COMPLETED') {
      return session;
    }

    const now = Date.now();
    const lastActive = new Date(session.lastActiveTimestamp).getTime();
    const elapsedSinceLastActive = Math.max(0, Math.floor((now - lastActive) / 1000));

    // If student was on an authorized break, do not accumulate study time
    if (session.state !== 'IDLE') {
      // Accumulate legitimate study time up to 10 minutes max per gap
      const legitimateStudyIncrement = Math.min(elapsedSinceLastActive, 600);
      session.accumulatedStudyDurationSeconds += legitimateStudyIncrement;
    }

    // Reset inactivity tracking and clear milestone flags for this new episode
    session.lastActiveTimestamp = new Date(now).toISOString();
    session.inactivitySeconds = 0;
    session.state = 'ACTIVE_STUDY';
    session.triggeredAlertMilestones = {
      oneMinute: false,
      fiveMinute: false,
      tenMinute: false,
    };

    session.events.push({
      id: `evt_${Date.now()}`,
      sessionId,
      studentId,
      eventType: 'ACTIVITY_INTERACTION',
      timestamp: new Date(now).toISOString(),
      details: { interactionType },
    });

    return session;
  }

  /**
   * Evaluates inactivity and screen-time rules against real server timestamps.
   * Handles 1m, 5m, and 10m thresholds with strict duplicate alert suppression.
   */
  static evaluateHeartbeat(sessionId: string, studentId: string): StudySessionEntity {
    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Session not found.');
    }

    if (session.state === 'RESTRICTED' || session.state === 'SESSION_COMPLETED' || session.state === 'PARENT_UNLOCKED') {
      return session;
    }

    const now = Date.now();
    const lastActive = new Date(session.lastActiveTimestamp).getTime();
    const inactivitySeconds = Math.max(0, Math.floor((now - lastActive) / 1000));
    session.inactivitySeconds = inactivitySeconds;

    const policy = this.policies.get(studentId);
    const student = this.students.get(studentId);

    // 1. Check Daily Screen Time Limit
    if (policy && policy.controlsEnabled) {
      const todayMinutes = Math.floor(session.accumulatedStudyDurationSeconds / 60);
      if (todayMinutes >= policy.dailyScreenTimeLimitMinutes) {
        session.state = 'RESTRICTED';
        session.restrictionReason = 'DAILY_SCREEN_TIME_EXCEEDED';
        this.addAlert({
          studentId,
          studentName: student?.fullName || 'Student',
          severity: 'CRITICAL',
          title: 'ଦୈନନ୍ଦିନ ସମୟ ସୀମା ସମାପ୍ତ (Daily Screen-Time Limit Reached)',
          message: `${student?.fullName || 'Student'} has reached today's limit of ${policy.dailyScreenTimeLimitMinutes} minutes.`,
        });
        return session;
      }
    }

    // 2. Progressive Threshold: 1 Minute of sustained suspected inactivity
    if (inactivitySeconds >= 60 && !session.triggeredAlertMilestones.oneMinute) {
      session.triggeredAlertMilestones.oneMinute = true;
      session.state = 'POSSIBLE_INACTIVITY';
      if (policy?.inactivityThresholds.notifyParentEnabled) {
        this.addAlert({
          studentId,
          studentName: student?.fullName || 'Student',
          severity: 'INFO',
          title: 'ଅସକ୍ରିୟତା ସୂଚନା (1-Min Inactivity Notice)',
          message: `${student?.fullName || 'Student'} has been inactive on screen for 1 minute during ${session.title}.`,
        });
      }
      session.events.push({
        id: `evt_${Date.now()}`,
        sessionId,
        studentId,
        eventType: 'INACTIVITY_1MIN',
        timestamp: new Date().toISOString(),
        details: { inactivitySeconds },
      });
    }

    // 3. Progressive Threshold: 5 Minutes - Student reminder
    if (inactivitySeconds >= 300 && !session.triggeredAlertMilestones.fiveMinute) {
      session.triggeredAlertMilestones.fiveMinute = true;
      session.state = 'REMINDER';
      session.events.push({
        id: `evt_${Date.now()}`,
        sessionId,
        studentId,
        eventType: 'INACTIVITY_5MIN',
        timestamp: new Date().toISOString(),
        details: { inactivitySeconds },
      });
    }

    // 4. Progressive Threshold: 10 Minutes - Parent alert & in-app restriction
    if (inactivitySeconds >= 600 && !session.triggeredAlertMilestones.tenMinute) {
      session.triggeredAlertMilestones.tenMinute = true;
      session.state = 'RESTRICTED';
      session.restrictionReason = 'INACTIVITY_LIMIT';

      if (policy?.inactivityThresholds.restrictAppEnabled) {
        this.addAlert({
          studentId,
          studentName: student?.fullName || 'Student',
          severity: 'WARNING',
          title: '୧୦ ମିନିଟ୍ ଅସକ୍ରିୟତା ଯୋଗୁଁ ଅଧିବେଶନ ସୀମିତ (10-Min Inactivity Restriction)',
          message: `${student?.fullName || 'Student'}'s study session was paused due to 10 minutes of continuous inactivity.`,
        });
      }

      session.events.push({
        id: `evt_${Date.now()}`,
        sessionId,
        studentId,
        eventType: 'INACTIVITY_10MIN',
        timestamp: new Date().toISOString(),
        details: { inactivitySeconds },
      });
    }

    return session;
  }

  // ==========================================
  // PARENT UNLOCK WORKFLOW
  // ==========================================

  static requestUnlock(sessionId: string, studentId: string, studentNote?: string): ParentUnlockRequestEntity {
    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Session not found or unauthorized.');
    }

    const student = this.students.get(studentId);
    const parentId = student?.parentLinkId || 'parent_rajesh_01';

    const reqId = `unl_${crypto.randomUUID().slice(0, 8)}`;
    const unlockReq: ParentUnlockRequestEntity = {
      id: reqId,
      studentId,
      studentName: student?.fullName || 'Student',
      parentId,
      sessionId,
      reason: session.restrictionReason || 'INACTIVITY_LIMIT',
      studentNote,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.unlockRequests.set(reqId, unlockReq);

    this.addAlert({
      studentId,
      studentName: student?.fullName || 'Student',
      severity: 'WARNING',
      title: 'ଅଧିବେଶନ ଖୋଲିବାକୁ ଅନୁରୋଧ (Parent Unlock Requested)',
      message: `${student?.fullName || 'Student'} requested parent unlock: "${studentNote || 'Please allow me to continue studying'}"`,
    });

    return unlockReq;
  }

  static processUnlock(
    parentId: string,
    requestId: string,
    approved: boolean,
    extensionMinutes = 30
  ): { success: boolean; session?: StudySessionEntity } {
    const req = this.unlockRequests.get(requestId);
    if (!req) throw new Error('Unlock request not found.');

    if (!this.isParentAuthorized(parentId, req.studentId)) {
      throw new Error('FORBIDDEN: Parent is not authorized to unlock this student.');
    }

    req.status = approved ? 'APPROVED' : 'REJECTED';
    req.extensionMinutesGranted = approved ? extensionMinutes : 0;
    req.decidedAt = new Date().toISOString();

    const session = this.sessions.get(req.sessionId);
    if (session && approved) {
      session.state = 'PARENT_UNLOCKED';
      session.restrictionReason = undefined;
      session.lastActiveTimestamp = new Date().toISOString();
      session.inactivitySeconds = 0;
      session.triggeredAlertMilestones = { oneMinute: false, fiveMinute: false, tenMinute: false };

      session.events.push({
        id: `evt_${Date.now()}`,
        sessionId: session.id,
        studentId: req.studentId,
        eventType: 'PARENT_UNLOCKED',
        timestamp: new Date().toISOString(),
        details: { extensionMinutes, approvedBy: parentId },
      });

      return { success: true, session };
    }

    return { success: true, session };
  }

  static completeSession(sessionId: string, studentId: string): StudySessionEntity {
    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Session not found.');
    }

    session.state = 'SESSION_COMPLETED';
    session.endTime = new Date().toISOString();
    session.cameraMonitoringActive = false; // ensure camera tracking stops
    this.activeSessionByStudent.delete(studentId);

    session.events.push({
      id: `evt_${Date.now()}`,
      sessionId,
      studentId,
      eventType: 'SESSION_END',
      timestamp: session.endTime,
      details: { totalDurationSeconds: session.accumulatedStudyDurationSeconds },
    });

    return session;
  }

  // ==========================================
  // ALERTS & METRICS FOR PARENT DASHBOARD
  // ==========================================

  private static addAlert(alert: Omit<ParentAlertEntity, 'id' | 'timestamp' | 'acknowledged'>) {
    const newAlert: ParentAlertEntity = {
      ...alert,
      id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.alerts.unshift(newAlert);
    if (this.alerts.length > 50) this.alerts.pop();
  }

  static acknowledgeAlert(alertId: string) {
    const a = this.alerts.find((alt) => alt.id === alertId);
    if (a) a.acknowledged = true;
  }

  static getDashboardMetrics(parentId: string, childId: string) {
    if (!this.isParentAuthorized(parentId, childId)) {
      throw new Error('FORBIDDEN: Unauthorized access to child dashboard.');
    }

    const student = this.students.get(childId);
    if (!student) throw new Error('Student not found.');

    const policy = this.policies.get(childId) || {
      studentId: childId,
      parentId,
      controlsEnabled: student.gradeLevel <= 10,
      dailyScreenTimeLimitMinutes: 90,
      maxContinuousSessionMinutes: 45,
      mandatoryBreakMinutes: 10,
      studySchedule: { allowedStartTime: '07:00', allowedEndTime: '21:00', allowedDays: [0, 1, 2, 3, 4, 5, 6] },
      permittedActivities: { allowLessons: true, allowPracticeQuizzes: true, allowEducationalVideos: true, allowReading: true },
      inactivityThresholds: { notifyParentMinutes: 1, studentReminderMinutes: 5, restrictAppMinutes: 10, notifyParentEnabled: true, studentReminderEnabled: true, restrictAppEnabled: true },
      cameraFocusAssistance: { enabledByParent: false, requireStudentConsent: true },
      updatedAt: new Date().toISOString(),
    };

    const activeSessionId = this.activeSessionByStudent.get(childId);
    const activeSession = activeSessionId ? this.sessions.get(activeSessionId) : null;

    let currentStatus: 'NOT_STUDYING' | 'STUDYING' | 'ON_BREAK' | 'SESSION_RESTRICTED' = 'NOT_STUDYING';
    if (activeSession) {
      if (activeSession.state === 'RESTRICTED') currentStatus = 'SESSION_RESTRICTED';
      else if (activeSession.state === 'IDLE') currentStatus = 'ON_BREAK';
      else currentStatus = 'STUDYING';
    }

    const todayDurationMinutes = Math.floor(
      (activeSession?.accumulatedStudyDurationSeconds || 2400) / 60
    );

    const childAlerts = this.alerts.filter((a) => a.studentId === childId);
    const pendingUnlocks = Array.from(this.unlockRequests.values()).filter(
      (u) => u.studentId === childId && u.status === 'PENDING'
    );

    return {
      childId,
      childName: student.fullName,
      gradeLevel: student.gradeLevel,
      assignedClass: student.assignedClass,
      curriculumCode: student.curriculumCode,
      currentStatus,
      activeSessionTitle: activeSession?.title,
      todayStudyDurationMinutes: todayDurationMinutes,
      dailyScreenTimeLimitMinutes: policy.dailyScreenTimeLimitMinutes,
      screenTimeUsagePercentage: Math.min(
        100,
        Math.round((todayDurationMinutes / policy.dailyScreenTimeLimitMinutes) * 100)
      ),
      completedActivitiesCount: 4,
      recentSubjectsStudied: ['ଜୀବ ବିଜ୍ଞାନ (Life Science)', 'ଭୌତିକ ବିଜ୍ଞାନ (Physical Science)'],
      policy,
      recentAlerts: childAlerts.slice(0, 8),
      pendingUnlockRequests: pendingUnlocks,
      cameraFocusStatus: {
        enabledByPolicy: policy.cameraFocusAssistance.enabledByParent,
        activelyStreaming: !!activeSession?.cameraMonitoringActive,
        limitationNote:
          'Local frame presence verification only. No video recorded or uploaded. Camera evidence is never used punitively.',
      },
    };
  }
}
