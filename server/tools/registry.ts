/**
 * BharatLearn AI — Agent Tool Registry
 * Enforces strict typing, timeouts, RBAC validation, and audit traces for all 10 pedagogical tools.
 * All tools return standard ToolResult<T> containing executionTimeMs, status, audit, and typed payload.
 */

import type { ToolResult, ChapterBundleData, StudyPlan, LearningActivityRecord } from '../types';
import { learningStateService } from '../services/learningStateService';
import { parentService } from '../services/parentService';
import { GeminiService, type ConceptExplanationOutput } from '../services/geminiService';
import { CurriculumService } from '../services/curriculumService';

export class ToolRegistry {
  private static async executeWithTimeout<T>(
    toolName: string,
    timeoutMs: number,
    operation: () => Promise<T>
  ): Promise<ToolResult<T>> {
    const startTime = Date.now();
    let timer: any;
    try {
      const data = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Tool ${toolName} timed out after ${timeoutMs}ms`)), timeoutMs);
        }),
      ]);
      if (timer) clearTimeout(timer);

      return {
        success: true,
        audit: {
          toolName,
          executionTimeMs: Date.now() - startTime,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
        },
        data,
      };
    } catch (err: unknown) {
      if (timer) clearTimeout(timer);
      const isTimeout = err instanceof Error && err.message.includes('timed out');
      const errorMessage = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: {
          code: isTimeout ? 'TIMEOUT' : 'EXECUTION_ERROR',
          message: errorMessage,
        },
        audit: {
          toolName,
          executionTimeMs: Date.now() - startTime,
          status: isTimeout ? 'TIMEOUT' : 'ERROR',
          errorCode: isTimeout ? 'ERR_TIMEOUT' : 'ERR_EXECUTION_FAILURE',
          timestamp: new Date().toISOString(),
        },
        data: null as unknown as T,
      };
    }
  }

  // 1. getLearnerProfile
  static async getLearnerProfile(learnerId: string): Promise<
    ToolResult<{
      learnerId: string;
      fullName: string;
      gradeLevel: number;
      assignedClass: string;
      category: string;
      curriculumCode: string;
      isMinor: boolean;
      languages: {
        uiLanguage: string;
        explanationLanguage: string;
        instructionalLanguage: string;
        assessmentLanguage: string;
      };
      enrolledSubjectIds: string[];
    }>
  > {
    return this.executeWithTimeout('getLearnerProfile', 2500, async () => {
      const profile = learningStateService.getLearnerProfile(learnerId);
      return {
        learnerId: profile.id,
        fullName: profile.fullName,
        gradeLevel: profile.gradeLevel,
        assignedClass: profile.assignedClass,
        category: profile.category,
        curriculumCode: profile.curriculumCode,
        isMinor: profile.isMinor,
        languages: profile.languages,
        enrolledSubjectIds: profile.enrolledSubjectIds,
      };
    });
  }

  // 2. getLearningProgress
  static async getLearningProgress(
    learnerId: string,
    subjectId = 'BSE_OD_10_LIFE_SCIENCE'
  ): Promise<
    ToolResult<{
      subjectId: string;
      overallMastery: number;
      competentCount: number;
      developingCount: number;
      totalConceptsTracked: number;
      concepts: any[];
      recentActivities: LearningActivityRecord[];
      activePlan: StudyPlan | null;
      lastEvaluatedAt: string;
    }>
  > {
    return this.executeWithTimeout('getLearningProgress', 2500, async () => {
      const progress = learningStateService.getLearningProgress(learnerId, subjectId);
      return progress;
    });
  }

  // 3. searchLearningResources
  static async searchLearningResources(params: {
    query: string;
    subjectId?: string;
    gradeLevel?: number;
    language?: string;
  }): Promise<
    ToolResult<{
      found: boolean;
      resources: Array<{
        title: string;
        sourceCitation: string;
        excerpt: string;
        diagramUrl?: string;
        glossaryTerms?: Array<{ termNative: string; termEn: string; definition: string }>;
      }>;
    }>
  > {
    return this.executeWithTimeout('searchLearningResources', 3000, async () => {
      const q = (params.query || '').toLowerCase();
      const chapters = CurriculumService.getChapters();

      // Curated authentic resources repository
      const library = [
        {
          conceptId: 'concept_light_reaction',
          title: 'ଆଲୋକ ସଂଶ୍ଳେଷଣର ଆଲୋକ ରାସାୟନିକ ପର୍ଯ୍ୟାୟ (Light Reaction & Photolysis)',
          sourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ଅଧ୍ୟାୟ ୧, ପୃଷ୍ଠା ୪୨',
          excerpt:
            'ହରିତକଣାର ଗ୍ରାନାରେ ଥିବା ଥାଇଲାକଏଡ୍ ଝିଲ୍ଲୀରେ ସୂର୍ଯ୍ୟାଲୋକର ଫୋଟନ୍ ଶକ୍ତି ଦ୍ୱାରା ଜଳ (H2O) ର ବିଘଟନ ଘଟେ (2H2O -> 4H+ + 4e- + O2)। ଏହା ଦ୍ୱାରା ଅମ୍ଳଜାନ ଉପଜାତ ଭାବରେ ବାହାରକୁ ଆସେ ଏବଂ ଉଚ୍ଚ ଶକ୍ତିସମ୍ପନ୍ନ ATP ଓ NADPH ଗଠିତ ହୁଏ।',
          diagramUrl: '/assets/diagrams/photosynthesis_odia.svg',
          glossaryTerms: [
            { termNative: 'ଫୋଟୋଲାଇସିସ୍', termEn: 'Photolysis', definition: 'ଆଲୋକ ଶକ୍ତି ଦ୍ୱାରା ଜଳର ବିଘଟନ' },
            { termNative: 'ହରିତକଣା', termEn: 'Chloroplast', definition: 'ଉଦ୍ଭିଦର ଆଲୋକ ସଂଶ୍ଳେଷଣକାରୀ ଅଙ୍ଗିକା' },
            { termNative: 'ଥାଇଲାକଏଡ୍', termEn: 'Thylakoid', definition: 'ଗ୍ରାନାରେ ଥିବା ଝିଲ୍ଲୀଯୁକ୍ତ ଚେପ୍ଟା ଥଳି' },
          ],
        },
        {
          conceptId: 'concept_chloroplast_structure',
          title: 'ହରିତକଣାର ସୂକ୍ଷ୍ମ ଗଠନ (Structure of Chloroplast)',
          sourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ଅଧ୍ୟାୟ ୧, ପୃଷ୍ଠା ୪୦',
          excerpt:
            'ହରିତକଣା ଏକ ଦ୍ୱି-ସ୍ତରୀୟ ଝିଲ୍ଲୀ ବିଶିଷ୍ଟ ଅଙ୍ଗିକା। ଏହାର ଭିତର ଅଂଶ ଷ୍ଟ୍ରୋମା (ତରଳ ପଦାର୍ଥ) ଏବଂ ଗ୍ରାନା (ଥାକ ମରା ମୁଦ୍ରା ସଦୃଶ ଥାଇଲାକଏଡ୍) ଦ୍ୱାରା ଗଠିତ।',
          diagramUrl: '/assets/diagrams/chloroplast_diagram.svg',
          glossaryTerms: [
            { termNative: 'ଷ୍ଟ୍ରୋମା', termEn: 'Stroma', definition: 'ହରିତକଣାର ତରଳ ଆଧାର, ଯେଉଁଠି ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ହୁଏ' },
            { termNative: 'ଗ୍ରାନା', termEn: 'Grana', definition: 'ଥାଇଲାକଏଡ୍ ଗୁଚ୍ଛ, ଯେଉଁଠି ଆଲୋକ ପ୍ରକ୍ରିୟା ହୁଏ' },
          ],
        },
        {
          conceptId: 'concept_chemical_reactions',
          title: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଓ ସମତୁଲ ସମୀକରଣ (Chemical Reactions and Equations)',
          sourceCitation: 'BSE Odisha Class 10 ଭୌତିକ ବିଜ୍ଞାନ, ଅଧ୍ୟାୟ ୧, ପୃଷ୍ଠା ୫',
          excerpt:
            'ପ୍ରତିକାରକ ମଧ୍ୟରେ ପରମାଣୁର ପୁନର୍ଗଠନ ଦ୍ୱାରା ନୂତନ ଗୁଣଧର୍ମ ବିଶିଷ୍ଟ ଉତ୍ପାଦ ସୃଷ୍ଟି ହୁଏ। ବସ୍ତୁତ୍ୱ ସଂରକ୍ଷଣ ନିୟମ ଅନୁସାରେ ପ୍ରତିକ୍ରିୟାରେ ବସ୍ତୁତ୍ୱ ସୃଷ୍ଟି ବା ବିନାଶ ହୋଇପାରିବ ନାହିଁ।',
          diagramUrl: '/assets/diagrams/chemical_reaction_types.svg',
          glossaryTerms: [
            { termNative: 'ପ୍ରତିକାରକ', termEn: 'Reactants', definition: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟାରେ ଭାଗ ନେଉଥିବା ପଦାର୍ଥ' },
            { termNative: 'ଉତ୍ପାଦ', termEn: 'Products', definition: 'ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା ଫଳରେ ସୃଷ୍ଟି ହେଉଥିବା ନୂତନ ପଦାର୍ଥ' },
          ],
        },
      ];

      const matches = library.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.excerpt.toLowerCase().includes(q) ||
          q.includes('photo') ||
          q.includes('ଆଲୋକ') ||
          q.includes('science') ||
          q.includes('ବିଜ୍ଞାନ') ||
          q.includes('reaction')
      );

      const resList = matches.length > 0 ? matches : [library[0]];

      return {
        found: true,
        resources: resList.map((r) => ({
          title: r.title,
          sourceCitation: r.sourceCitation,
          excerpt: r.excerpt,
          diagramUrl: r.diagramUrl,
          glossaryTerms: r.glossaryTerms,
        })),
      };
    });
  }

  // 4. createStudyPlan
  static async createStudyPlan(params: {
    learnerId: string;
    subjectId: string;
    topic: string;
    availableMinutes: number;
    goalType?: string;
  }): Promise<ToolResult<StudyPlan>> {
    return this.executeWithTimeout('createStudyPlan', 3500, async () => {
      const totalMin = params.availableMinutes || 30;
      const step1Min = Math.round(totalMin * 0.3);
      const step2Min = Math.round(totalMin * 0.4);
      const step3Min = totalMin - step1Min - step2Min;

      const milestones = [
        {
          title: `ମୂଳ ଧାରଣା ଅନୁଧ୍ୟାନ: ${params.topic}`,
          description: `ବୋର୍ଡ ପାଠ୍ୟପୁସ୍ତକରୁ ${params.topic} ର ସଂଜ୍ଞା ଓ ରେଖାଚିତ୍ର ବୁଝନ୍ତୁ।`,
          estimatedMinutes: step1Min,
          resourceCitation: 'BSE Odisha ପାଠ୍ୟପୁସ୍ତକ, ପ୍ରମାଣିତ ଅଧ୍ୟାୟ',
        },
        {
          title: 'ନିର୍ଦ୍ଦେଶିତ ଅଭ୍ୟାସ ଓ ସ୍ଥାନୀୟ ଉଦାହରଣ',
          description: 'ଦୈନନ୍ଦିନ ଓଡ଼ିଶା ଜୀବନର ଉଦାହରଣ ଏବଂ ପରୀକ୍ଷା ଟିପ୍ପଣୀ ଅନୁଶୀଳନ କରନ୍ତୁ।',
          estimatedMinutes: step2Min,
          resourceCitation: 'BharatLearn Pedagogical Scaffold',
        },
        {
          title: 'ଆତ୍ମ-ମୂଲ୍ୟାୟନ ଓ ନିଦାନ ପ୍ରଶ୍ନୋତ୍ତର',
          description: 'ଅଭ୍ୟାସ ପ୍ରଶ୍ନ ସମାଧାନ କରି ନିଜ ଦକ୍ଷତା ମାପନ୍ତୁ ଏବଂ ଭୁଲ୍ ସଂଶୋଧନ ଦେଖନ୍ତୁ।',
          estimatedMinutes: step3Min,
          resourceCitation: 'BSE Odisha ପ୍ରଶ୍ନ ବ୍ୟାଙ୍କ',
        },
      ];

      return learningStateService.createStudyPlan({
        learnerId: params.learnerId,
        subjectId: params.subjectId,
        topic: params.topic,
        totalMinutes: totalMin,
        milestones,
      });
    });
  }

  // 5. getPracticeQuestions
  static async getPracticeQuestions(params: {
    conceptId?: string;
    topic?: string;
    subjectId?: string;
    gradeLevel?: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    count?: number;
    language?: string;
  }): Promise<
    ToolResult<{
      conceptId: string;
      topic: string;
      questions: Array<{
        questionId: string;
        promptNative: string;
        promptEn: string;
        options: string[];
        correctIndex: number;
        explanationNative: string;
        sourceCitation: string;
        difficulty: string;
        misconceptionTag?: string;
      }>;
    }>
  > {
    return this.executeWithTimeout('getPracticeQuestions', 3000, async () => {
      const questions = [
        {
          questionId: 'q_light_01',
          promptNative: 'ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ଉପଜାତ (by-product) ଭାବରେ ନିର୍ଗତ ହେଉଥିବା ଅମ୍ଳଜାନ ଗ୍ୟାସର ମୁଖ୍ୟ ଉତ୍ସ କ’ଣ?',
          promptEn: 'What is the primary source of oxygen released during photosynthesis?',
          options: [
            'କାର୍ବନ ଡାଇଅକ୍ସାଇଡ (CO2)',
            'ଜଳ (H2O)',
            'ଗ୍ଲୁକୋଜ (C6H12O6)',
            'କ୍ଲୋରୋଫିଲ (Chlorophyll)',
          ],
          correctIndex: 1,
          explanationNative:
            'ଜଳର ଆଲୋକ ବିଶ୍ଳେଷଣ (Photolysis) ଯୋଗୁଁ ଅମ୍ଳଜାନ ନିର୍ଗତ ହୁଏ, କାର୍ବନ ଡାଇଅକ୍ସାଇଡରୁ ନୁହେଁ।',
          sourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨',
          difficulty: 'MEDIUM',
          misconceptionTag: 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
        },
        {
          questionId: 'q_light_02',
          promptNative: 'ହରିତକଣାର କେଉଁ ଅଂଶରେ ଆଲୋକ ରାସାୟନିକ ପର୍ଯ୍ୟାୟ (Light Reaction) ସଂଘଠିତ ହୁଏ?',
          promptEn: 'In which part of the chloroplast does the light-dependent reaction occur?',
          options: ['ଷ୍ଟ୍ରୋମା (Stroma)', 'ଗ୍ରାନା / ଥାଇଲାକଏଡ୍ (Grana)', 'ବାହ୍ୟ ଝିଲ୍ଲୀ (Outer Membrane)', 'କୋଷଜୀବକ (Cytoplasm)'],
          correctIndex: 1,
          explanationNative: 'ଆଲୋକ ପ୍ରକ୍ରିୟା କ୍ଲୋରୋପ୍ଲାଷ୍ଟର ଗ୍ରାନାରେ ଏବଂ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ଷ୍ଟ୍ରୋମାରେ ହୁଏ।',
          sourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୧',
          difficulty: 'EASY',
          misconceptionTag: 'MISCONCEPTION_STROMA_GRANA_INVERSION',
        },
        {
          questionId: 'q_light_03',
          promptNative: 'ଆଲୋକ ପ୍ରକ୍ରିୟାରେ ଗଠିତ ଶକ୍ତିସମ୍ପନ୍ନ ରାସାୟନିକ ପଦାର୍ଥ ଦୁଇଟି କ’ଣ?',
          promptEn: 'What are the two energy-rich compounds synthesized during the light reaction?',
          options: [
            'ATP ଏବଂ NADPH',
            'ଗ୍ଲୁକୋଜ ଏବଂ ଷ୍ଟାର୍ଚ',
            'କାର୍ବନ ଡାଇଅକ୍ସାଇଡ ଏବଂ ଜଳ',
            'ଅମ୍ଳଜାନ ଏବଂ ସେଲ୍ୟୁଲୋଜ',
          ],
          correctIndex: 0,
          explanationNative: 'ଆଲୋକ ପ୍ରକ୍ରିୟାରେ ସୌର ଶକ୍ତି ATP ଓ NADPH ଭାବରେ ସଞ୍ଚିତ ହୁଏ।',
          sourceCitation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨',
          difficulty: 'HARD',
          misconceptionTag: 'MISCONCEPTION_ENERGY_CURRENCY',
        },
      ];

      const count = params.count || 2;
      return {
        conceptId: params.conceptId || 'concept_light_reaction',
        topic: params.topic || 'ଆଲୋକ ସଂଶ୍ଳେଷଣ',
        questions: questions.slice(0, count),
      };
    });
  }

  // 6. checkAnswer
  static async checkAnswer(params: {
    learnerId: string;
    questionId: string;
    conceptId: string;
    selectedOptionIndex?: number;
    writtenAnswer?: string;
  }): Promise<
    ToolResult<{
      isCorrect: boolean;
      score: number;
      correctOptionIndex: number;
      misconceptionTag?: string;
      feedbackNative: string;
      correctExplanation: string;
      sourceCitation: string;
    }>
  > {
    return this.executeWithTimeout('checkAnswer', 3000, async () => {
      // Mapping question correct answers
      const questionDb: Record<
        string,
        {
          correctIndex: number;
          misconceptionTag: string;
          feedbackWrong: string;
          feedbackCorrect: string;
          explanation: string;
          citation: string;
        }
      > = {
        q_light_01: {
          correctIndex: 1,
          misconceptionTag: 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
          feedbackWrong:
            'ଭୁଲ୍ ଧାରଣା! ମନେରଖନ୍ତୁ: ଉଦ୍ଭିଦ ଛାଡୁଥିବା ଅମ୍ଳଜାନ CO2 ରୁ ଆସେ ନାହିଁ, ବରଂ ଜଳ (H2O) ର ବିଘଟନ (Photolysis) ରୁ ଆସେ।',
          feedbackCorrect:
            'ଅତି ଉତ୍ତମ! ଆପଣ ସଠିକ୍ ଭାବେ ଚିହ୍ନଟ କରିଛନ୍ତି ଯେ ନିର୍ଗତ ଅମ୍ଳଜାନ ଜଳ (H2O) ର ବିଘଟନରୁ ଉତ୍ପନ୍ନ ହୁଏ।',
          explanation: '2H2O -> 4H+ + 4e- + O2 (ଜଳର ଆଲୋକ ବିଶ୍ଳେଷଣ)',
          citation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨',
        },
        q_light_02: {
          correctIndex: 1,
          misconceptionTag: 'MISCONCEPTION_STROMA_GRANA_INVERSION',
          feedbackWrong: 'ଷ୍ଟ୍ରୋମାରେ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ହୁଏ, ଆଲୋକ ପ୍ରକ୍ରିୟା ଗ୍ରାନା (ଥାଇଲାକଏଡ୍) ରେ ସଂଘଠିତ ହୋଇଥାଏ।',
          feedbackCorrect: 'ସଠିକ୍! ହରିତକଣାର ଗ୍ରାନାରେ ହିଁ ଆଲୋକ ପ୍ରକ୍ରିୟା ହୁଏ।',
          explanation: 'ଗ୍ରାନାରେ କ୍ଲୋରୋଫିଲ୍ ରହିଥାଏ ଯାହା ଆଲୋକ ଶକ୍ତି ଶୋଷଣ କରେ।',
          citation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୧',
        },
        q_light_03: {
          correctIndex: 0,
          misconceptionTag: 'MISCONCEPTION_ENERGY_CURRENCY',
          feedbackWrong: 'ଗ୍ଲୁକୋଜ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟାରେ ତିଆରି ହୁଏ। ଆଲୋକ ପ୍ରକ୍ରିୟାରେ ATP ଏବଂ NADPH ପ୍ରସ୍ତୁତ ହୁଏ।',
          feedbackCorrect: 'ଚମତ୍କାର! ATP ଓ NADPH ହେଉଛି ଆଲୋକ ପ୍ରକ୍ରିୟାର ମୁଖ୍ୟ ଶକ୍ତିସମ୍ପନ୍ନ ଯୌଗିକ।',
          explanation: 'ଏହି ଶକ୍ତି ଅନ୍ଧକାର ପ୍ରକ୍ରିୟାରେ କାର୍ବନ ବିଜାରଣ ପାଇଁ ଲାଗେ।',
          citation: 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨',
        },
      };

      const qInfo = questionDb[params.questionId] || questionDb['q_light_01'];
      const isCorrect = params.selectedOptionIndex === qInfo.correctIndex;
      const score = isCorrect ? 1.0 : 0.0;
      const misconceptionTag = !isCorrect ? qInfo.misconceptionTag : undefined;

      // Save to persistent learning state
      learningStateService.recordAnswer({
        learnerId: params.learnerId,
        questionId: params.questionId,
        conceptId: params.conceptId || 'concept_light_reaction',
        selectedOptionIndex: params.selectedOptionIndex,
        writtenAnswer: params.writtenAnswer,
        isCorrect,
        score,
        misconceptionTag,
      });

      return {
        isCorrect,
        score,
        correctOptionIndex: qInfo.correctIndex,
        misconceptionTag,
        feedbackNative: isCorrect ? qInfo.feedbackCorrect : qInfo.feedbackWrong,
        correctExplanation: qInfo.explanation,
        sourceCitation: qInfo.citation,
      };
    });
  }

  // 7. explainConcept
  static async explainConcept(params: {
    conceptName: string;
    gradeLevel: number;
    language: string;
    depth: 'STANDARD' | 'SIMPLER' | 'DEEPER';
    misconceptionTag?: string;
    studentQuery?: string;
  }): Promise<ToolResult<ConceptExplanationOutput>> {
    return this.executeWithTimeout('explainConcept', 5000, async () => {
      return GeminiService.explainConcept({
        conceptName: params.conceptName,
        gradeLevel: params.gradeLevel,
        language: params.language,
        depth: params.depth,
        misconceptionTag: params.misconceptionTag,
        studentQuery: params.studentQuery,
      });
    });
  }

  // 8. recordLearningActivity
  static async recordLearningActivity(params: {
    learnerId: string;
    conceptId: string;
    conceptTitle: string;
    activityType: string;
    durationMinutes: number;
    score?: number;
    notes?: string;
    sessionId?: string;
    idempotencyKey?: string;
  }): Promise<
    ToolResult<{
      success: boolean;
      record: LearningActivityRecord;
      updatedMastery: number;
    }>
  > {
    return this.executeWithTimeout('recordLearningActivity', 2500, async () => {
      return learningStateService.recordActivity(params.learnerId, params);
    });
  }

  // 9. updateStudyPlan
  static async updateStudyPlan(params: {
    planId: string;
    completedStepIndex: number;
    learnerId: string;
  }): Promise<
    ToolResult<{
      success: boolean;
      plan?: StudyPlan;
      error?: string;
    }>
  > {
    return this.executeWithTimeout('updateStudyPlan', 2500, async () => {
      return learningStateService.updateStudyPlanMilestone(
        params.planId,
        params.completedStepIndex,
        params.learnerId
      );
    });
  }

  // 10. requestParentUnlock
  static async requestParentUnlock(params: {
    learnerId: string;
    reason: string;
    studentNote?: string;
    sessionId?: string;
  }): Promise<
    ToolResult<{
      requestId: string;
      status: string;
      message: string;
    }>
  > {
    return this.executeWithTimeout('requestParentUnlock', 2500, async () => {
      // Find active session for learner
      const session = parentService.getActiveSession(params.learnerId);
      const sessionId = params.sessionId || session?.id || `sess_active_${params.learnerId}`;

      const res = parentService.requestUnlock(
        params.learnerId,
        sessionId,
        params.reason,
        params.studentNote
      );

      return {
        requestId: res.id,
        status: res.status,
        message: 'ଅଭିଭାବକଙ୍କୁ ଅନ୍-ଲକ୍ ଅନୁରୋଧ ପଠାଗଲା (Unlock request submitted to parent).',
      };
    });
  }

  /**
   * Generic execution router with RBAC validation and input verification.
   */
  static async executeTool<T = any>(
    toolName: string,
    params: any,
    context?: { learnerId?: string; role?: string; sessionId?: string }
  ): Promise<ToolResult<T>> {
    const startTime = Date.now();
    const validTools = [
      'getLearnerProfile',
      'getLearningProgress',
      'searchLearningResources',
      'createStudyPlan',
      'getPracticeQuestions',
      'checkAnswer',
      'explainConcept',
      'recordLearningActivity',
      'updateStudyPlan',
      'requestParentUnlock',
    ];

    if (!validTools.includes(toolName)) {
      return {
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool "${toolName}" is not registered in the pedagogical tool registry.`,
        },
        audit: {
          toolName,
          executionTimeMs: Date.now() - startTime,
          status: 'ERROR',
          errorCode: 'TOOL_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        data: null as unknown as T,
      };
    }

    // Authentication check
    if (!context || !context.learnerId || context.role === 'guest') {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication session required to execute pedagogical tools.',
        },
        audit: {
          toolName,
          executionTimeMs: Date.now() - startTime,
          status: 'ERROR',
          errorCode: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        },
        data: null as unknown as T,
      };
    }

    // Cross-learner authorization check
    const targetLearnerId = params?.learnerId || context.learnerId;
    if (
      context.role === 'student' &&
      params?.learnerId &&
      params.learnerId !== context.learnerId
    ) {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Learner "${context.learnerId}" is not authorized to access or modify records of learner "${params.learnerId}".`,
        },
        audit: {
          toolName,
          executionTimeMs: Date.now() - startTime,
          status: 'ERROR',
          errorCode: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        data: null as unknown as T,
      };
    }

    // Input validation check per tool
    if (toolName === 'checkAnswer') {
      if (!params?.questionId || params?.selectedOptionIndex === undefined) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'checkAnswer requires questionId and selectedOptionIndex.',
          },
          audit: {
            toolName,
            executionTimeMs: Date.now() - startTime,
            status: 'ERROR',
            errorCode: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
          },
          data: null as unknown as T,
        };
      }
    }

    // Dispatch
    switch (toolName) {
      case 'getLearnerProfile':
        return (await this.getLearnerProfile(targetLearnerId)) as any;
      case 'getLearningProgress':
        return (await this.getLearningProgress(targetLearnerId, params?.subjectId)) as any;
      case 'searchLearningResources':
        return (await this.searchLearningResources(params)) as any;
      case 'createStudyPlan':
        return (await this.createStudyPlan({ ...params, learnerId: targetLearnerId })) as any;
      case 'getPracticeQuestions':
        return (await this.getPracticeQuestions(params)) as any;
      case 'checkAnswer':
        return (await this.checkAnswer(params)) as any;
      case 'explainConcept':
        return (await this.explainConcept(params)) as any;
      case 'recordLearningActivity':
        return (await this.recordLearningActivity({ ...params, learnerId: targetLearnerId })) as any;
      case 'updateStudyPlan':
        return (await this.updateStudyPlan(params)) as any;
      case 'requestParentUnlock':
        return (await this.requestParentUnlock({ ...params, learnerId: targetLearnerId })) as any;
      default:
        return {
          success: false,
          error: { code: 'TOOL_NOT_FOUND', message: 'Unknown tool' },
          audit: {
            toolName,
            executionTimeMs: Date.now() - startTime,
            status: 'ERROR',
            timestamp: new Date().toISOString(),
          },
          data: null as unknown as T,
        };
    }
  }
}

export const toolRegistry = ToolRegistry;

