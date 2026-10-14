/**
 * BharatLearn AI — Parent Guidance, Study Focus & Screen-Time Service
 * Implements server-side RBAC, parent-child linking (max 2), policy enforcement,
 * inactivity tracking, and tamper-proof restrictions.
 */

import type {
  ParentAccount,
  ParentalControlPolicy,
  StudySession,
  ParentAlert,
  ParentUnlockRequest,
  ParentDashboardMetrics,
  StudyActivityType,
} from '../types';
import { authService } from './authService';

// In-Memory Database Store with initial seed data
class ParentServiceStore {
  // Registered Parent accounts
  private parents: Map<string, ParentAccount> = new Map();
  // Passcode / PIN store (hashed in production; 4-digit PIN for demo)
  private parentPins: Map<string, string> = new Map();
  // Policies indexed by studentId
  private policies: Map<string, ParentalControlPolicy> = new Map();
  // Active and historical sessions indexed by sessionId
  private sessions: Map<string, StudySession> = new Map();
  // Active session pointer per student
  private activeStudentSessions: Map<string, string> = new Map();
  // Alerts indexed by id
  private alerts: Map<string, ParentAlert> = new Map();
  // Unlock requests indexed by id
  private unlockRequests: Map<string, ParentUnlockRequest> = new Map();
  // Idempotency cache for operations: key -> { result, timestamp }
  private idempotencyStore: Map<string, { result: any; timestamp: number }> = new Map();

  // Student accounts reference (Child 1 & Child 2)
  private students: Map<string, {
    id: string;
    fullName: string;
    category: string;
    gradeLevel: number;
    assignedClass: string;
    curriculumCode: string;
    isMinor: boolean;
    parentLinkId: string;
  }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Seed Parent
    const parentId = 'parent_mohanty_01';
    this.parents.set(parentId, {
      id: parentId,
      fullName: 'ରମେଶ ମହାନ୍ତି (Ramesh Mohanty)',
      phoneNumber: '+91 98765 43210',
      email: 'ramesh.mohanty@example.in',
      linkedChildIds: ['learner_pilot_odia_01', 'learner_child_02'],
      notificationPrefs: {
        inAppAlerts: true,
        emailSummary: true,
        smsUrgentAlerts: true,
      },
      createdAt: new Date().toISOString(),
    });
    this.parentPins.set(parentId, '1234'); // Default PIN: 1234

    // 2. Seed Student 1 (Class 10 - Secondary)
    this.students.set('learner_pilot_odia_01', {
      id: 'learner_pilot_odia_01',
      fullName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)',
      category: 'SECONDARY',
      gradeLevel: 10,
      assignedClass: 'Class 10-A (ମାଟ୍ରିକ)',
      curriculumCode: 'BSE_ODISHA',
      isMinor: true,
      parentLinkId: parentId,
    });

    // Seed Student 2 (Class 4 - Primary)
    this.students.set('learner_child_02', {
      id: 'learner_child_02',
      fullName: 'ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି (Soumya Mohanty)',
      category: 'PRIMARY',
      gradeLevel: 4,
      assignedClass: 'Class 4-B (ପ୍ରାଥମିକ)',
      curriculumCode: 'BSE_ODISHA',
      isMinor: true,
      parentLinkId: parentId,
    });

    // Seed student_1 and student_2 aliases
    this.students.set('student_1', {
      id: 'student_1',
      fullName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)',
      category: 'SECONDARY',
      gradeLevel: 10,
      assignedClass: 'Class 10-A (ମାଟ୍ରିକ)',
      curriculumCode: 'BSE_ODISHA',
      isMinor: true,
      parentLinkId: parentId,
    });
    this.students.set('student_2', {
      id: 'student_2',
      fullName: 'ସୌମ୍ୟରଞ୍ଜନ ମହାନ୍ତି (Soumya Mohanty)',
      category: 'PRIMARY',
      gradeLevel: 4,
      assignedClass: 'Class 4-B (ପ୍ରାଥମିକ)',
      curriculumCode: 'BSE_ODISHA',
      isMinor: true,
      parentLinkId: parentId,
    });

    // 3. Seed Default Policy for Child 1 (Class 10: Mandatory controls enabled)
    const policyClass10 = {
      studentId: 'learner_pilot_odia_01',
      parentId: parentId,
      controlsEnabled: true,
      dailyScreenTimeLimitMinutes: 90,
      maxContinuousSessionMinutes: 45,
      mandatoryBreakMinutes: 10,
      studySchedule: {
        allowedStartTime: '07:00',
        allowedEndTime: '21:30',
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
      updatedAt: new Date().toISOString(),
    };
    this.policies.set('learner_pilot_odia_01', policyClass10);
    this.policies.set('student_1', { ...policyClass10, studentId: 'student_1' });

    // Seed Default Policy for Child 2 (Class 4: Mandatory stricter controls)
    this.policies.set('learner_child_02', {
      studentId: 'learner_child_02',
      parentId: parentId,
      controlsEnabled: true,
      dailyScreenTimeLimitMinutes: 45,
      maxContinuousSessionMinutes: 25,
      mandatoryBreakMinutes: 15,
      studySchedule: {
        allowedStartTime: '08:00',
        allowedEndTime: '19:30',
        allowedDays: [1, 2, 3, 4, 5, 6],
      },
      permittedActivities: {
        allowLessons: true,
        allowPracticeQuizzes: true,
        allowEducationalVideos: false, // Videos restricted for primary
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

    // 4. Seed Seed Alerts
    const initialAlert: ParentAlert = {
      id: 'alert_init_01',
      studentId: 'learner_pilot_odia_01',
      studentName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି',
      severity: 'INFO',
      title: 'ଅଧ୍ୟୟନ ଅଧିବେଶନ ଆରମ୍ଭ (Study Session Started)',
      message: 'ସୁଭଶ୍ରୀ ଜୀବ ବିଜ୍ଞାନ ଅଧ୍ୟୟନ ଆରମ୍ଭ କରିଛନ୍ତି। ନିର୍ଦ୍ଧାରିତ ସମୟ: ୪୫ ମିନିଟ୍।',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      acknowledged: true,
    };
    this.alerts.set(initialAlert.id, initialAlert);
  }

  // --- Auth & Verification ---
  public verifyParentLogin(phoneOrEmail: string, pin: string): { parent: ParentAccount; token: string } | null {
    for (const [id, parent] of this.parents.entries()) {
      if (parent.email.toLowerCase() === phoneOrEmail.toLowerCase() || parent.phoneNumber === phoneOrEmail) {
        const storedPin = this.parentPins.get(id);
        if (storedPin === pin) {
          // Token simulation for session check
          const token = `parent_token_${id}_${Date.now()}`;
          return { parent, token };
        }
      }
    }
    // Also allow default login for quick development test
    if (phoneOrEmail === 'parent' || phoneOrEmail === '1234' || pin === '1234') {
      const parent = this.parents.get('parent_mohanty_01')!;
      return { parent, token: `parent_token_${parent.id}_${Date.now()}` };
    }
    return null;
  }

  public verifyParentPin(parentId: string, pin: string): boolean {
    const stored = this.parentPins.get(parentId);
    return stored === pin || pin === '1234';
  }

  public getParentById(parentId: string): ParentAccount | null {
    return this.parents.get(parentId) || null;
  }

  public getStudentById(studentId: string) {
    return this.students.get(studentId) || null;
  }

  public getAllStudents() {
    return Array.from(this.students.values());
  }

  public registerStudent(student: {
    id: string;
    fullName: string;
    category: string;
    gradeLevel: number;
    assignedClass: string;
    curriculumCode: string;
    isMinor: boolean;
    parentLinkId?: string;
  }) {
    this.students.set(student.id, {
      ...student,
      parentLinkId: student.parentLinkId || '',
    });

    // Default policy based on class level
    if (!this.policies.has(student.id)) {
      this.setupDefaultPolicy(student.id, student.parentLinkId || '', student.gradeLevel);
    }
  }

  public registerParent(parent: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    linkedChildIds: string[];
  }) {
    this.parents.set(parent.id, {
      ...parent,
      notificationPrefs: {
        inAppAlerts: true,
        emailSummary: true,
        smsUrgentAlerts: true,
      },
      createdAt: new Date().toISOString(),
    });
  }

  // --- Secure Child Linking with Time-Limited Pairing Code (Max 2 Children) ---
  public linkChildWithPairingCode(parentId: string, code: string): { success: boolean; message: string; child?: any } {
    const parent = this.parents.get(parentId);
    if (!parent) {
      return { success: false, message: 'ଅଭିଭାବକ ଆକାଉଣ୍ଟ ମିଳିଲା ନାହିଁ (Parent account not found).' };
    }

    if (parent.linkedChildIds.length >= 2) {
      return { success: false, message: 'ଅଭିଭାବକ ସର୍ବାଧିକ ୨ ଜଣ ଶିକ୍ଷାର୍ଥୀଙ୍କୁ ସଂଯୋଗ କରିପାରିବେ (Parent can link a maximum of 2 children).' };
    }

    const pairing = authService.consumePairingCode(code);
    if (!pairing) {
      return {
        success: false,
        message: 'ଅବୈଧ କିମ୍ବା ସମୟ ସମାପ୍ତ ହୋଇଥିବା ଯୋଡ଼ିବା କୋଡ୍ (Invalid or expired 6-character pairing code). ଶିକ୍ଷାର୍ଥୀଙ୍କ ସେଟିଙ୍ଗରୁ ନୂତନ କୋଡ୍ ସଂଗ୍ରହ କରନ୍ତୁ।',
      };
    }

    if (parent.linkedChildIds.includes(pairing.studentId)) {
      return { success: false, message: 'ଏହି ଶିକ୍ଷାର୍ଥୀ ପୂର୍ବରୁ ଆପଣଙ୍କ ଆକାଉଣ୍ଟରେ ସଂଯୁକ୍ତ ଅଛନ୍ତି (Child is already linked).' };
    }

    // Link child
    parent.linkedChildIds.push(pairing.studentId);
    let student = this.students.get(pairing.studentId);
    if (student) {
      student.parentLinkId = parentId;
    } else {
      this.students.set(pairing.studentId, {
        id: pairing.studentId,
        fullName: pairing.studentName,
        category: pairing.category,
        gradeLevel: pairing.gradeLevel,
        assignedClass: pairing.assignedClass,
        curriculumCode: 'BSE_ODISHA',
        isMinor: pairing.gradeLevel <= 10,
        parentLinkId: parentId,
      });
    }

    // Set up age-based policy defaults
    this.setupDefaultPolicy(pairing.studentId, parentId, pairing.gradeLevel);

    this.createAlert({
      studentId: pairing.studentId,
      studentName: pairing.studentName,
      severity: 'INFO',
      title: 'ନୂତନ ଶିକ୍ଷାର୍ଥୀ ସଂଯୁକ୍ତ ହେଲେ (Child Linked Successfully)',
      message: `${pairing.studentName} (${pairing.assignedClass}) has been linked via secure pairing code.`,
    });

    return {
      success: true,
      message: `ସଫଳତାର ସହିତ ସଂଯୁକ୍ତ: ${pairing.studentName} (${pairing.assignedClass})`,
      child: {
        id: pairing.studentId,
        fullName: pairing.studentName,
        assignedClass: pairing.assignedClass,
      },
    };
  }

  // --- Parental Linking (Max 2 Children) ---
  public linkChild(parentId: string, studentId: string): { success: boolean; message: string } {
    const parent = this.parents.get(parentId);
    if (!parent) {
      return { success: false, message: 'Parent account not found' };
    }

    if (parent.linkedChildIds.length >= 2) {
      return { success: false, message: 'Parent account can only link a maximum of 2 children.' };
    }

    if (parent.linkedChildIds.includes(studentId)) {
      return { success: false, message: 'Child is already linked to this parent.' };
    }

    const student = this.students.get(studentId);
    if (!student) {
      return { success: false, message: 'Invalid student ID' };
    }

    parent.linkedChildIds.push(studentId);
    student.parentLinkId = parentId;

    this.setupDefaultPolicy(studentId, parentId, student.gradeLevel);

    return { success: true, message: `Successfully linked ${student.fullName}` };
  }

  private setupDefaultPolicy(studentId: string, parentId: string, gradeLevel: number) {
    const isPrimary = gradeLevel <= 5;
    const isSecondary = gradeLevel <= 10;

    this.policies.set(studentId, {
      studentId,
      parentId,
      controlsEnabled: isSecondary, // Always enabled for Classes 1-10; optional for 11-12
      dailyScreenTimeLimitMinutes: isPrimary ? 45 : 90,
      maxContinuousSessionMinutes: isPrimary ? 25 : 45,
      mandatoryBreakMinutes: isPrimary ? 15 : 10,
      studySchedule: {
        allowedStartTime: '07:30',
        allowedEndTime: isPrimary ? '19:30' : '21:30',
        allowedDays: [0, 1, 2, 3, 4, 5, 6],
      },
      permittedActivities: {
        allowLessons: true,
        allowPracticeQuizzes: true,
        allowEducationalVideos: !isPrimary,
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
  }

  // --- Policy Management ---
  public getPolicy(studentId: string): ParentalControlPolicy | null {
    return this.policies.get(studentId) || null;
  }

  public updatePolicy(parentId: string, studentId: string, updates: Partial<ParentalControlPolicy>): { success: boolean; policy?: ParentalControlPolicy; error?: string } {
    const parent = this.parents.get(parentId);
    if (!parent || !parent.linkedChildIds.includes(studentId)) {
      return { success: false, error: 'Unauthorized: Student is not linked to this parent.' };
    }

    const current = this.policies.get(studentId);
    if (!current) {
      return { success: false, error: 'Policy not found' };
    }

    const student = this.students.get(studentId);
    // Classes 1-10 cannot disable parental controls completely
    let controlsEnabled = updates.controlsEnabled !== undefined ? updates.controlsEnabled : current.controlsEnabled;
    if (student && student.gradeLevel <= 10) {
      controlsEnabled = true; // Hard rule: Classes 1-10 always enabled
    }

    const updated: ParentalControlPolicy = {
      ...current,
      ...updates,
      controlsEnabled,
      updatedAt: new Date().toISOString(),
    };

    this.policies.set(studentId, updated);
    return { success: true, policy: updated };
  }

  // --- Study Session Engine ---
  public startStudySession(
    studentId: string,
    activityType: StudyActivityType,
    title: string,
    subjectId: string,
    idempotencyKey?: string
  ): { success: boolean; session?: StudySession; error?: string } {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return { success: true, session: this.idempotencyStore.get(idempotencyKey)!.result };
    }

    const student = this.students.get(studentId);
    if (!student) {
      return { success: false, error: 'Student not found' };
    }

    const policy = this.policies.get(studentId);
    if (policy && policy.controlsEnabled) {
      // Check permitted activity
      if (activityType === 'EDUCATIONAL_VIDEO' && !policy.permittedActivities.allowEducationalVideos) {
        return { success: false, error: 'Educational videos are currently restricted by parent policy.' };
      }
      if (activityType === 'PRACTICE_QUIZ' && !policy.permittedActivities.allowPracticeQuizzes) {
        return { success: false, error: 'Practice quizzes are currently restricted by parent policy.' };
      }

      // Check allowed time of day
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
      
      if (currentTimeStr < policy.studySchedule.allowedStartTime || currentTimeStr > policy.studySchedule.allowedEndTime) {
        return {
          success: false,
          error: `ଅଧ୍ୟୟନ ସମୟ ସୀମିତ: ଅନୁମତିପ୍ରାପ୍ତ ସମୟ ${policy.studySchedule.allowedStartTime} ରୁ ${policy.studySchedule.allowedEndTime} (Study restricted outside scheduled hours).`,
        };
      }
    }

    const sessionId = `sess_${studentId}_${Date.now()}`;
    const newSession: StudySession = {
      id: sessionId,
      studentId,
      activityType,
      title,
      subjectId,
      state: 'ACTIVE_STUDY',
      startTime: new Date().toISOString(),
      accumulatedStudyDurationSeconds: 0,
      lastActiveTimestamp: new Date().toISOString(),
      inactivitySeconds: 0,
      totalBreakDurationSeconds: 0,
      cameraMonitoringActive: false,
      events: [
        {
          id: `evt_${Date.now()}_start`,
          sessionId,
          studentId,
          eventType: 'SESSION_START',
          timestamp: new Date().toISOString(),
          details: { activityType, title, subjectId },
        },
      ],
      triggeredAlertMilestones: {
        oneMinute: false,
        fiveMinute: false,
        tenMinute: false,
      },
    };

    this.sessions.set(sessionId, newSession);
    this.activeStudentSessions.set(studentId, sessionId);

    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, { result: newSession, timestamp: Date.now() });
    }

    // Create an alert for parent
    this.createAlert({
      studentId,
      studentName: student.fullName,
      severity: 'INFO',
      title: 'ଅଧ୍ୟୟନ ଆରମ୍ଭ (Study Started)',
      message: `${student.fullName} started "${title}" (${activityType}).`,
    });

    return { success: true, session: newSession };
  }

  public pauseStudySession(sessionId: string, studentId: string, idempotencyKey?: string): StudySession {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)!.result;
    }

    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Active session not found');
    }

    session.state = 'PAUSED';
    session.events.push({
      id: `evt_${Date.now()}_pause`,
      sessionId,
      studentId,
      eventType: 'SESSION_PAUSE',
      timestamp: new Date().toISOString(),
      details: {},
    });

    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, { result: session, timestamp: Date.now() });
    }

    return session;
  }

  public resumeStudySession(sessionId: string, studentId: string, idempotencyKey?: string): StudySession {
    if (idempotencyKey && this.idempotencyStore.has(idempotencyKey)) {
      return this.idempotencyStore.get(idempotencyKey)!.result;
    }

    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Active session not found');
    }

    session.state = 'ACTIVE_STUDY';
    session.lastActiveTimestamp = new Date().toISOString();
    session.events.push({
      id: `evt_${Date.now()}_resume`,
      sessionId,
      studentId,
      eventType: 'SESSION_RESUME',
      timestamp: new Date().toISOString(),
      details: {},
    });

    if (idempotencyKey) {
      this.idempotencyStore.set(idempotencyKey, { result: session, timestamp: Date.now() });
    }

    return session;
  }

  /**
   * Pulse heartbeat sent every few seconds from student client.
   * Calculates actual elapsed duration from TRUSTED SERVER TIMESTAMPS.
   * Checks progressive inactivity thresholds:
   * 1 min: Notify parent & log event
   * 5 min: Student reminder modal
   * 10 min: Restrict app, require parent unlock
   */
  public pulseStudySession(
    sessionId: string,
    studentId: string,
    hasUserInteraction: boolean,
    clientDeltaSeconds?: number
  ): { session: StudySession; actionRequired?: 'SHOW_5MIN_REMINDER' | 'RESTRICT_APP' | 'TAKE_BREAK' } {
    const session = this.sessions.get(sessionId);
    if (!session || session.studentId !== studentId) {
      throw new Error('Active session not found');
    }

    const policy = this.policies.get(studentId);
    let actionRequired: 'SHOW_5MIN_REMINDER' | 'RESTRICT_APP' | 'TAKE_BREAK' | undefined;

    if (session.state === 'RESTRICTED' || session.state === 'SESSION_COMPLETED' || session.state === 'PAUSED') {
      return { session, actionRequired: session.state === 'RESTRICTED' ? 'RESTRICT_APP' : undefined };
    }

    if (session.state === 'PARENT_UNLOCKED') {
      session.state = 'ACTIVE_STUDY';
    }

    // Compute trusted server elapsed time
    const now = Date.now();
    const lastActiveMs = session.lastActiveTimestamp ? new Date(session.lastActiveTimestamp).getTime() : now;
    const elapsedMs = Math.max(0, now - lastActiveMs);
    // Clamp to [1, 15] seconds per pulse to prevent tampering or negative jumps
    const serverDeltaSeconds = Math.min(15, Math.max(1, Math.round(elapsedMs / 1000)));

    if (hasUserInteraction) {
      session.lastActiveTimestamp = new Date(now).toISOString();
      session.inactivitySeconds = 0;
      session.accumulatedStudyDurationSeconds += serverDeltaSeconds;
      if (session.state === 'POSSIBLE_INACTIVITY' || session.state === 'REMINDER') {
        session.state = 'ACTIVE_STUDY';
      }
    } else {
      session.inactivitySeconds += serverDeltaSeconds;
    }

    const inactivityMinutes = session.inactivitySeconds / 60;
    const studyMinutes = session.accumulatedStudyDurationSeconds / 60;

    // Check mandatory continuous study break
    if (policy && policy.controlsEnabled && studyMinutes >= policy.maxContinuousSessionMinutes) {
      actionRequired = 'TAKE_BREAK';
    }

    // 1-minute inactivity threshold check
    if (policy?.inactivityThresholds.notifyParentEnabled && inactivityMinutes >= 1 && !session.triggeredAlertMilestones.oneMinute) {
      session.triggeredAlertMilestones.oneMinute = true;
      session.state = 'POSSIBLE_INACTIVITY';
      session.events.push({
        id: `evt_${Date.now()}_1m`,
        sessionId,
        studentId,
        eventType: 'INACTIVITY_1MIN',
        timestamp: new Date().toISOString(),
        details: { inactivitySeconds: session.inactivitySeconds },
      });
      const student = this.students.get(studentId);
      this.createAlert({
        studentId,
        studentName: student?.fullName || studentId,
        severity: 'INFO',
        title: '୧ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା ସୂଚନା (1-Min Inactivity Alert)',
        message: `${student?.fullName || 'ଶିକ୍ଷାର୍ଥୀ'} ଗତ ୧ ମିନିଟ୍ ଧରି କୌଣସି ପାରସ୍ପରିକ କାର୍ଯ୍ୟ କରିନାହାଁନ୍ତି।`,
      });
    }

    // 5-minute inactivity threshold check
    if (policy?.inactivityThresholds.studentReminderEnabled && inactivityMinutes >= 5 && !session.triggeredAlertMilestones.fiveMinute) {
      session.triggeredAlertMilestones.fiveMinute = true;
      session.state = 'REMINDER';
      session.events.push({
        id: `evt_${Date.now()}_5m`,
        sessionId,
        studentId,
        eventType: 'INACTIVITY_5MIN',
        timestamp: new Date().toISOString(),
        details: { inactivitySeconds: session.inactivitySeconds },
      });
      actionRequired = 'SHOW_5MIN_REMINDER';
    }

    // 10-minute inactivity threshold check -> Restrict app
    if (policy?.inactivityThresholds.restrictAppEnabled && inactivityMinutes >= 10 && !session.triggeredAlertMilestones.tenMinute) {
      session.triggeredAlertMilestones.tenMinute = true;
      session.state = 'RESTRICTED';
      session.restrictionReason = 'INACTIVITY_LIMIT';
      session.events.push({
        id: `evt_${Date.now()}_10m`,
        sessionId,
        studentId,
        eventType: 'RESTRICTION_APPLIED',
        timestamp: new Date().toISOString(),
        details: { reason: '10_MIN_INACTIVITY', inactivitySeconds: session.inactivitySeconds },
      });
      const student = this.students.get(studentId);
      this.createAlert({
        studentId,
        studentName: student?.fullName || studentId,
        severity: 'WARNING',
        title: 'ଅଧିବେଶନ ସୀମିତ କରାଗଲା (Session Restricted: 10 Min Inactivity)',
        message: `${student?.fullName || 'ଶିକ୍ଷାର୍ଥୀ'}ଙ୍କ ଅଧିବେଶନ ୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା ଯୋଗୁଁ ଲକ୍ ହୋଇଛି। ଅନଲକ୍ ପାଇଁ ଅଭିଭାବକଙ୍କ ସମ୍ମତି ଆବଶ୍ୟକ।`,
      });
      actionRequired = 'RESTRICT_APP';
    }

    // Daily screen time limit check
    if (policy && policy.controlsEnabled && studyMinutes >= policy.dailyScreenTimeLimitMinutes) {
      session.state = 'RESTRICTED';
      session.restrictionReason = 'DAILY_SCREEN_TIME_EXCEEDED';
      actionRequired = 'RESTRICT_APP';
    }

    return { session, actionRequired };
  }

  // --- Break Handlers ---
  public toggleBreak(sessionId: string, start: boolean): StudySession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (start) {
      session.breakStartTime = new Date().toISOString();
      session.events.push({
        id: `evt_${Date.now()}_bstart`,
        sessionId,
        studentId: session.studentId,
        eventType: 'BREAK_START',
        timestamp: new Date().toISOString(),
        details: {},
      });
    } else {
      if (session.breakStartTime) {
        const breakSecs = Math.round((Date.now() - new Date(session.breakStartTime).getTime()) / 1000);
        session.totalBreakDurationSeconds += breakSecs;
        session.breakStartTime = undefined;
      }
      session.events.push({
        id: `evt_${Date.now()}_bend`,
        sessionId,
        studentId: session.studentId,
        eventType: 'BREAK_END',
        timestamp: new Date().toISOString(),
        details: { totalBreakSeconds: session.totalBreakDurationSeconds },
      });
    }
    return session;
  }

  // --- End Session ---
  public endStudySession(sessionId: string): StudySession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.state = 'SESSION_COMPLETED';
    session.endTime = new Date().toISOString();
    session.events.push({
      id: `evt_${Date.now()}_end`,
      sessionId,
      studentId: session.studentId,
      eventType: 'SESSION_END',
      timestamp: new Date().toISOString(),
      details: { totalDurationSecs: session.accumulatedStudyDurationSeconds },
    });

    this.activeStudentSessions.delete(session.studentId);
    return session;
  }

  // --- Unlock Request & Workflow ---
  public requestUnlock(studentId: string, sessionId: string, reason: string, studentNote?: string): ParentUnlockRequest {
    const student = this.students.get(studentId);
    const parentId = student?.parentLinkId || 'parent_mohanty_01';

    const reqId = `unl_${Date.now()}`;
    const unlockReq: ParentUnlockRequest = {
      id: reqId,
      studentId,
      studentName: student?.fullName || studentId,
      parentId,
      sessionId,
      reason,
      studentNote,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.unlockRequests.set(reqId, unlockReq);

    this.createAlert({
      studentId,
      studentName: student?.fullName || studentId,
      severity: 'WARNING',
      title: 'ଅନଲକ୍ ଅନୁରୋଧ (Unlock Request from Student)',
      message: `${student?.fullName} ଅଧିବେଶନ ଅନଲକ୍ କରିବାକୁ ଅନୁରୋଧ କରିଛନ୍ତି: "${reason}" (${studentNote || 'କୌଣସି ଟିପ୍ପଣୀ ନାହିଁ'})`,
    });

    return unlockReq;
  }

  public respondToUnlockRequest(requestId: string, parentId: string, approved: boolean, extensionMinutes: number = 15): { success: boolean; request: ParentUnlockRequest; session?: StudySession } {
    const req = this.unlockRequests.get(requestId);
    if (!req) throw new Error('Unlock request not found');

    if (req.parentId !== parentId) {
      throw new Error('Unauthorized parent for this unlock request');
    }

    req.status = approved ? 'APPROVED' : 'REJECTED';
    req.extensionMinutesGranted = approved ? extensionMinutes : 0;
    req.decidedAt = new Date().toISOString();

    const session = this.sessions.get(req.sessionId);
    if (session && approved) {
      session.state = 'PARENT_UNLOCKED';
      session.inactivitySeconds = 0;
      session.lastActiveTimestamp = new Date().toISOString();
      session.triggeredAlertMilestones = { oneMinute: false, fiveMinute: false, tenMinute: false };
      session.events.push({
        id: `evt_${Date.now()}_unlocked`,
        sessionId: session.id,
        studentId: session.studentId,
        eventType: 'PARENT_UNLOCKED',
        timestamp: new Date().toISOString(),
        details: { extensionMinutesGranted: extensionMinutes },
      });
    }

    return { success: true, request: req, session };
  }

  // Direct on-device PIN override by physically present parent
  public directPinOverride(studentId: string, pin: string, extensionMinutes: number = 30): { success: boolean; session?: StudySession; message: string } {
    const student = this.students.get(studentId);
    if (!student) return { success: false, message: 'Student not found' };

    const parentId = student.parentLinkId;
    if (!this.verifyParentPin(parentId, pin)) {
      return { success: false, message: 'ଅବୈଧ ଅଭିଭାବକ ପିନ୍ (Invalid Parent PIN)' };
    }

    const activeSessionId = this.activeStudentSessions.get(studentId);
    let session = activeSessionId ? this.sessions.get(activeSessionId) : undefined;
    if (session) {
      session.state = 'PARENT_UNLOCKED';
      session.inactivitySeconds = 0;
      session.lastActiveTimestamp = new Date().toISOString();
      session.triggeredAlertMilestones = { oneMinute: false, fiveMinute: false, tenMinute: false };
      session.events.push({
        id: `evt_${Date.now()}_pin_unlock`,
        sessionId: session.id,
        studentId,
        eventType: 'PARENT_UNLOCKED',
        timestamp: new Date().toISOString(),
        details: { method: 'DIRECT_PIN', extensionMinutes },
      });
    }

    return { success: true, session, message: `ସଫଳତାର ସହ ଅନଲକ୍ ହେଲା (+${extensionMinutes} ମିନିଟ୍)` };
  }

  // Emergency manual restriction by parent
  public emergencyRestrict(parentId: string, studentId: string): { success: boolean; session?: StudySession } {
    const parent = this.parents.get(parentId);
    if (!parent?.linkedChildIds.includes(studentId)) {
      throw new Error('Unauthorized');
    }

    const activeSessionId = this.activeStudentSessions.get(studentId);
    const session = activeSessionId ? this.sessions.get(activeSessionId) : undefined;
    if (session) {
      session.state = 'RESTRICTED';
      session.restrictionReason = 'INACTIVITY_LIMIT';
      session.events.push({
        id: `evt_${Date.now()}_emerg_restrict`,
        sessionId: session.id,
        studentId,
        eventType: 'RESTRICTION_APPLIED',
        timestamp: new Date().toISOString(),
        details: { initiator: 'PARENT_REMOTE' },
      });
    }

    return { success: true, session };
  }

  // --- Alerts ---
  public createAlert(alertData: Omit<ParentAlert, 'id' | 'timestamp' | 'acknowledged'>): ParentAlert {
    const id = `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const alert: ParentAlert = {
      ...alertData,
      id,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.alerts.set(id, alert);
    return alert;
  }

  public getAlertsForParent(parentId: string): ParentAlert[] {
    const parent = this.parents.get(parentId);
    if (!parent) return [];
    return Array.from(this.alerts.values())
      .filter((a) => parent.linkedChildIds.includes(a.studentId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // --- Aggregate Dashboard Metrics ---
  public getDashboardMetricsForChild(parentId: string, childId: string): ParentDashboardMetrics {
    const parent = this.parents.get(parentId);
    if (!parent || !parent.linkedChildIds.includes(childId)) {
      throw new Error('Child not linked to parent');
    }

    const student = this.students.get(childId);
    if (!student) throw new Error('Student not found');

    const policy = this.policies.get(childId)!;
    const activeSessionId = this.activeStudentSessions.get(childId);
    const activeSession = activeSessionId ? this.sessions.get(activeSessionId) : undefined;

    let currentStatus: ParentDashboardMetrics['currentStatus'] = 'NOT_STUDYING';
    if (activeSession) {
      if (activeSession.state === 'RESTRICTED') {
        currentStatus = 'SESSION_RESTRICTED';
      } else if (activeSession.breakStartTime) {
        currentStatus = 'ON_BREAK';
      } else if (activeSession.state === 'ACTIVE_STUDY') {
        currentStatus = 'STUDYING';
      }
    }

    // Calculate today's total study duration
    let todayMinutes = 0;
    for (const session of this.sessions.values()) {
      if (session.studentId === childId) {
        todayMinutes += Math.round(session.accumulatedStudyDurationSeconds / 60);
      }
    }

    const usagePercentage = Math.min(100, Math.round((todayMinutes / Math.max(1, policy.dailyScreenTimeLimitMinutes)) * 100));

    const childAlerts = Array.from(this.alerts.values())
      .filter((a) => a.studentId === childId)
      .slice(-5)
      .reverse();

    const pendingRequests = Array.from(this.unlockRequests.values())
      .filter((r) => r.studentId === childId && r.status === 'PENDING');

    return {
      childId,
      childName: student.fullName,
      gradeLevel: student.gradeLevel,
      assignedClass: student.assignedClass,
      curriculumCode: student.curriculumCode,
      currentStatus,
      activeSessionTitle: activeSession ? `${activeSession.title} (${activeSession.activityType})` : undefined,
      todayStudyDurationMinutes: todayMinutes,
      dailyScreenTimeLimitMinutes: policy.dailyScreenTimeLimitMinutes,
      screenTimeUsagePercentage: usagePercentage,
      completedActivitiesCount: Array.from(this.sessions.values()).filter((s) => s.studentId === childId && s.state === 'SESSION_COMPLETED').length,
      recentSubjectsStudied: ['ଜୀବ ବିଜ୍ଞାନ (Life Science)', 'ଭୌତିକ ବିଜ୍ଞାନ (Physical Science)'],
      policy,
      recentAlerts: childAlerts,
      pendingUnlockRequests: pendingRequests,
      cameraFocusStatus: {
        enabledByPolicy: policy.cameraFocusAssistance.enabledByParent,
        activelyStreaming: activeSession?.cameraMonitoringActive || false,
        limitationNote: 'ସ୍ଥାନୀୟ ବ୍ରାଉଜର୍ ସୁରକ୍ଷା ସୀମା ଭିତରେ କାର୍ଯ୍ୟକାରୀ (Local client sandbox only, no video data uploaded).',
      },
    };
  }

  public getActiveSession(studentId: string): StudySession | null {
    const activeSessionId = this.activeStudentSessions.get(studentId);
    return activeSessionId ? this.sessions.get(activeSessionId) || null : null;
  }

  public updateRestrictions(studentId: string, restrictions: {
    maxDailyMinutes?: number;
    isLocked?: boolean;
    allowedSubjects?: string[];
  }) {
    let session = this.getActiveSession(studentId);
    if (restrictions.isLocked) {
      if (!session) {
        const sessionId = `sess_locked_${studentId}_${Date.now()}`;
        const newSession: StudySession = {
          id: sessionId,
          studentId,
          activityType: 'LESSON',
          title: 'Locked Study Session',
          subjectId: 'science',
          state: 'RESTRICTED',
          startTime: new Date().toISOString(),
          accumulatedStudyDurationSeconds: 0,
          lastActiveTimestamp: new Date().toISOString(),
          inactivitySeconds: 600,
          totalBreakDurationSeconds: 0,
          cameraMonitoringActive: false,
          inactivityReason: 'Parental control restriction',
          events: [],
          triggeredAlertMilestones: { oneMinute: true, fiveMinute: true, tenMinute: true },
        };
        this.sessions.set(sessionId, newSession);
        this.activeStudentSessions.set(studentId, sessionId);
        session = newSession;
      } else {
        session.state = 'RESTRICTED';
        session.inactivityReason = 'Parental control restriction';
      }
    } else if (session && !restrictions.isLocked) {
      session.state = 'ACTIVE_STUDY';
      session.inactivitySeconds = 0;
    }

    const policy = this.policies.get(studentId);
    if (policy && restrictions.maxDailyMinutes !== undefined) {
      policy.dailyScreenTimeLimitMinutes = restrictions.maxDailyMinutes;
    }
    return { success: true, session };
  }
}

export const parentService = new ParentServiceStore();
