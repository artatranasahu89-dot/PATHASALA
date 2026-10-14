/**
 * BharatLearn AI — Agentic AI Learning Companion
 * Implements the full personalized learning experience and real-time visible 8-stage agent loop:
 * RECEIVE_REQUEST → ASSESS_CONTEXT → CREATE_PLAN → SELECT_TOOL →
 * EXECUTE_TOOL → VERIFY_RESULT → UPDATE_LEARNER_STATE → RESPOND
 * Features natural language querying, depth toggles (Standard/Simpler/Deeper),
 * progressive hints, practice drills, dynamic study planning, and verifiable audit traces.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lock,
  Unlock,
  Send,
  Compass,
  CheckCircle,
  ListTodo,
} from 'lucide-react';
import type {
  AppPage,
  LearnerProfile,
  LearnerCategoryId,
  AgentInteractionResponse,
  AgentLearningStep,
  StudyPlan,
  WorkflowEventAudit,
} from '../types';
import { ApiService } from '../services/api';

interface CompanionEntryPageProps {
  category: LearnerCategoryId;
  profile: LearnerProfile | null;
  onNavigate: (page: AppPage) => void;
}

export function CompanionEntryPage({ category, profile, onNavigate }: CompanionEntryPageProps) {
  const learnerId = profile?.id || 'learner_pilot_odia_01';
  const gradeLevel = profile?.gradeLevel || 10;
  const assignedClass = profile?.assignedClass || 'Class 10-A (ମାଟ୍ରିକ)';

  // Interaction State
  const [userQuery, setUserQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ଫୋଟୋଲାଇସିସ୍ (Photosynthesis & Photolysis)');
  const [selectedSubjectId, setSelectedSubjectId] = useState('BSE_OD_10_LIFE_SCIENCE');
  const [depthMode, setDepthMode] = useState<'STANDARD' | 'SIMPLER' | 'DEEPER'>('STANDARD');

  // Loading & Agent State
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<AgentInteractionResponse | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Practice & Quiz State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizEvaluation, setQuizEvaluation] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Progressive Hint State
  const [hintText, setHintText] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<1 | 2>(1);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Study Plan State
  const [planDuration, setPlanDuration] = useState<number>(30);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Observability & Audit Panel
  const [showAuditPanel, setShowAuditPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<'EXPLANATION' | 'PRACTICE' | 'STUDY_PLAN'>('EXPLANATION');

  // Load initial progress and active session on mount
  useEffect(() => {
    async function init() {
      try {
        const progress = await ApiService.getPersistentLearningProgress(learnerId);
        if (progress.activePlan) {
          setActivePlan(progress.activePlan);
        }

        // Trigger initial agent interaction to introduce concept
        handleAgentQuery('ଆଲୋକ ସଂଶ୍ଳେଷଣର ଆଲୋକ ପ୍ରକ୍ରିୟା ବୁଝାଇ ଦିଅନ୍ତୁ');
      } catch (err) {
        console.warn('Initial progress load error:', err);
      }
    }
    init();
  }, [learnerId]);

  const handleAgentQuery = async (queryText?: string, overrideDepth?: 'STANDARD' | 'SIMPLER' | 'DEEPER') => {
    const textToSend = queryText || userQuery;
    if (!textToSend.trim() && !queryText) return;

    setIsLoading(true);
    setErrorMessage(null);
    setHintText(null);
    setQuizEvaluation(null);
    setSelectedOption(null);

    const activeDepth = overrideDepth || depthMode;

    try {
      const response = await ApiService.interactWithAgent({
        sessionId: sessionId || undefined,
        learnerId,
        message: textToSend,
        subjectId: selectedSubjectId,
        topic: selectedTopic,
        depth: activeDepth,
      });

      setSessionId(response.sessionId);
      setAgentResponse(response);
      if (response.activePlan) {
        setActivePlan(response.activePlan);
      }
      if (response.activeQuestion) {
        setActiveTab('PRACTICE');
      } else {
        setActiveTab('EXPLANATION');
      }
      setUserQuery('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Agent communication failed';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDepth = (newDepth: 'STANDARD' | 'SIMPLER' | 'DEEPER') => {
    setDepthMode(newDepth);
    handleAgentQuery(
      newDepth === 'SIMPLER'
        ? 'ମୋତେ ସରଳ ଗ୍ରାମୀଣ ଉଦାହରଣ ମାଧ୍ୟମରେ ବୁଝାଇ ଦିଅନ୍ତୁ (Explain with simple cultural analogy)'
        : newDepth === 'DEEPER'
        ? 'ପରୀକ୍ଷା ଉପଯୋଗୀ ଗଭୀର ରାସାୟନିକ ବିଶ୍ଳେଷଣ ଦିଅନ୍ତୁ (Deep exam-oriented breakdown)'
        : 'ପାଠ୍ୟପୁସ୍ତକ ମାନକ ବ୍ୟାଖ୍ୟା ଦିଅନ୍ତୁ (Standard curriculum explanation)',
      newDepth
    );
  };

  const handleAnswerSubmit = async () => {
    if (selectedOption === null || !agentResponse?.activeQuestion) return;
    setIsEvaluating(true);

    try {
      const result = await ApiService.checkAgentAnswer({
        sessionId,
        learnerId,
        questionId: agentResponse.activeQuestion.questionId || 'q_light_01',
        conceptId: 'concept_light_reaction',
        selectedOptionIndex: selectedOption,
      });

      setQuizEvaluation(result.evaluation);
      if (result.state) {
        setAgentResponse((prev) =>
          prev
            ? {
                ...prev,
                masteryScore: result.state.masteryScore,
                pedagogicalAction: result.state.pedagogicalAction,
                traces: result.state.traces,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Quiz evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRequestHint = async () => {
    if (!agentResponse?.activeQuestion) return;
    setIsLoadingHint(true);

    try {
      const res = await ApiService.getAgentHint({
        questionPrompt: agentResponse.activeQuestion.promptNative,
        options: agentResponse.activeQuestion.options,
        conceptName: selectedTopic,
        language: 'or',
        hintLevel,
      });
      setHintText(res.hintText);
      setHintLevel((prev) => (prev === 1 ? 2 : 1));
    } catch (err) {
      console.error('Hint error:', err);
    } finally {
      setIsLoadingHint(false);
    }
  };

  const handleCreateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const plan = await ApiService.createStudyPlan({
        learnerId,
        subjectId: selectedSubjectId,
        topic: selectedTopic,
        availableMinutes: planDuration,
      });
      setActivePlan(plan);
      setActiveTab('STUDY_PLAN');
    } catch (err) {
      console.error('Create plan error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleCompleteMilestone = async (stepIndex: number) => {
    if (!activePlan) return;
    try {
      const res = await ApiService.updateStudyPlan({
        planId: activePlan.id,
        completedStepIndex: stepIndex,
        learnerId,
      });
      if (res.plan) {
        setActivePlan(res.plan);
      }
    } catch (err) {
      console.error('Update milestone error:', err);
    }
  };

  // 8-stage progress tracker
  const stages: { key: AgentLearningStep; labelNative: string; labelEn: string }[] = [
    { key: 'RECEIVE_REQUEST', labelNative: '୧. ଅନୁରୋଧ ଗ୍ରହଣ', labelEn: 'Receive' },
    { key: 'ASSESS_CONTEXT', labelNative: '୨. ପରିପ୍ରେକ୍ଷୀ ଯାଞ୍ଚ', labelEn: 'Context' },
    { key: 'CREATE_PLAN', labelNative: '୩. ଯୋଜନା ନିର୍ମାଣ', labelEn: 'Plan' },
    { key: 'SELECT_TOOL', labelNative: '୪. ଟୁଲ୍ ଚୟନ', labelEn: 'Select' },
    { key: 'EXECUTE_TOOL', labelNative: '୫. ସମ୍ପାଦନ', labelEn: 'Execute' },
    { key: 'VERIFY_RESULT', labelNative: '୬. ପ୍ରମାଣୀକରଣ', labelEn: 'Verify' },
    { key: 'UPDATE_LEARNER_STATE', labelNative: '୭. ସ୍ଥିତି ନବୀକରଣ', labelEn: 'Update' },
    { key: 'RESPOND', labelNative: '୮. ପ୍ରତିକ୍ରିୟା', labelEn: 'Respond' },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === agentResponse?.currentWorkflowState);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2 px-2 sm:px-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-teal-600 transition mb-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ (Back to Dashboard)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              ଏଆଇ ଶିକ୍ଷଣ ସାଥୀ (AI Learning Companion)
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
              8-Stage Agent Engine
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {profile?.fullName || 'ସୁଭଶ୍ରୀ ମହାନ୍ତି'} • {assignedClass} • {profile?.curriculumCode || 'BSE Odisha'}
          </p>
        </div>

        {/* Live Mastery Meter */}
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 shadow-xs">
          <div className="text-right">
            <div className="text-[10px] font-semibold text-zinc-500">ପ୍ରମାଣିତ ମାଷ୍ଟ୍ରି (Mastery)</div>
            <div className="text-xl font-extrabold font-mono text-teal-600">
              {Math.round((agentResponse?.masteryScore || 0.68) * 100)}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600">
            <Brain className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Parental Restriction Alert Banner if locked */}
      {agentResponse?.isRestricted && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold">ଅଧିବେଶନ ନିୟନ୍ତ୍ରିତ (Session Restricted by Parent)</h3>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {agentResponse.restrictionReason || '୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା କାରଣରୁ ପିତାମାତାଙ୍କ ଦ୍ୱାରା ନିୟନ୍ତ୍ରଣ ଲାଗୁ ହୋଇଛି।'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('study_session')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            ଅନ୍-ଲକ୍ ଅନୁରୋଧ କରନ୍ତୁ (Request Parent Unlock)
          </button>
        </div>
      )}

      {/* 8-Stage Real-time Agent Loop Indicator */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>ଏଜେଣ୍ଟ ସ୍ଥିତି (Active Agent Loop):</span>
            <strong className="text-teal-600 font-mono">
              {agentResponse?.currentWorkflowState || 'ASSESS_CONTEXT'}
            </strong>
          </span>
          <span className="text-zinc-400 font-mono text-[11px]">
            Action: {agentResponse?.pedagogicalAction || 'INTRODUCE'}
          </span>
        </div>

        {/* 8-Stage Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {stages.map((stage, idx) => {
            const isPassed = currentStageIndex >= idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div
                key={stage.key}
                className={`p-2 rounded-xl text-center text-[10px] font-semibold transition border ${
                  isCurrent
                    ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/40'
                    : isPassed
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                    : 'bg-zinc-100 dark:bg-zinc-800/40 border-transparent text-zinc-400'
                }`}
              >
                <div className="truncate">{stage.labelNative}</div>
                <div className="text-[9px] opacity-75 font-mono">{stage.labelEn}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Subject, Topic & Depth */}
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ବିଷୟ (Subject)
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
              <option value="BSE_OD_10_LIFE_SCIENCE">BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ (Life Science)</option>
              <option value="BSE_OD_10_PHYSICAL_SCIENCE">BSE Odisha Class 10 ଭୌତିକ ବିଜ୍ଞାନ (Physical Science)</option>
              <option value="sub_prim_04_math">Class 4 ସରଳ ଗଣିତ (Primary Mathematics)</option>
              <option value="sub_comp_neet_bio">NEET Biology (High-Yield Genetics & Ecology)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              ଅଧ୍ୟୟନ ପ୍ରସଙ୍ଗ (Topic)
            </label>
            <input
              type="text"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              placeholder="e.g. ଆଲୋକ ସଂଶ୍ଳେଷଣ ଓ ଫୋଟୋଲାଇସିସ୍"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Depth Scaffolding Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>ବୁଝାମଣା ସ୍ତର (Explanation Depth):</span>
          </div>

          <div className="flex items-center gap-2">
            {[
              {
                id: 'SIMPLER',
                label: 'ସରଳ ଉଦାହରଣ (Simpler / Analogy)',
                icon: Sparkles,
                activeColor: 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300',
              },
              {
                id: 'STANDARD',
                label: 'ମାନକ ପାଠ୍ୟକ୍ରମ (Standard)',
                icon: BookOpen,
                activeColor: 'bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border-teal-300',
              },
              {
                id: 'DEEPER',
                label: 'ଗଭୀର ପରୀକ୍ଷା ଡ୍ରିଲ୍ (Exam Drill)',
                icon: Compass,
                activeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border-indigo-300',
              },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelectDepth(d.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  depthMode === d.id
                    ? d.activeColor
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                }`}
              >
                <d.icon className="w-3.5 h-3.5" />
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interaction Input Box */}
      <div className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-950/20 dark:to-zinc-900 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-300">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>ଶିକ୍ଷାର୍ଥୀଙ୍କ ପ୍ରଶ୍ନ ବା ସନ୍ଦେହ ପଚାରନ୍ତୁ (Ask Any Question to AI Agent)</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAgentQuery()}
            placeholder="ଯଥା: ଆଲୋକ ପ୍ରକ୍ରିୟାରେ ଅମ୍ଳଜାନ କେଉଁଠାରୁ ବାହାରେ? କିମ୍ବା ମୋତେ ୩ଟି ପ୍ରଶ୍ନ ଦିଅନ୍ତୁ..."
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
          <button
            disabled={isLoading || (!userQuery.trim() && !isLoading)}
            onClick={() => handleAgentQuery()}
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'ବିଚାର ଚାଲିଛି...' : 'ପଚାରନ୍ତୁ'}</span>
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400 font-semibold mr-1">ତ୍ୱରିତ ଅନୁରୋଧ:</span>
          {[
            'ଅମ୍ଳଜାନ ଜଳରୁ କି CO2 ରୁ ଆସେ?',
            'ଫୋଟୋଲାଇସିସ୍ ର ଗାଉଁଲି ଉଦାହରଣ ଦିଅନ୍ତୁ',
            '୩୦ ମିନିଟ୍ ର ପଢ଼ା ଯୋଜନା ବନାନ୍ତୁ',
            'ବୋର୍ଡ ପରୀକ୍ଷା ପ୍ରଶ୍ନ ଅଭ୍ୟାସ କରାନ୍ତୁ',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleAgentQuery(chip)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-zinc-600 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs: Explanation / Practice / Study Plan */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('EXPLANATION')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'EXPLANATION'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>ବ୍ୟାଖ୍ୟା ଓ ଧାରଣା (Explanation)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('PRACTICE');
            if (!agentResponse?.activeQuestion) {
              handleAgentQuery('ପ୍ରାକ୍ଟିସ୍ ପ୍ରଶ୍ନ ପ୍ରସ୍ତୁତ କରନ୍ତୁ');
            }
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'PRACTICE'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>ଅଭ୍ୟାସ ପ୍ରଶ୍ନ (Practice Quiz)</span>
        </button>

        <button
          onClick={() => setActiveTab('STUDY_PLAN')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'STUDY_PLAN'
              ? 'border-teal-600 text-teal-600 dark:text-teal-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          <span>ଅଧ୍ୟୟନ ଯୋଜନା (Study Plan)</span>
        </button>
      </div>

      {/* TAB 1: EXPLANATION CONTENT */}
      {activeTab === 'EXPLANATION' && (
        <div className="space-y-5">
          {isLoading ? (
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-3">
              <div className="w-8 h-8 mx-auto border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                ଏଆଇ ଏଜେଣ୍ଟ ପାଠ୍ୟକ୍ରମ ପ୍ରମାଣିତ ତଥ୍ୟ ଆଧାରରେ ବ୍ୟାଖ୍ୟା ସଂଶ୍ଳେଷଣ କରୁଛି...
              </p>
            </div>
          ) : agentResponse?.explanation ? (
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-6">
              {/* Concept Title & Summary */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    Class {gradeLevel} ପାଠ୍ୟକ୍ରମ
                  </span>
                  <span className="text-xs text-zinc-400">BSE Odisha Verified</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                  {agentResponse.explanation.title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-teal-800 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950/40 p-3 rounded-xl border border-teal-200 dark:border-teal-800/60 leading-relaxed">
                  {agentResponse.explanation.summary}
                </p>
              </div>

              {/* Detailed Explanation */}
              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {agentResponse.explanation.detailedExplanation}
              </div>

              {/* Distinct Cultural Analogy Box */}
              {agentResponse.explanation.culturalAnalogy && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-zinc-900 border border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
                    <span>ସ୍ଥାନୀୟ ଓଡ଼ିଆ ଜୀବନ ଉଦାହରଣ (Culturally Grounded Analogy)</span>
                  </div>
                  <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                    {agentResponse.explanation.culturalAnalogy.title}
                  </h4>
                  <p className="text-xs leading-relaxed font-medium">
                    {agentResponse.explanation.culturalAnalogy.analogyText}
                  </p>
                  <div className="text-[10px] text-amber-700/80 dark:text-amber-400 flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>ପ୍ରସଙ୍ଗ: {agentResponse.explanation.culturalAnalogy.sourceContext}</span>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {agentResponse.explanation.keyTakeaways && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
                  <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>ମୁଖ୍ୟ ଶିକ୍ଷଣ ବିନ୍ଦୁ (Key Takeaways):</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {agentResponse.explanation.keyTakeaways.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reflection Question */}
              {agentResponse.explanation.reflectionQuestion && (
                <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-950 dark:text-teal-200 space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>ଚିନ୍ତନ ପ୍ରଶ୍ନ (Reflection Prompt):</span>
                  </div>
                  <p className="font-medium leading-relaxed">
                    {agentResponse.explanation.reflectionQuestion}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {agentResponse?.responseText || 'ବିଷୟ ବାଛି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।'}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRACTICE QUIZ & DIAGNOSTICS */}
      {activeTab === 'PRACTICE' && (
        <div className="space-y-5">
          {agentResponse?.activeQuestion ? (
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-5">
              {/* Question Header */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 mb-1">
                  <span>ନିଦାନ ପ୍ରଶ୍ନ (Diagnostic Practice)</span>
                  <span className="text-zinc-400 font-mono text-[10px]">
                    {agentResponse.activeQuestion.difficulty || 'MEDIUM'}
                  </span>
                </div>
                <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  {agentResponse.activeQuestion.promptNative}
                </p>
                {agentResponse.activeQuestion.promptEn && (
                  <p className="text-xs text-zinc-500 mt-1">{agentResponse.activeQuestion.promptEn}</p>
                )}
                <div className="mt-2 text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>ସୂତ୍ର: {agentResponse.activeQuestion.sourceCitation || 'BSE Odisha Class 10 ଜୀବ ବିଜ୍ଞାନ, ପୃଷ୍ଠା ୪୨'}</span>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {agentResponse.activeQuestion.options.map((opt: string, idx: number) => {
                  const isSelected = selectedOption === idx;

                  return (
                    <button
                      key={opt}
                      onClick={() => !quizEvaluation && setSelectedOption(idx)}
                      disabled={quizEvaluation !== null}
                      className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between text-xs sm:text-sm cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-100 font-bold ring-1 ring-teal-600 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hint Box */}
              {hintText && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-0.5">ସୂଚନା (Progressive Hint):</strong>
                    <span>{hintText}</span>
                  </div>
                </div>
              )}

              {/* Quiz Feedback when Evaluated */}
              {quizEvaluation && (
                <div
                  className={`p-5 rounded-2xl border ${
                    quizEvaluation.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-950 dark:text-emerald-200'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 text-amber-950 dark:text-amber-200'
                  } space-y-2.5`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {quizEvaluation.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>ସଠିକ୍ ଉତ୍ତର! (Correct Answer)</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>ଭୁଲ୍ ଧାରଣା ଚିହ୍ନଟ (Misconception Detected)</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {quizEvaluation.feedbackNative}
                  </p>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-700/60 pt-2 flex items-center justify-between">
                    <span>ବ୍ୟାଖ୍ୟା: {quizEvaluation.correctExplanation}</span>
                    <span className="font-mono">{quizEvaluation.sourceCitation}</span>
                  </div>
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={handleRequestHint}
                  disabled={isLoadingHint || quizEvaluation !== null}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 transition cursor-pointer"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>{isLoadingHint ? 'ସୂଚନା ଆସୁଛି...' : 'ସୂଚନା ପାଇଁ ପଚାରନ୍ତୁ (Ask for Hint)'}</span>
                </button>

                <div className="flex items-center gap-2">
                  {!quizEvaluation ? (
                    <button
                      disabled={selectedOption === null || isEvaluating}
                      onClick={handleAnswerSubmit}
                      className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      {isEvaluating ? 'ମୂଲ୍ୟାୟନ ହେଉଛି...' : 'ଉତ୍ତର ଯାଞ୍ଚ (Submit Answer)'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAgentQuery('ଆଉ ଏକ ନୂଆ ପ୍ରଶ୍ନ ଦିଅନ୍ତୁ')}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ (Next Question)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-3">
              <Brain className="w-10 h-10 text-teal-600 mx-auto" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ଅଭ୍ୟାସ ପ୍ରଶ୍ନ ପ୍ରସ୍ତୁତ କରନ୍ତୁ
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                ଆପଣଙ୍କ ଚୟନ କରାଯାଇଥିବା ପ୍ରସଙ୍ଗ ({selectedTopic}) ରୁ ବୋର୍ଡ ପରୀକ୍ଷା ଉପଯୋଗୀ ନିଦାନ ପ୍ରଶ୍ନ ପାଇଁ କ୍ଲିକ୍ କରନ୍ତୁ।
              </p>
              <button
                onClick={() => handleAgentQuery('ମୋତେ ଏହି ବିଷୟରୁ ପ୍ରଶ୍ନ ଦିଅନ୍ତୁ')}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-sm"
              >
                ପ୍ରଶ୍ନ ଉତ୍ପନ୍ନ କରନ୍ତୁ (Generate Questions)
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STUDY PLAN & MILESTONES */}
      {activeTab === 'STUDY_PLAN' && (
        <div className="space-y-5">
          {/* Plan Creator Form */}
          <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>ବ୍ୟକ୍ତିଗତ ଅଧ୍ୟୟନ ଯୋଜନା (Personalized Study Plan)</span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  ଆପଣଙ୍କ ଉପଲବ୍ଧ ସମୟ ଅନୁଯାୟୀ ଏଆଇ ଏଜେଣ୍ଟ ପର୍ଯ୍ୟାୟକ୍ରମିକ ମାଇଲଷ୍ଟୋନ୍ ସୃଷ୍ଟି କରିବ।
                </p>
              </div>

              {/* Time Selection */}
              <div className="flex items-center gap-2">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setPlanDuration(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      planDuration === mins
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {mins} ମିନିଟ୍
                  </button>
                ))}

                <button
                  disabled={isGeneratingPlan}
                  onClick={handleCreateStudyPlan}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-extrabold text-xs transition cursor-pointer shadow-sm ml-2"
                >
                  {isGeneratingPlan ? 'ତିଆରି ଚାଲିଛି...' : 'ଯୋଜନା ସୃଷ୍ଟି (Create)'}
                </button>
              </div>
            </div>
          </div>

          {/* Active Plan Milestone Tracker */}
          {activePlan ? (
            <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {activePlan.topic}
                  </h4>
                  <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ମୋଟ ସମୟ: {activePlan.totalMinutes} ମିନିଟ୍</span>
                    <span>•</span>
                    <span>
                      ସମ୍ପନ୍ନ: {activePlan.milestones.filter((m) => m.completed).length} / {activePlan.milestones.length}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const nextIncomplete = activePlan.milestones.find((m) => !m.completed);
                    if (nextIncomplete) {
                      handleAgentQuery(`ପଦକ୍ଷେପ ${nextIncomplete.stepIndex + 1}: ${nextIncomplete.title} ଆରମ୍ଭ କରନ୍ତୁ`);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                >
                  ଅଧୁରା ପାଠ ପୁନରାରମ୍ଭ (Resume Incomplete)
                </button>
              </div>

              {/* Milestones List */}
              <div className="space-y-2.5 pt-2">
                {activePlan.milestones.map((milestone) => (
                  <div
                    key={milestone.stepIndex}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      milestone.completed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                        : milestone.stepIndex === activePlan.activeMilestoneIndex
                        ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 ring-1 ring-amber-300'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleCompleteMilestone(milestone.stepIndex)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition cursor-pointer ${
                          milestone.completed
                            ? 'bg-emerald-600 text-white'
                            : 'border-2 border-zinc-400 hover:border-teal-600'
                        }`}
                      >
                        {milestone.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div>
                        <div className="text-xs font-bold">{milestone.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{milestone.description}</div>
                        {milestone.resourceCitation && (
                          <div className="text-[10px] text-zinc-400 mt-1">{milestone.resourceCitation}</div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-bold px-2 py-1 rounded-md bg-white/80 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        {milestone.estimatedMinutes} ମିନିଟ୍
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-2">
              <p className="text-xs text-zinc-500">
                ବର୍ତ୍ତମାନ କୌଣସି ସକ୍ରିୟ ଅଧ୍ୟୟନ ଯୋଜନା ନାହିଁ। ଉପରେ ଥିବା ସମୟ ବଟନ୍ ଦବାଇ ନୂଆ ଯୋଜନା ସୃଷ୍ଟି କରନ୍ତୁ।
              </p>
            </div>
          )}
        </div>
      )}

      {/* Accessible Agent Activity Panel (Visible Observability) */}
      <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shadow-sm space-y-3">
        <button
          onClick={() => setShowAuditPanel(!showAuditPanel)}
          className="w-full flex items-center justify-between text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-teal-600" />
            <span>ପେଡାଗୋଜିକାଲ୍ ଏଜେଣ୍ଟ ଅଡିଟ୍ ଟ୍ରେସ୍ (Agent Decision Trace Transparency)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {agentResponse?.workflowEvents?.length || 0} Events
            </span>
          </div>
          {showAuditPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAuditPanel && (
          <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              ଭାରତଲର୍ଣ୍ଣ ଏଆଇ ଏଜେଣ୍ଟ କୌଣସି ଅପ୍ରମାଣିତ ଉତ୍ତର ପ୍ରଦାନ କରେ ନାହିଁ। ପ୍ରତ୍ୟେକ ନିଷ୍ପତ୍ତି ପର୍ଯ୍ୟବେକ୍ଷଣକ୍ଷମ (observable) ଏବଂ ବୋର୍ଡ ପାଠ୍ୟକ୍ରମ ସହିତ ଯାଞ୍ଚ ହୋଇଥାଏ:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {(agentResponse?.workflowEvents || []).map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{ev.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        {ev.state}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{ev.details}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-zinc-400">
                      {ev.durationMs ? `${ev.durationMs}ms` : 'verified'}
                    </span>
                    <span className="block text-[9px] font-semibold text-emerald-600">
                      {ev.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
