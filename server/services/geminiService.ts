/**
 * BharatLearn AI — Gemini Service (Backend Pedagogical AI Proxy)
 * Securely uses @google/genai on the server without exposing keys to the browser.
 * Uses modern 'gemini-3.8-flash' model with structured reasoning, tool orchestration,
 * localized pedagogical analogies, progressive hints, and deterministic curriculum fallbacks.
 */

import { GoogleGenAI } from '@google/genai';

export interface PedagogicalPlanOutput {
  intent: string;
  pedagogicalGoal: string;
  selectedTool: string;
  toolArguments: Record<string, any>;
  reasoning: string;
  suggestedSteps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    estimatedMinutes: number;
  }>;
}

export interface ConceptExplanationOutput {
  title: string;
  summary: string;
  detailedExplanation: string;
  explanation?: string;
  sourceProvenance?: string;
  culturalAnalogy?: {
    title: string;
    analogyText: string;
    sourceContext: string;
  };
  keyTakeaways: string[];
  reflectionQuestion: string;
}

export class GeminiService {
  private static ai: GoogleGenAI | null = null;
  private static readonly MODEL_NAME = 'gemini-3.8-flash';

  private static getClient(): GoogleGenAI | null {
    if (!this.ai && process.env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return this.ai;
  }

  private static async generateWithTimeout<T>(operation: () => Promise<T>, timeoutMs = 4000): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Gemini call timed out after ${timeoutMs}ms`)), timeoutMs);
    });
    try {
      const res = await Promise.race([operation(), timeoutPromise]);
      if (timer) clearTimeout(timer);
      return res;
    } catch (e) {
      if (timer) clearTimeout(timer);
      throw e;
    }
  }

  /**
   * Reason and Plan: Core orchestrator reasoning step
   */
  static async reasonAndPlan(params: {
    learnerMessage: string;
    gradeLevel: number;
    assignedClass: string;
    language: string;
    subjectId: string;
    topic: string;
    currentMastery: number;
    isRestricted?: boolean;
  }): Promise<PedagogicalPlanOutput> {
    const ai = this.getClient();

    if (!ai) {
      // Deterministic reasoning fallback
      return this.fallbackReasonAndPlan(params);
    }

    const systemPrompt = `You are the BharatLearn AI Pedagogical Orchestrator for Indian school students.
Learner Context:
- Grade Level: Class ${params.gradeLevel} (${params.assignedClass})
- Explanation Language: ${params.language} (e.g., 'or' for Odia, 'hi' for Hindi, 'en' for English)
- Subject: ${params.subjectId}
- Topic: ${params.topic}
- Current Mastery: ${Math.round(params.currentMastery * 100)}%
- Session Restricted by Parental Controls: ${params.isRestricted ? 'YES' : 'NO'}

Available Registered Tools:
1. 'getLearnerProfile': Retrieve authenticated profile
2. 'getLearningProgress': Retrieve persistent mastery and past activities
3. 'searchLearningResources': Search approved textbook chapters, definitions, diagrams
4. 'createStudyPlan': Generate structured study steps for topic and time
5. 'getPracticeQuestions': Get curriculum-aligned questions for topic/concept
6. 'checkAnswer': Evaluate student answer and check misconceptions
7. 'explainConcept': Explain concept with depth (STANDARD / SIMPLER / DEEPER)
8. 'recordLearningActivity': Record learning progress and duration
9. 'updateStudyPlan': Mark study plan step completed
10. 'requestParentUnlock': Request parental unlock if session restricted

Analyze the learner's request: "${params.learnerMessage}".
Formulate the pedagogical goal, pick the single best tool to invoke next with arguments, and outline a 3-step learning pathway.
Return JSON with format:
{
  "intent": "SHORT_INTENT_KEY",
  "pedagogicalGoal": "Clear sentence describing the goal",
  "selectedTool": "one_of_the_registered_tools",
  "toolArguments": { ...arguments matching tool requirements... },
  "reasoning": "Why this tool was chosen based on learner context",
  "suggestedSteps": [
    { "stepNumber": 1, "title": "Step title", "description": "Details", "estimatedMinutes": 5 }
  ]
}`;

    try {
      const response = await this.generateWithTimeout(() =>
        ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        3500
      );

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.selectedTool && parsed.pedagogicalGoal) {
        return parsed as PedagogicalPlanOutput;
      }
      return this.fallbackReasonAndPlan(params);
    } catch (err) {
      console.warn('Gemini reasonAndPlan failed, utilizing deterministic fallback:', err);
      return this.fallbackReasonAndPlan(params);
    }
  }

  /**
   * Generates a pedagogical explanation adapted to class level, language, and depth
   */
  static async explainConcept(params: {
    conceptName: string;
    gradeLevel: number;
    language: string;
    depth: 'STANDARD' | 'SIMPLER' | 'DEEPER';
    misconceptionTag?: string;
    studentQuery?: string;
  }): Promise<ConceptExplanationOutput> {
    const ai = this.getClient();

    if (!ai) {
      return this.fallbackConceptExplanation(params);
    }

    const depthInstruction =
      params.depth === 'SIMPLER'
        ? 'Provide an intuitive, beginner-friendly explanation using a vivid real-life cultural analogy from Odisha/India rural or daily life (like farming, cooking in handi, water pumps, sunlight, clay pots).'
        : params.depth === 'DEEPER'
        ? 'Provide a comprehensive, exam-grade explanation with biochemical or physical equations, step-by-step mechanisms, and critical exam distinctions.'
        : 'Provide a clear, balanced curriculum-aligned explanation suitable for a Class ' +
          params.gradeLevel +
          ' board exam student.';

    const prompt = `You are a master teacher on BharatLearn AI.
Explain the concept "${params.conceptName}" for a Class ${params.gradeLevel} student.
Explanation Language: ${params.language === 'or' ? 'Odia (ଓଡ଼ିଆ)' : params.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
Depth Mode: ${params.depth}. ${depthInstruction}
${params.misconceptionTag ? `Address this common misconception: ${params.misconceptionTag}` : ''}
${params.studentQuery ? `Specifically answer this question from the student: "${params.studentQuery}"` : ''}

Output JSON with format:
{
  "title": "Concept Title in target language",
  "summary": "1-2 sentence core definition",
  "detailedExplanation": "Complete pedagogical explanation in clear paragraphs",
  "culturalAnalogy": {
    "title": "Analogy Title",
    "analogyText": "Vivid relatable analogy from everyday life",
    "sourceContext": "Local context (e.g. Village hand-pump, Chilika lake, earthen oven)"
  },
  "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
  "reflectionQuestion": "One thought-provoking question for the student"
}`;

    try {
      const response = await this.generateWithTimeout(() =>
        ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
        3500
      );

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.title && parsed.detailedExplanation) {
        return parsed as ConceptExplanationOutput;
      }
      return this.fallbackConceptExplanation(params);
    } catch (err) {
      console.warn('Gemini explainConcept failed, using fallback:', err);
      return this.fallbackConceptExplanation(params);
    }
  }

  /**
   * Generates a progressive hint without spoiling the answer
   */
  static async generateHint(params: {
    questionPrompt: string;
    options?: string[];
    conceptName: string;
    language: string;
    hintLevel: 1 | 2; // 1 = subtle clue, 2 = strong nudge
  }): Promise<{ hintText: string; hintLevel: number }> {
    const ai = this.getClient();

    if (!ai) {
      return {
        hintLevel: params.hintLevel,
        hintText:
          params.hintLevel === 1
            ? 'ମନେ ପକାନ୍ତୁ: ଏହି ପ୍ରକ୍ରିୟାରେ ସୂର୍ଯ୍ୟାଲୋକର ଫୋଟନ୍ ଶକ୍ତି କେଉଁ ଅଣୁକୁ ଭାଙ୍ଗିବା ପାଇଁ ବ୍ୟବହୃତ ହୁଏ?'
            : 'ସୂଚନା: ଏଥିରେ ଜଳ (H2O) ର ବିଘଟନ ଘଟି ଅମ୍ଳଜାନ (O2) ନିର୍ଗତ ହୋଇଥାଏ, କାର୍ବନ ଡାଇଅକ୍ସାଇଡରୁ ନୁହେଁ।',
      };
    }

    const prompt = `You are a supportive tutor on BharatLearn AI.
Question: "${params.questionPrompt}"
Options: ${JSON.stringify(params.options || [])}
Concept: ${params.conceptName}
Language: ${params.language === 'or' ? 'Odia' : 'English'}
Hint Level: ${params.hintLevel} (${params.hintLevel === 1 ? 'Gentle conceptual question/clue' : 'Strong directional nudge without giving the direct option letter'})

Return JSON:
{
  "hintText": "Hint in target language",
  "hintLevel": ${params.hintLevel}
}`;

    try {
      const res = await this.generateWithTimeout(() =>
        ai.models.generateContent({
          model: this.MODEL_NAME,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { responseMimeType: 'application/json' },
        }),
        3500
      );
      const parsed = JSON.parse(res.text || '{}');
      return {
        hintText: parsed.hintText || 'ସୂର୍ଯ୍ୟାଲୋକ ଦ୍ୱାରା ଜଳର ବିଶ୍ଳେଷଣ ପ୍ରତି ଧ୍ୟାନ ଦିଅନ୍ତୁ।',
        hintLevel: params.hintLevel,
      };
    } catch {
      return {
        hintLevel: params.hintLevel,
        hintText: 'ସୂର୍ଯ୍ୟାଲୋକ ଦ୍ୱାରା ଜଳ (H2O) ର ଫୋଟୋଲାଇସିସ୍ ପ୍ରକ୍ରିୟାକୁ ସ୍ମରଣ କରନ୍ତୁ।',
      };
    }
  }

  // --- Curated Deterministic Fallbacks ---

  private static fallbackReasonAndPlan(params: {
    learnerMessage: string;
    gradeLevel: number;
    assignedClass: string;
    language: string;
    subjectId: string;
    topic: string;
    currentMastery: number;
    isRestricted?: boolean;
  }): PedagogicalPlanOutput {
    const msg = (params.learnerMessage || '').toLowerCase();

    if (params.isRestricted) {
      return {
        intent: 'HANDLE_RESTRICTION',
        pedagogicalGoal: 'Notify student of parental restriction and offer unlock request',
        selectedTool: 'requestParentUnlock',
        toolArguments: {
          reason: 'Student active during parental restriction',
          studentNote: params.learnerMessage,
        },
        reasoning: 'Active study session is locked by parental control policy.',
        suggestedSteps: [
          { stepNumber: 1, title: 'Check Restriction', description: 'Session locked by parent', estimatedMinutes: 1 },
          { stepNumber: 2, title: 'Request Unlock', description: 'Submit unlock request to parent', estimatedMinutes: 2 },
        ],
      };
    }

    if (msg.includes('ଅଭ୍ୟାସ') || msg.includes('question') || msg.includes('quiz') || msg.includes('test') || msg.includes('ପ୍ରଶ୍ନ')) {
      return {
        intent: 'PRACTICE_DRILL',
        pedagogicalGoal: `Generate curriculum practice questions for ${params.topic}`,
        selectedTool: 'getPracticeQuestions',
        toolArguments: {
          conceptId: 'concept_light_reaction',
          topic: params.topic,
          subjectId: params.subjectId,
          gradeLevel: params.gradeLevel,
          count: 3,
          language: params.language,
        },
        reasoning: 'Learner requested diagnostic or practice questions for current topic.',
        suggestedSteps: [
          { stepNumber: 1, title: 'Fetch Questions', description: 'Retrieve approved board questions', estimatedMinutes: 2 },
          { stepNumber: 2, title: 'Attempt & Submit', description: 'Solve and test understanding', estimatedMinutes: 8 },
          { stepNumber: 3, title: 'Review Misconceptions', description: 'Read diagnostic feedback', estimatedMinutes: 5 },
        ],
      };
    }

    if (msg.includes('plan') || msg.includes('ଯୋଜନା') || msg.includes('schedule') || msg.includes('ସମୟ')) {
      return {
        intent: 'CREATE_STUDY_PLAN',
        pedagogicalGoal: `Create a customized study plan for ${params.topic}`,
        selectedTool: 'createStudyPlan',
        toolArguments: {
          topic: params.topic,
          subjectId: params.subjectId,
          availableMinutes: 30,
          goalType: 'CONCEPT_MASTERY',
        },
        reasoning: 'Learner requested a step-by-step study schedule and milestone roadmap.',
        suggestedSteps: [
          { stepNumber: 1, title: 'Core Concept Intro', description: 'Textbook study and diagrams', estimatedMinutes: 10 },
          { stepNumber: 2, title: 'Guided Practice', description: 'Diagnostic question review', estimatedMinutes: 12 },
          { stepNumber: 3, title: 'Self Reflection', description: 'Summarize key takeaways', estimatedMinutes: 8 },
        ],
      };
    }

    // Default: Explain concept
    return {
      intent: 'EXPLAIN_CONCEPT',
      pedagogicalGoal: `Provide curriculum-aligned explanation for ${params.topic}`,
      selectedTool: 'explainConcept',
      toolArguments: {
        conceptName: params.topic || 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଫୋଟୋଲାଇସିସ୍ (Light Reaction)',
        gradeLevel: params.gradeLevel,
        language: params.language,
        depth: msg.includes('ସରଳ') || msg.includes('simple') ? 'SIMPLER' : msg.includes('detail') || msg.includes('exam') ? 'DEEPER' : 'STANDARD',
        studentQuery: params.learnerMessage,
      },
      reasoning: 'Learner seeking conceptual mastery or query clarification.',
      suggestedSteps: [
        { stepNumber: 1, title: 'Read Concept Breakdown', description: 'Understand underlying science mechanism', estimatedMinutes: 7 },
        { stepNumber: 2, title: 'Examine Local Analogy', description: 'Connect mechanism to everyday observation', estimatedMinutes: 5 },
        { stepNumber: 3, title: 'Check Understanding', description: 'Answer a quick diagnostic question', estimatedMinutes: 5 },
      ],
    };
  }

  private static fallbackConceptExplanation(params: {
    conceptName: string;
    gradeLevel: number;
    language: string;
    depth: 'STANDARD' | 'SIMPLER' | 'DEEPER';
  }): ConceptExplanationOutput {
    if (params.depth === 'SIMPLER') {
      const detailed =
        'ଉଦ୍ଭିଦର ପତ୍ର ଏକ ଛୋଟ ରୋଷେଇ ଘର ପରି। ଯେପରି ଚୁଲିରେ ରୋଷେଇ କରିବାକୁ ନିଆଁର ଉତ୍ତାପ ଦରକାର, ସେହିପରି ଗଛ ପାଇଁ ସୂର୍ଯ୍ୟାଲୋକ ହେଉଛି ଉର୍ଜ୍ଜା। ଚେର ଦ୍ୱାରା ଶୋଷିତ ହୋଇଥିବା ପାଣି ଯେତେବେଳେ ପତ୍ରରେ ପହଞ୍ଚେ, ସୂର୍ଯ୍ୟାଲୋକ ସେହି ପାଣିକୁ ଦୁଇ ଭାଗ କରିଦିଏ - ହାଇଡ୍ରୋଜେନ୍ ଏବଂ ଅମ୍ଳଜାନ। ଅମ୍ଳଜାନ ପତ୍ରର ଷ୍ଟୋମାଟା ଦେଇ ବାୟୁମଣ୍ଡଳକୁ ଆସେ ଯାହାକୁ ଆମେ ନିଶ୍ୱାସରେ ନେଉ।';
      return {
        title: 'ଆଲୋକ ସଂଶ୍ଳେଷଣର ସରଳ ବୁଝାମଣା (ସୂର୍ଯ୍ୟାଲୋକରୁ ଖାଦ୍ୟ)',
        summary: 'ସବୁଜ ଉଦ୍ଭିଦ ନିଜ ପତ୍ରରେ ଥିବା ହରିତକଣା ସାହାଯ୍ୟରେ ସୂର୍ଯ୍ୟାଲୋକ ଓ ପାଣି ବ୍ୟବହାର କରି ଖାଦ୍ୟ ତିଆରି କରେ ଏବଂ ଆମ ପାଇଁ ଅମ୍ଳଜାନ ଛାଡ଼େ।',
        detailedExplanation: detailed,
        explanation: detailed,
        sourceProvenance: 'NCERT_BSE_ODISHA_CURRICULUM',
        culturalAnalogy: {
          title: 'ଗାଁର ସୌର ଚୁଲି ଓ ନଳକୂପ ପାଣି ଉଦାହରଣ',
          analogyText:
            'ଯେପରି ଗାଁରେ ସୌର ଚୁଲିରେ ସୂର୍ଯ୍ୟ କିରଣ ପଡ଼ିଲେ ହାଣ୍ଡିର ପାଣି ଫୁଟି ବାଷ୍ପ ହୁଏ, ସେହିପରି ପତ୍ର ଉପରେ ସୂର୍ଯ୍ୟକିରଣ ପଡ଼ିଲେ ପାଣି ଅଣୁ ଭାଙ୍ଗିଯାଏ। ଏହି ଭଙ୍ଗାରୁ ଅମ୍ଳଜାନ ମୁକ୍ତ ହୁଏ।',
          sourceContext: 'ଓଡ଼ିଶାର ଗ୍ରାମୀଣ ଦୈନନ୍ଦିନ ଜୀବନ ଓ ପ୍ରକୃତି ପର୍ଯ୍ୟବେକ୍ଷଣ',
        },
        keyTakeaways: [
          'ଅମ୍ଳଜାନ ପାଣି (H2O) ରୁ ମିଳିଥାଏ, କାର୍ବନ ଡାଇଅକ୍ସାଇଡରୁ ନୁହେଁ।',
          'ଏହି ପ୍ରକ୍ରିୟା ଦିନବେଳା ସୂର୍ଯ୍ୟାଲୋକ ଉପସ୍ଥିତିରେ ହିଁ ଘଟେ।',
          'ପତ୍ରରେ ଥିବା କ୍ଲୋରୋଫିଲ୍ (ହରିତକଣା) ସୂର୍ଯ୍ୟାଲୋକ ଧରି ରଖେ।',
        ],
        reflectionQuestion: 'ଯଦି ଏକ ଗଛକୁ ଅନ୍ଧାର ଘରେ ରଖାଯାଏ, ତେବେ କାହିଁକି ସେ ଅମ୍ଳଜାନ ଛାଡ଼ିପାରିବ ନାହିଁ?',
      };
    }

    if (params.depth === 'DEEPER') {
      const detailed =
        'ଆଲୋକ ସଂଶ୍ଳେଷଣର ପ୍ରଥମ ପର୍ଯ୍ୟାୟକୁ ଆଲୋକ ପ୍ରକ୍ରିୟା କୁହାଯାଏ। ଏହା କ୍ଲୋରୋପ୍ଲାଷ୍ଟର ଗ୍ରାନାରେ ଘଟିଥାଏ। ଯେତେବେଳେ ଫୋଟନ୍ କଣିକା କ୍ଲୋରୋଫିଲ୍ a (P680) ଉପରେ ପଡ଼େ, ଇଲେକ୍ଟ୍ରନ୍ ଉତ୍ତେଜିତ ହୋଇ ଉଚ୍ଚ ଶକ୍ତି ସ୍ତରକୁ ଯାଏ। ଏହି ଇଲେକ୍ଟ୍ରନ୍ ନିଅଣ୍ଟକୁ ପୂରଣ କରିବା ପାଇଁ ଅକ୍ସିଜେନ୍-ଇଭଲଭିଂ କମ୍ପ୍ଲେକ୍ସ (OEC) ଦ୍ୱାରା ଜଳ ଅଣୁ ବିଭାଜିତ ହୁଏ: 2H2O -> 4H+ + 4e- + O2। ଏହା ହିଁ ଜୀବଜଗତର ପ୍ରାଣବାୟୁ ଅମ୍ଳଜାନର ଉତ୍ସ।';
      return {
        title: 'ଆଲୋକ ରାସାୟନିକ ପର୍ଯ୍ୟାୟ ଓ ଫୋଟୋଲାଇସିସ୍ (ଗଭୀର ବିଶ୍ଳେଷଣ)',
        summary: 'ହରିତକଣାର ଥାଇଲାକଏଡ୍ ଝିଲ୍ଲୀରେ ଫୋଟୋସିଷ୍ଟମ୍ II (PS-II) ଦ୍ୱାରା ଜଳର ଆଲୋକ ବିଘଟନ (Hill Reaction) ଏବଂ ATP ଓ NADPH ର ଉତ୍ପାଦନ।',
        detailedExplanation: detailed,
        explanation: detailed,
        sourceProvenance: 'NCERT_BSE_ODISHA_CURRICULUM',
        culturalAnalogy: {
          title: 'ଜଳବିଦ୍ୟୁତ୍ ପ୍ରକଳ୍ପ (ହୀରାକୁଦ ଡ୍ୟାମ୍ ଉଦାହରଣ)',
          analogyText:
            'ହୀରାକୁଦ ଡ୍ୟାମରେ ପାଣିର ବେଗ ଟର୍ବାଇନ୍ ଘୁରାଇ ବିଦ୍ୟୁତ୍ ଉତ୍ପନ୍ନ କଲା ପରି, ଥାଇଲାକଏଡ୍ ଭିତରେ ଜମା ହୋଇଥିବା ପ୍ରୋଟୋନ୍ (H+) ର ଚାପ ATP-ସିନ୍ଥେଜ୍ ମେସିନକୁ ଚଳାଇ ଜୀବକୋଷର ଶକ୍ତି ମୁଦ୍ରା ATP ତିଆରି କରେ।',
          sourceContext: 'ହୀରାକୁଦ ଜଳବିଦ୍ୟୁତ୍ ଉତ୍ପାଦନ ପ୍ରଣାଳୀ',
        },
        keyTakeaways: [
          'ରାସାୟନିକ ସମୀକରଣ: 2H2O -> 4H+ + 4e- + O2',
          'ଘଟଣାସ୍ଥଳ: କ୍ଲୋରୋପ୍ଲାଷ୍ଟର ଗ୍ରାନା (ଥାଇଲାକଏଡ୍ ଝିଲ୍ଲୀ)',
          'ଆଲୋକ ପ୍ରକ୍ରିୟାର ମୁଖ୍ୟ ଉତ୍ପାଦ: ATP, NADPH ଏବଂ ଉପଜାତ O2',
        ],
        reflectionQuestion: 'Hill Reaction ରେ କେଉଁ ଧାତବ ଆୟନ (Mn2+, Cl-) ଜଳ ବିଘଟନ କମ୍ପ୍ଲେକ୍ସରେ ସହକାରୀ ଭାବରେ କାର୍ଯ୍ୟ କରେ?',
      };
    }

    // Standard
    const detailed =
      'ଆଲୋକ ସଂଶ୍ଳେଷଣ ପ୍ରକ୍ରିୟାରେ ଦୁଇଟି ମୁଖ୍ୟ ପର୍ଯ୍ୟାୟ ଥାଏ: ୧. ଆଲୋକ ପ୍ରକ୍ରିୟା ଏବଂ ୨. ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା। ଆଲୋକ ପ୍ରକ୍ରିୟାଟି କ୍ଲୋରୋପ୍ଲାଷ୍ଟର ଗ୍ରାନାରେ ସୂର୍ଯ୍ୟାଲୋକ ଉପସ୍ଥିତିରେ ହୁଏ। ଏଠାରେ ସୂର୍ଯ୍ୟାଲୋକର ଫୋଟନ୍ କଣିକା ଶୋଷିତ ହୋଇ ରାସାୟନିକ ଶକ୍ତିରେ ରୂପାନ୍ତରିତ ହୁଏ ଏବଂ ଜଳର ବିଘଟନ ଘଟେ। ଏହାକୁ ଫୋଟୋଲାଇସିସ୍ (Photolysis) କୁହାଯାଏ। ଏହି ପ୍ରକ୍ରିୟାରେ ଉପଜାତ ଭାବରେ ଅମ୍ଳଜାନ ବାହାରକୁ ଆସେ।';
    return {
      title: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଜଳର ବିଘଟନ (BSE Odisha Class 10)',
      summary: 'ଆଲୋକ ସଂଶ୍ଳେଷଣର ପ୍ରଥମ ପର୍ଯ୍ୟାୟରେ ସୂର୍ଯ୍ୟାଲୋକର ଶକ୍ତି ଦ୍ୱାରା ଜଳର ବିଘଟନ ଘଟି ଅମ୍ଳଜାନ ମୁକ୍ତ ହୁଏ।',
      detailedExplanation: detailed,
      explanation: detailed,
      sourceProvenance: 'NCERT_BSE_ODISHA_CURRICULUM',
      culturalAnalogy: {
        title: 'ସୂର୍ଯ୍ୟ କିରଣରୁ ଶକ୍ତି ରୂପାନ୍ତର',
        analogyText:
          'ଯେପରି ଘରେ ବ୍ୟାଟେରୀ ଚାର୍ଜ କରିବା ପାଇଁ ସୋଲାର ପ୍ୟାନେଲ୍ ଲଗାଯାଏ, ସେହିପରି ଉଦ୍ଭିଦ ପତ୍ରର ହରିତକଣା ସୂର୍ଯ୍ୟାଲୋକରୁ ଚାର୍ଜ ସଂଗ୍ରହ କରି ଜଳ ଅଣୁକୁ ବିଭାଜିତ କରେ।',
        sourceContext: 'ଓଡ଼ିଶାର ସୌରଶକ୍ତି ଉପକରଣ',
      },
      keyTakeaways: [
        'ଆଲୋକ ପ୍ରକ୍ରିୟା କ୍ଲୋରୋପ୍ଲାଷ୍ଟର ଗ୍ରାନାରେ ସଂଗଠିତ ହୁଏ।',
        'ଜଳର ବିଘଟନ ଯୋଗୁଁ ହିଁ ଅମ୍ଳଜାନ ନିର୍ଗତ ହୁଏ।',
        'ଏହି ପର୍ଯ୍ୟାୟରେ ଶକ୍ତି ସମ୍ପନ୍ନ ଯୌଗିକ ATP ଓ NADPH ଗଠିତ ହୁଏ।',
      ],
      reflectionQuestion: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ନ ହେଲେ ଅନ୍ଧକାର ପ୍ରକ୍ରିୟାରେ ଗ୍ଲୁକୋଜ ତିଆରି ହୋଇପାରିବ କି? କାହିଁକି?',
    };
  }
}

