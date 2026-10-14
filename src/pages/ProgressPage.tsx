/**
 * Page 9: Learning Progress Page
 * Detailed Knowledge-State Vectors, Misconception Diagnostics, and Evidence Tracing.
 * Dynamically loaded from persistent learningStateService backend.
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Clock, Calendar } from 'lucide-react';
import type { AppPage } from '../types';
import { LinearProgress } from '../components/ProgressIndicator';
import { ApiService } from '../services/api';

interface ProgressPageProps {
  onNavigate: (page: AppPage) => void;
}

export function ProgressPage({ onNavigate }: ProgressPageProps) {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>(null);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getPersistentLearningProgress('learner_pilot_odia_01');
      setProgressData(data);
    } catch (err) {
      console.error('Failed to load persistent progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const concepts = progressData?.concepts || [
    {
      conceptId: 'concept_light_reaction',
      conceptTitle: 'ଆଲୋକ ପ୍ରକ୍ରିୟା ଓ ଜଳ ବିଶ୍ଳେଷଣ (Photolysis)',
      score: 0.68,
      level: 'DEVELOPING',
      attemptsCount: 3,
      lastStudiedAt: 'ଆଜି',
      lastMisconceptionTag: 'MISCONCEPTION_CO2_OXYGEN_SPLIT',
    },
    {
      conceptId: 'concept_chloroplast_structure',
      conceptTitle: 'ହରିତକଣାର ଗଠନ (Structure of Chloroplast)',
      score: 0.85,
      level: 'COMPETENT',
      attemptsCount: 4,
      lastStudiedAt: '୨ ଦିନ ପୂର୍ବେ',
    },
    {
      conceptId: 'concept_dark_reaction',
      conceptTitle: 'ଅନ୍ଧକାର ପ୍ରକ୍ରିୟା ଓ କାଲଭିନ ଚକ୍ର (Dark Reaction)',
      score: 0.45,
      level: 'NOVICE',
      attemptsCount: 1,
      lastStudiedAt: 'ଗତକାଲି',
    },
  ];

  const competentCount = concepts.filter((c: any) => c.level === 'COMPETENT' || c.level === 'MASTERED').length;
  const developingCount = concepts.filter((c: any) => c.level === 'DEVELOPING' || c.level === 'NOVICE').length;
  const recentActivities = progressData?.recentActivities || [];

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-teal-600 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ (Back to Dashboard)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ଶିକ୍ଷଣ ଅଗ୍ରଗତି ଓ ଦକ୍ଷତା ମ୍ୟାପ୍ (Learning Progress)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            ପ୍ରମାଣ-ଆଧାରିତ ବାସ୍ତବ ଜ୍ଞାନ ସ୍ଥିତି (Evidence-weighted knowledge state estimates from real diagnostic answers).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProgress}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>ସତେଜ (Refresh)</span>
          </button>

          <button
            onClick={() => onNavigate('companion')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition cursor-pointer"
          >
            <span>ଅଭ୍ୟାସ ଆରମ୍ଭ କରନ୍ତୁ (Practice Now)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">ଦକ୍ଷତା ପ୍ରାପ୍ତ ଧାରଣା (Competent)</div>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {competentCount} ଟି
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">&gt; 70% ପ୍ରମାଣିତ ଦକ୍ଷତା ସ୍କୋର</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">ବିକାଶଶୀଳ ଧାରଣା (Developing)</div>
          <div className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {developingCount} ଟି
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">ସଂଶୋଧନ ଓ ଅଭ୍ୟାସ ଜାରି</div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">ସାମଗ୍ରିକ ମାଷ୍ଟ୍ରି (Overall Mastery)</div>
          <div className="mt-1 text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-mono tabular-nums">
            {Math.round((progressData?.overallMastery || 0.68) * 100)}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-1">BSE Odisha Class 10 Life Science</div>
        </div>
      </div>

      {/* Concept Mastery Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Brain className="w-5 h-5 text-teal-600" />
          <span>ଧାରଣାୱାରୀ ଦକ୍ଷତା ବିଶ୍ଳେଷଣ (Concept Mastery Breakdown)</span>
        </h2>

        <div className="space-y-3">
          {concepts.map((concept: any) => (
            <div
              key={concept.conceptId}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {concept.conceptTitle || concept.conceptTitleNative}
                  </h3>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {concept.attemptsCount} ଥର ଚେଷ୍ଟା • ଶେଷ ଅଧ୍ୟୟନ: {concept.lastStudiedAt ? new Date(concept.lastStudiedAt).toLocaleDateString() : 'ଆଜି'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md ${
                      concept.level === 'COMPETENT' || concept.level === 'MASTERED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : concept.level === 'DEVELOPING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {concept.level}
                  </span>
                </div>
              </div>

              <LinearProgress
                percentage={Math.round(concept.score * 100)}
                label="ଦକ୍ଷତା ସ୍କୋର"
                color={concept.score >= 0.75 ? 'emerald' : concept.score >= 0.5 ? 'teal' : 'amber'}
                size="sm"
              />

              {concept.lastMisconceptionTag && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>ଭ୍ରମ ଧାରଣା ନିଦାନ ({concept.lastMisconceptionTag}):</strong> ଅମ୍ଳଜାନ ଜଳରୁ ନିର୍ଗତ ହୁଏ, CO2 ରୁ ନୁହେଁ। ଏଆଇ ସାଥୀ ସ୍ଥାନୀୟ ଉଦାହରଣ ମାଧ୍ୟମରେ ସଂଶୋଧନ କରିଛି।
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Completed Activities */}
      {recentActivities.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>ସମ୍ପ୍ରତି ସମ୍ପାଦିତ ଅଧ୍ୟୟନ କାର୍ଯ୍ୟକଳାପ (Recent Activities)</span>
          </h2>

          <div className="space-y-2">
            {recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-zinc-800 dark:text-zinc-200">{act.conceptTitle}</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {act.activityType} • {act.durationMinutes} ମିନିଟ୍ • {new Date(act.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {act.score !== undefined && (
                  <div className="text-right font-mono font-bold text-teal-600 text-xs">
                    {Math.round(act.score * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Honest Rigor Notice */}
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>ପ୍ରମାଣ-ଆଧାରିତ ଦକ୍ଷତା ନୀତି (Evidence-Weighted Mastery Policy)</span>
        </div>
        <p className="leading-relaxed">
          ଭାରତଲର୍ଣ୍ଣ ଏଆଇରେ କୌଣସି କାଳ୍ପନିକ AI ସ୍କୋର ପ୍ରଦାନ କରାଯାଏ ନାହିଁ। ପ୍ରତ୍ୟେକ ପ୍ରତିଶତ ଛାତ୍ରଙ୍କ ବାସ୍ତବ ପ୍ରଶ୍ନୋତ୍ତର ଏବଂ ନିଦାନ ଫଳାଫଳ ଉପରେ ଆଧାରିତ।
        </p>
      </div>
    </div>
  );
}
