/**
 * BharatLearn AI — Persistent Learning State & Mastery Service
 * Manages persistent study plans, concept mastery records, activity histories,
 * and diagnostic evaluations. Syncs with parent-service session state and guards
 * against duplicate submissions.
 */

import type {
  StudyPlan,
  StudyPlanMilestone,
  LearningActivityRecord,
  ConceptMasteryRecord,
} from '../types';
import { parentService } from './parentService';

class LearningStateService {
  // Mastery records by learnerId -> Map<conceptId, ConceptMasteryRecord>
  private masteryStore: Map<string, Map<string, ConceptMasteryRecord>> = new Map();
  // Persistent study plans by planId
  private plansStore: Map<string, StudyPlan> = new Map();
  // Active plan pointer by learnerId
  private activePlanByLearner: Map<string, string> = new Map();
  // Activities log by learnerId -> LearningActivityRecord[]
  private activitiesStore: Map<string, LearningActivityRecord[]> = new Map();
  // Answer submissions log
  private answerHistory: Map<string, Array<{
    questionId: string;
    conceptId: string;
    selectedOptionIndex?: number;
    writtenAnswer?: string;
    isCorrect: boolean;
    score: number;
    misconceptionTag?: string;
    timestamp: string;
  }>> = new Map();
  // Idempotency cache: key -> { result, timestamp }
  private idempotencyStore: Map<string, { result: any; timestamp: number }> = new Map();

  constructor() {
    this.seedInitialLearnerState();
  }

  private seedInitialLearnerState() {
    const student1 = 'learner_pilot_odia_01'; // Subhashree (Class 10)
    const m1 = new Map<string, ConceptMasteryRecord>();
    m1.set('concept_light_reaction', {
      conceptId: 'concept_light_reaction',
      conceptTitle: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍ (Light Reaction & Photolysis)',
      score: 0.68,
      level: 'DEVELOPING',
      attemptsCount: 3,
      lastStudiedAt: new Date(Date.now() - 3600000).toISOString(),
      lastMisconceptionTag: 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
    });
    m1.set('concept_dark_reaction', {
      conceptId: 'concept_dark_reaction',
      conceptTitle: 'ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ଓ କେଲଭିନ୍ ଚକ୍ର (Dark Reaction & Calvin Cycle)',
      score: 0.45,
      level: 'NOVICE',
      attemptsCount: 1,
      lastStudiedAt: new Date(Date.now() - 86400000).toISOString(),
    });
    m1.set('concept_chloroplast_structure', {
      conceptId: 'concept_chloroplast_structure',
      conceptTitle: 'ହରିତକଣାର ଗଠନ (Structure of Chloroplast)',
      score: 0.85,
      level: 'COMPETENT',
      attemptsCount: 4,
      lastStudiedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    });
    this.masteryStore.set(student1, m1);

    // Initial Plan for Subhashree
    const planId1 = 'plan_pilot_subhashree_01';
    const plan1: StudyPlan = {
      id: planId1,
      learnerId: student1,
      subjectId: 'BSE_OD_10_LIFE_SCIENCE',
      topic: 'ପୋଷଣ ଓ ଆଲୋକ ସଂଶ୍ଳେଷଣ (Nutrition & Photosynthesis)',
      totalMinutes: 30,
      activeMilestoneIndex: 1,
      isCompleted: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: [
        {
          stepIndex: 0,
          title: 'ପରିଚୟ ଓ ହରିତକଣା ଗଠନ',
          description: 'ହରିତକଣାର ଗ୍ରାନା ଓ ଷ୍ଟ୍ରୋମାର ଭୂମିକା ପାଠ କରନ୍ତୁ।',
          estimatedMinutes: 8,
          completed: true,
          completedAt: new Date(Date.now() - 3600000).toISOString(),
          resourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୦',
        },
        {
          stepIndex: 1,
          title: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଜଳର ବିଘଟନ',
          description: 'ସୂର୍ଯ୍ୟାଲୋକ ଦ୍ୱାରା ଜଳର ବିଘଟନ ଓ ଅମ୍ଳଜାନ ମୋଚନ ଅନୁଧ୍ୟାନ କରନ୍ତୁ।',
          estimatedMinutes: 12,
          completed: false,
          resourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨',
        },
        {
          stepIndex: 2,
          title: 'ନିଦାନ ପ୍ରଶ୍ନ ଓ ଅଭ୍ୟାସ',
          description: '୩ଟି ବୋର୍ଡ ପରୀକ୍ଷା ଉପଯୋଗୀ ପ୍ରଶ୍ନ ସମାଧାନ କରନ୍ତୁ।',
          estimatedMinutes: 10,
          completed: false,
          resourceCitation: 'BSE Odisha କାର୍ଯ୍ୟପୁସ୍ତିକା, ଅଧ୍ୟାୟ ୧',
        },
      ],
    };
    this.plansStore.set(planId1, plan1);
    this.activePlanByLearner.set(student1, planId1);

    // Activities log
    this.activitiesStore.set(student1, [
      {
        id: 'act_seed_01',
        learnerId: student1,
        conceptId: 'concept_chloroplast_structure',
        conceptTitle: 'ହରିତକଣାର ଗଠନ',
        activityType: 'READING',
        durationMinutes: 15,
        score: 0.85,
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
        notes: 'ହରିତକଣାର ଗ୍ରାନା ଓ ଷ୍ଟ୍ରୋମା ଅନୁଧ୍ୟାନ କଲେ।',
      },
      {
        id: 'act_seed_02',
        learnerId: student1,
        conceptId: 'concept_light_reaction',
        conceptTitle: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍',
        activityType: 'LESSON',
        durationMinutes: 18,
        score: 0.68,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        notes: 'ସ୍ଥାନୀୟ ଉଦାହରଣ ସହିତ ଜଳ ବିଘଟନ ବୁଝିଲେ।',
      },
    ]);
  }

  // Idempotency helpers
  public checkIdempotency(key: string): any | null {
    const item = this.idempotencyStore.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > 10 * 60 * 1000) {
      this.idempotencyStore.delete(key);
      return null;
    }
    return item.result;
  }

  public setIdempotency(key: string, result: any) {
    this.idempotencyStore.set(key, { result, timestamp: Date.now() });
  }

  // --- Learner Profile & Authorisation ---
  public getLearnerProfile(learnerId: string) {
    const student = parentService.getStudentById(learnerId);
    if (!student) {
      return {
        id: learnerId,
        fullName: 'ସୁଭଶ୍ରୀ ମହାନ୍ତି (Subhashree Mohanty)',
        category: 'SECONDARY',
        gradeLevel: 10,
        assignedClass: 'Class 10-A (ମାଟ୍ରିକ)',
        curriculumCode: 'BSE_ODISHA',
        schoolName: 'ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, କଟକ (Govt High School, Cuttack)',
        district: 'Cuttack',
        state: 'Odisha',
        isMinor: true,
        parentLinkId: 'parent_mohanty_01',
        languages: {
          uiLanguage: 'or',
          explanationLanguage: 'or',
          instructionalLanguage: 'or',
          assessmentLanguage: 'or',
        },
        enrolledSubjectIds: ['sub_bse_10_bio', 'sub_bse_10_phy'],
      };
    }

    return {
      id: student.id,
      fullName: student.fullName,
      category: student.category,
      gradeLevel: student.gradeLevel,
      assignedClass: student.assignedClass,
      curriculumCode: student.curriculumCode,
      schoolName: 'ସରକାରୀ ବିଦ୍ୟାଳୟ, କଟକ',
      district: 'Cuttack',
      state: 'Odisha',
      isMinor: student.isMinor,
      parentLinkId: student.parentLinkId,
      languages: {
        uiLanguage: 'or',
        explanationLanguage: 'or',
        instructionalLanguage: 'or',
        assessmentLanguage: 'or',
      },
      enrolledSubjectIds: student.gradeLevel === 10 ? ['sub_bse_10_bio', 'sub_bse_10_phy'] : ['sub_prim_04_math', 'sub_pri_04_env'],
    };
  }

  // --- Learning Progress & Mastery ---
  public getLearningProgress(learnerId: string, subjectId = 'BSE_OD_10_LIFE_SCIENCE') {
    const conceptMap = this.masteryStore.get(learnerId) || new Map<string, ConceptMasteryRecord>();
    const concepts = Array.from(conceptMap.values());

    const totalScore = concepts.reduce((acc, c) => acc + c.score, 0);
    const overallMastery = concepts.length > 0 ? Number((totalScore / concepts.length).toFixed(2)) : 0.65;
    const competentCount = concepts.filter((c) => c.level === 'COMPETENT' || c.level === 'MASTERED').length;
    const developingCount = concepts.filter((c) => c.level === 'DEVELOPING' || c.level === 'NOVICE').length;

    const allActivities = this.activitiesStore.get(learnerId) || [];
    const recentActivities = allActivities.slice(-5).reverse();
    const activePlan = this.getActiveStudyPlan(learnerId);

    return {
      learnerId,
      subjectId,
      overallMastery,
      competentCount,
      developingCount,
      totalConceptsTracked: concepts.length,
      activitiesCompleted: allActivities.length,
      concepts,
      recentActivities,
      activePlan,
      lastEvaluatedAt: new Date().toISOString(),
    };
  }

  public recordActivity(
    learnerIdOrActivity: string | any,
    activityParam?: any
  ): { success: boolean; record: LearningActivityRecord; updatedMastery: number } {
    let learnerId: string;
    let activity: any;
    if (typeof learnerIdOrActivity === 'string') {
      learnerId = learnerIdOrActivity;
      activity = activityParam || {};
    } else {
      activity = learnerIdOrActivity || {};
      learnerId = activity.learnerId || 'student_1';
    }

    const idempotencyKey = activity.idempotencyKey || activity.id;
    if (idempotencyKey) {
      const cached = this.checkIdempotency(idempotencyKey);
      if (cached) return cached;
    }

    const rawScore = activity.score !== undefined
      ? (activity.maxScore ? activity.score / activity.maxScore : activity.score > 1 ? activity.score / 100 : activity.score)
      : 0.7;

    const record: LearningActivityRecord = {
      id: activity.id || `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      learnerId,
      conceptId: activity.conceptId || 'concept_light_reaction',
      conceptTitle: activity.conceptTitle || activity.title || 'Lesson Study',
      activityType: activity.activityType || activity.type || 'LESSON',
      durationMinutes: activity.durationMinutes || 10,
      score: Number(rawScore.toFixed(2)),
      timestamp: activity.timestamp || new Date().toISOString(),
      notes: activity.notes,
      sessionId: activity.sessionId,
    };

    // Store activity
    if (!this.activitiesStore.has(learnerId)) {
      this.activitiesStore.set(learnerId, []);
    }
    this.activitiesStore.get(learnerId)!.push(record);

    // Update Concept Mastery
    if (!this.masteryStore.has(learnerId)) {
      this.masteryStore.set(learnerId, new Map());
    }
    const conceptMap = this.masteryStore.get(learnerId)!;
    const existing = conceptMap.get(activity.conceptId);

    let newScore = activity.score ?? 0.7;
    let attempts = 1;
    if (existing) {
      // Weighted update: 60% current + 40% historical
      newScore = Number((existing.score * 0.4 + (activity.score ?? existing.score) * 0.6).toFixed(2));
      attempts = existing.attemptsCount + 1;
    }

    let level: 'NOVICE' | 'DEVELOPING' | 'COMPETENT' | 'MASTERED' = 'DEVELOPING';
    if (newScore >= 0.85) level = 'MASTERED';
    else if (newScore >= 0.7) level = 'COMPETENT';
    else if (newScore >= 0.45) level = 'DEVELOPING';
    else level = 'NOVICE';

    conceptMap.set(activity.conceptId, {
      conceptId: activity.conceptId,
      conceptTitle: activity.conceptTitle,
      score: newScore,
      level,
      attemptsCount: attempts,
      lastStudiedAt: new Date().toISOString(),
      lastMisconceptionTag: existing?.lastMisconceptionTag,
    });

    const result = { success: true, record, updatedMastery: newScore };
    if (idempotencyKey) {
      this.setIdempotency(idempotencyKey, result);
    }
    return result;
  }

  // --- Answers & Diagnostics ---
  public recordAnswer(params: {
    learnerId: string;
    questionId: string;
    conceptId: string;
    selectedOptionIndex?: number;
    writtenAnswer?: string;
    isCorrect: boolean;
    score: number;
    misconceptionTag?: string;
  }) {
    if (!this.answerHistory.has(params.learnerId)) {
      this.answerHistory.set(params.learnerId, []);
    }
    this.answerHistory.get(params.learnerId)!.push({
      ...params,
      timestamp: new Date().toISOString(),
    });

    // Update concept misconception tag if wrong
    const conceptMap = this.masteryStore.get(params.learnerId);
    if (conceptMap && conceptMap.has(params.conceptId)) {
      const rec = conceptMap.get(params.conceptId)!;
      if (!params.isCorrect && params.misconceptionTag) {
        rec.lastMisconceptionTag = params.misconceptionTag;
      } else if (params.isCorrect) {
        rec.lastMisconceptionTag = undefined;
      }
      rec.attemptsCount += 1;
      rec.lastStudiedAt = new Date().toISOString();
      rec.score = Number((rec.score * 0.5 + params.score * 0.5).toFixed(2));
      conceptMap.set(params.conceptId, rec);
    }
  }

  // --- Study Plans ---
  public createStudyPlan(params: {
    learnerId: string;
    subjectId: string;
    topic: string;
    totalMinutes: number;
    milestones: Array<{
      title: string;
      description: string;
      estimatedMinutes: number;
      resourceCitation?: string;
    }>;
  }): StudyPlan {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const plan: StudyPlan = {
      id: planId,
      learnerId: params.learnerId,
      subjectId: params.subjectId,
      topic: params.topic,
      totalMinutes: params.totalMinutes,
      activeMilestoneIndex: 0,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: params.milestones.map((m, idx) => ({
        stepIndex: idx,
        title: m.title,
        description: m.description,
        estimatedMinutes: m.estimatedMinutes,
        completed: false,
        resourceCitation: m.resourceCitation,
      })),
    };

    this.plansStore.set(planId, plan);
    this.activePlanByLearner.set(params.learnerId, planId);
    return plan;
  }

  public updateStudyPlanMilestone(
    planId: string,
    completedStepIndex: number,
    learnerId: string
  ): { success: boolean; plan?: StudyPlan; error?: string } {
    const plan = this.plansStore.get(planId);
    if (!plan) return { success: false, error: 'Plan not found' };
    if (plan.learnerId !== learnerId) return { success: false, error: 'Unauthorized plan access' };

    if (plan.milestones[completedStepIndex]) {
      plan.milestones[completedStepIndex].completed = true;
      plan.milestones[completedStepIndex].completedAt = new Date().toISOString();
    }

    // Advance active milestone
    const nextIncomplete = plan.milestones.findIndex((m) => !m.completed);
    if (nextIncomplete === -1) {
      plan.isCompleted = true;
      plan.activeMilestoneIndex = plan.milestones.length - 1;
    } else {
      plan.activeMilestoneIndex = nextIncomplete;
    }
    plan.updatedAt = new Date().toISOString();

    this.plansStore.set(planId, plan);
    return { success: true, plan };
  }

  public getActiveStudyPlan(learnerId: string): StudyPlan | null {
    const planId = this.activePlanByLearner.get(learnerId);
    if (!planId) return null;
    const plan = this.plansStore.get(planId);
    return plan || null;
  }
}

export const learningStateService = new LearningStateService();
