/**
 * BharatLearn AI — Core Domain & Application Types
 */

export type IndianLanguageCode =
  | 'or' // Odia (Pilot)
  | 'hi' // Hindi
  | 'bn' // Bengali
  | 'te' // Telugu
  | 'ta' // Tamil
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'pa' // Punjabi
  | 'as' // Assamese
  | 'ur' // Urdu
  | 'sa' // Sanskrit
  | 'ne' // Nepali
  | 'kok' // Konkani
  | 'mai' // Maithili
  | 'sd' // Sindhi
  | 'doi' // Dogri
  | 'mni' // Manipuri (Meetei)
  | 'brx' // Bodo
  | 'sat' // Santali
  | 'ks' // Kashmiri
  | 'en'; // English (Instructional Medium)

export type TextDirection = 'ltr' | 'rtl';

export type LanguageSupportStatus =
  | 'VERIFIED_PILOT'
  | 'TIER1_SUPPORTED'
  | 'TIER2_CURATED'
  | 'TIER3_EXPERIMENTAL';

export interface IndianLanguageMeta {
  code: IndianLanguageCode;
  nameNative: string;
  nameEnglish: string;
  locale: string;
  script: string;
  direction: TextDirection;
  status: LanguageSupportStatus;
  isPilot: boolean;
  tier: 1 | 2 | 3; // 1 = High Verified, 2 = Standard Text, 3 = Emerging
  supportDetails: string;
  knownLimitations: string;
  sampleConceptExplanation: {
    topic: string;
    text: string;
  };
}

export interface LanguageDimensionConfig {
  uiLanguage: IndianLanguageCode;
  explanationLanguage: IndianLanguageCode;
  instructionalLanguage: IndianLanguageCode;
  assessmentLanguage: IndianLanguageCode;
}

export type LearnerCategoryId =
  | 'PRIMARY' // Classes 1–5
  | 'MIDDLE' // Classes 6–8
  | 'SECONDARY' // Classes 9–10 (Pilot Core)
  | 'SENIOR_SECONDARY' // Classes 11–12
  | 'HIGHER_ED' // Undergraduate & Postgraduate
  | 'COMPETITIVE_EXAMS' // JEE, NEET, UPSC, SSC, Banking, State PSCs
  | 'VOCATIONAL' // ITI, Polytechnic, Healthcare, Digital
  | 'ADULT_EDUCATION'; // Functional Literacy, Financial, Digital Tools

export interface LearnerCategoryMeta {
  id: LearnerCategoryId;
  titleNative: string;
  titleEnglish: string;
  gradeSpan: string;
  ageGroup: string;
  descriptionNative: string;
  descriptionEnglish: string;
  availableBoards: string[];
  sampleSubjects: string[];
  iconName: string;
}

export type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN' | 'GUARDIAN';

export interface LearningGoal {
  id: string;
  titleNative: string;
  titleEnglish: string;
  dailyMinutes: number;
  targetTimeline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completed: boolean;
}

export interface AccessibilitySettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaSpacing: boolean;
  screenReaderHints: boolean;
}

export interface LearnerProfile {
  id: string;
  fullName: string;
  category: LearnerCategoryId;
  gradeLevel: number; // e.g. 10
  stream?: string; // Science, Commerce, Arts (Classes 11-12) or Exam Target (JEE/NEET)
  curriculumCode: string; // 'BSE_ODISHA' | 'CBSE_NCERT' | 'ICSE' | 'STATE_BOARD'
  schoolName: string;
  district: string;
  state: string;
  isMinor: boolean;
  assignedClass: string;
  parentLinkId?: string;
  privacyConsentGiven?: boolean;
  languages: LanguageDimensionConfig;
  enrolledSubjectIds: string[];
  goals: LearningGoal[];
  accessibility: AccessibilitySettings;
}

export type MasteryLevel =
  | 'NOT_STARTED'
  | 'NOVICE'
  | 'DEVELOPING'
  | 'COMPETENT'
  | 'MASTERED';

export interface ConceptMastery {
  conceptId: string;
  conceptTitleNative: string;
  conceptTitleEn: string;
  score: number; // 0.0 to 1.0
  level: MasteryLevel;
  attemptsCount: number;
  lastAttemptAt?: string;
  lastMisconceptionTag?: string;
}

export interface DiagnosticQuestion {
  questionId: string;
  conceptId: string;
  promptNative: string;
  promptEn?: string;
  options: string[];
  correctIndex: number;
  explanationNative: string;
  sourceCitation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface CurriculumSubject {
  id: string;
  categoryId: LearnerCategoryId;
  titleNative: string;
  titleEnglish: string;
  curriculumCode: string;
  totalChapters: number;
  completedChapters: number;
  masteryPercentage: number;
  isDownloadedOffline: boolean;
  chapters: CurriculumChapter[];
}

export interface CurriculumChapter {
  id: string;
  subjectId: string;
  sequenceNumber: number;
  titleNative: string;
  titleEn: string;
  gradeLevel: number;
  conceptsCount: number;
  isDownloadedOffline: boolean;
  summaryNative: string;
  concepts?: ConceptMastery[];
}

export type PedagogicalAction =
  | 'INTRODUCE'
  | 'EXPLAIN'
  | 'ANALOGY_REPAIR'
  | 'PRACTICE'
  | 'EVALUATE'
  | 'ADVANCE'
  | 'STOP';

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

export interface ConceptExplanationData {
  title: string;
  summary: string;
  detailedExplanation: string;
  culturalAnalogy?: {
    title: string;
    analogyText: string;
    sourceContext: string;
  };
  keyTakeaways: string[];
  reflectionQuestion: string;
}

export interface AgentInteractionResponse {
  sessionId: string;
  learnerId: string;
  currentWorkflowState: AgentLearningStep;
  pedagogicalAction: PedagogicalAction;
  masteryScore: number;
  responseText: string;
  explanation?: ConceptExplanationData;
  activePlan?: StudyPlan;
  activeQuestion?: any;
  hint?: string;
  traces: Array<{
    stepIndex: number;
    nodeName: string;
    intent: string;
    toolInvoked?: string;
    toolDurationMs?: number;
    reasoning: string;
    timestamp: string;
  }>;
  workflowEvents: WorkflowEventAudit[];
  isRestricted?: boolean;
  restrictionReason?: string;
}

export interface AgentSessionState {
  sessionId: string;
  learnerId: string;
  activeChapterId: string;
  activeConceptId: string;
  activeConceptTitle: string;
  currentStepIndex: number;
  pedagogicalAction: PedagogicalAction;
  activeQuestion?: DiagnosticQuestion;
  masteryScore: number;
  masteryLevel: MasteryLevel;
  lastFeedback?: string;
  lastAnalogy?: {
    title: string;
    description: string;
    illustrationUrl?: string;
  };
}


export interface OfflineSyncQueueItem {
  clientActionId: string;
  actionType: 'ANSWER_QUESTION' | 'COMPLETE_CONCEPT' | 'UPDATE_PREFERENCE';
  payload: Record<string, unknown>;
  createdAt: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  retryCount: number;
  lastError?: string;
}

export type AppPage =
  | 'welcome'
  | 'onboarding'
  | 'category_select'
  | 'language_setup'
  | 'goals_setup'
  | 'dashboard'
  | 'subjects'
  | 'companion'
  | 'progress'
  | 'settings'
  | 'parent_dashboard'
  | 'study_session';

// ==========================================
// PARENTAL CONTROLS & STUDY FOCUS DOMAIN
// ==========================================

export interface ParentNotificationPreferences {
  inAppAlerts: boolean;
  emailSummary: boolean;
  smsUrgentAlerts: boolean;
}

export interface ParentAccount {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  linkedChildIds: string[]; // Strict limit: max 2 children
  notificationPrefs: ParentNotificationPreferences;
  createdAt: string;
}

export interface ParentalControlPolicy {
  studentId: string;
  parentId: string;
  controlsEnabled: boolean; // Default true for Classes 1-10; optional for 11-12
  dailyScreenTimeLimitMinutes: number; // e.g. 60, 90, 120
  maxContinuousSessionMinutes: number; // e.g. 30, 45
  mandatoryBreakMinutes: number; // e.g. 10
  studySchedule: {
    allowedStartTime: string; // e.g. "07:00"
    allowedEndTime: string; // e.g. "21:00"
    allowedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  permittedActivities: {
    allowLessons: boolean;
    allowPracticeQuizzes: boolean;
    allowEducationalVideos: boolean;
    allowReading: boolean;
  };
  inactivityThresholds: {
    notifyParentMinutes: number; // default: 1 minute
    studentReminderMinutes: number; // default: 5 minutes
    restrictAppMinutes: number; // default: 10 minutes
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

export type StudySessionState =
  | 'IDLE'
  | 'ACTIVE_STUDY'
  | 'PAUSED'
  | 'ON_BREAK'
  | 'POSSIBLE_INACTIVITY'
  | 'REMINDER'
  | 'RESTRICTED'
  | 'PARENT_UNLOCKED'
  | 'SESSION_COMPLETED';

export type StudyActivityType =
  | 'LESSON'
  | 'HOMEWORK'
  | 'PRACTICE_QUIZ'
  | 'EDUCATIONAL_VIDEO'
  | 'READING';

export interface StudyActivityEvent {
  id: string;
  sessionId: string;
  studentId: string;
  eventType:
    | 'SESSION_START'
    | 'STUDY_PULSE'
    | 'ACTIVITY_INTERACTION'
    | 'SESSION_PAUSE'
    | 'SESSION_RESUME'
    | 'BREAK_START'
    | 'BREAK_END'
    | 'INACTIVITY_1MIN'
    | 'INACTIVITY_5MIN'
    | 'INACTIVITY_10MIN'
    | 'RESTRICTION_APPLIED'
    | 'UNLOCK_REQUESTED'
    | 'PARENT_UNLOCKED'
    | 'SESSION_END';
  timestamp: string;
  details: Record<string, unknown>;
}

export interface StudySession {
  id: string;
  studentId: string;
  activityType: StudyActivityType;
  title: string;
  subjectId: string;
  state: StudySessionState;
  startTime: string;
  endTime?: string;
  accumulatedStudyDurationSeconds: number;
  lastActiveTimestamp: string;
  inactivitySeconds: number;
  breakStartTime?: string;
  totalBreakDurationSeconds: number;
  cameraMonitoringActive: boolean;
  restrictionReason?:
    | 'INACTIVITY_LIMIT'
    | 'DAILY_SCREEN_TIME_EXCEEDED'
    | 'OUTSIDE_ALLOWED_HOURS'
    | 'MAX_SESSION_EXCEEDED';
  events: StudyActivityEvent[];
  triggeredAlertMilestones: {
    oneMinute: boolean;
    fiveMinute: boolean;
    tenMinute: boolean;
  };
}

export interface ParentAlert {
  id: string;
  studentId: string;
  studentName: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface ParentUnlockRequest {
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
