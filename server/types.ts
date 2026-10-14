/**
 * BharatLearn AI — Server Domain Types, Tool Schemas, and Parental Control Types
 */

export interface ToolExecutionAudit {
  toolName: string;
  executionTimeMs: number;
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR';
  errorCode?: string;
  timestamp: string;
}

export interface ToolResult<T = unknown> {
  success?: boolean;
  audit: ToolExecutionAudit;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AgentDecisionTrace {
  stepIndex: number;
  nodeName: string;
  intent: string;
  toolInvoked?: string;
  toolDurationMs?: number;
  reasoning: string;
  timestamp: string;
}

export type AgentLearningStep =
  | 'RECEIVE_REQUEST'
  | 'ASSESS_CONTEXT'
  | 'CREATE_PLAN'
  | 'SELECT_TOOL'
  | 'EXECUTE_TOOL'
  | 'VERIFY_RESULT'
  | 'UPDATE_LEARNER_STATE'
  | 'RESPOND';

export interface WorkflowEventAudit {
  id: string;
  state: AgentLearningStep;
  title: string;
  details: string;
  timestamp: string;
  status: 'PLANNED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  toolName?: string;
  durationMs?: number;
}

export interface StudyPlanMilestone {
  stepIndex: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  resourceCitation?: string;
}

export interface StudyPlan {
  id: string;
  learnerId: string;
  subjectId: string;
  topic: string;
  totalMinutes: number;
  milestones: StudyPlanMilestone[];
  activeMilestoneIndex: number;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface LearningActivityRecord {
  id: string;
  learnerId: string;
  conceptId: string;
  conceptTitle: string;
  activityType: string;
  durationMinutes: number;
  score?: number;
  timestamp: string;
  notes?: string;
  sessionId?: string;
}

export interface ConceptMasteryRecord {
  conceptId: string;
  conceptTitle: string;
  score: number;
  level: 'NOVICE' | 'DEVELOPING' | 'COMPETENT' | 'MASTERED';
  attemptsCount: number;
  lastStudiedAt: string;
  lastMisconceptionTag?: string;
}

export interface ServerAgentState {
  sessionId: string;
  learnerId: string;
  gradeLevel: number;
  assignedClass: string;
  curriculumCode: string;
  subjectId: string;
  chapterId: string;
  conceptId: string;
  currentStepIndex: number;
  currentWorkflowState: AgentLearningStep;
  pedagogicalAction: 'INTRODUCE' | 'EXPLAIN' | 'ANALOGY_REPAIR' | 'PRACTICE' | 'EVALUATE' | 'ADVANCE' | 'SIMPLIFY' | 'STOP';
  remediationDepth: number;
  masteryScore: number;
  lastMisconceptionTag?: string;
  traces: AgentDecisionTrace[];
  workflowEvents: WorkflowEventAudit[];
  activePlan?: StudyPlan;
  isRestricted?: boolean;
  restrictionReason?: string;
}


export interface ChapterBundleData {
  packageId: string;
  chapterId: string;
  titleNative: string;
  language: string;
  version: number;
  concepts: Array<{
    id: string;
    titleNative: string;
    content: string;
    citation: string;
    glossary: Array<{ termEn: string; termNative: string; definition: string }>;
    questions: Array<{
      questionId: string;
      promptNative: string;
      options: string[];
      correctIndex: number;
      explanation: string;
      misconceptionTag?: string;
    }>;
  }>;
}

// Parental Guidance & Study Focus Server Types
export interface ParentAccountEntity {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  passwordHash?: string;
  linkedChildIds: string[]; // Max 2
  notificationPrefs: {
    inAppAlerts: boolean;
    emailSummary: boolean;
    smsUrgentAlerts: boolean;
  };
  createdAt: string;
}

export interface ParentalControlPolicyEntity {
  studentId: string;
  parentId: string;
  controlsEnabled: boolean;
  dailyScreenTimeLimitMinutes: number;
  maxContinuousSessionMinutes: number;
  mandatoryBreakMinutes: number;
  studySchedule: {
    allowedStartTime: string;
    allowedEndTime: string;
    allowedDays: number[];
  };
  permittedActivities: {
    allowLessons: boolean;
    allowPracticeQuizzes: boolean;
    allowEducationalVideos: boolean;
    allowReading: boolean;
  };
  inactivityThresholds: {
    notifyParentMinutes: number;
    studentReminderMinutes: number;
    restrictAppMinutes: number;
    notifyParentEnabled: boolean;
    studentReminderEnabled: boolean;
    restrictAppEnabled: boolean;
  };
  cameraFocusAssistance: {
    enabledByParent: boolean;
    requireStudentConsent: boolean;
  };
  updatedAt: string;
}

export interface StudySessionEntity {
  id: string;
  studentId: string;
  activityType: 'LESSON' | 'HOMEWORK' | 'PRACTICE_QUIZ' | 'EDUCATIONAL_VIDEO' | 'READING';
  title: string;
  subjectId: string;
  state: 'IDLE' | 'ACTIVE_STUDY' | 'PAUSED' | 'ON_BREAK' | 'POSSIBLE_INACTIVITY' | 'REMINDER' | 'RESTRICTED' | 'PARENT_UNLOCKED' | 'SESSION_COMPLETED';
  startTime: string;
  endTime?: string;
  accumulatedStudyDurationSeconds: number;
  lastActiveTimestamp: string;
  inactivitySeconds: number;
  breakStartTime?: string;
  totalBreakDurationSeconds: number;
  cameraMonitoringActive: boolean;
  restrictionReason?: 'INACTIVITY_LIMIT' | 'DAILY_SCREEN_TIME_EXCEEDED' | 'OUTSIDE_ALLOWED_HOURS' | 'MAX_SESSION_EXCEEDED';
  inactivityReason?: string;
  events: Array<{
    id: string;
    sessionId: string;
    studentId: string;
    eventType: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>;
  triggeredAlertMilestones: {
    oneMinute: boolean;
    fiveMinute: boolean;
    tenMinute: boolean;
  };
}

export interface ParentAlertEntity {
  id: string;
  studentId: string;
  studentName: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ParentUnlockRequestEntity {
  id: string;
  studentId: string;
  studentName: string;
  parentId: string;
  sessionId: string;
  reason: string;
  studentNote?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  extensionMinutesGranted?: number;
  createdAt: string;
  decidedAt?: string;
}

export type ParentAccount = ParentAccountEntity;
export type ParentalControlPolicy = ParentalControlPolicyEntity;
export type StudySession = StudySessionEntity;
export type ParentAlert = ParentAlertEntity;
export type ParentUnlockRequest = ParentUnlockRequestEntity;
export type StudyActivityType = 'LESSON' | 'HOMEWORK' | 'PRACTICE_QUIZ' | 'EDUCATIONAL_VIDEO' | 'READING';

export interface ParentDashboardMetrics {
  childId: string;
  childName: string;
  gradeLevel: number;
  assignedClass: string;
  curriculumCode: string;
  currentStatus: 'NOT_STUDYING' | 'STUDYING' | 'ON_BREAK' | 'SESSION_RESTRICTED';
  activeSessionTitle?: string;
  todayStudyDurationMinutes: number;
  dailyScreenTimeLimitMinutes: number;
  screenTimeUsagePercentage: number;
  completedActivitiesCount: number;
  recentSubjectsStudied: string[];
  policy: ParentalControlPolicy;
  recentAlerts: ParentAlert[];
  pendingUnlockRequests: ParentUnlockRequest[];
  cameraFocusStatus: {
    enabledByPolicy: boolean;
    activelyStreaming: boolean;
    limitationNote: string;
  };
}

