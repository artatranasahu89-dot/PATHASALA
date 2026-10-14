/**
 * Page 6: Student Dashboard Page
 * Personalized to the active learner category and language configuration.
 */

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Download,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Target,
  Clock,
  Layers,
} from 'lucide-react';
import type { AppPage, LearnerProfile, CurriculumSubject, CurriculumChapter } from '../types';
import { ApiService } from '../services/api';
import { ALL_LEARNER_CATEGORIES } from '../services/registryData';
import { LinearProgress } from '../components/ProgressIndicator';

interface StudentDashboardPageProps {
  profile: LearnerProfile | null;
  onNavigate: (page: AppPage) => void;
  onSelectSubject?: (subject: CurriculumSubject) => void;
}

export function StudentDashboardPage({
  profile,
  onNavigate,
  onSelectSubject,
}: StudentDashboardPageProps) {
  const [subjects, setSubjects] = useState<CurriculumSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<CurriculumSubject | null>(null);

  const categoryId = profile?.category || 'SECONDARY';
  const categoryMeta = ALL_LEARNER_CATEGORIES.find((c) => c.id === categoryId) || ALL_LEARNER_CATEGORIES[2];

  useEffect(() => {
    async function load() {
      const data = await ApiService.getSubjects(categoryId);
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0]);
      }
    }
    load();
  }, [categoryId]);

  const activeGoals = profile?.goals || [];
  const completedGoalsCount = activeGoals.filter((g) => g.completed).length;

  return (
    <div className="space-y-8 py-2">
      {/* Category-Adaptive Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-zinc-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-amber-300 text-xs font-semibold border border-teal-600/40">
              <Sparkles className="w-3 h-3" />
              <span>{categoryMeta.titleNative}</span>
            </span>
            <span className="text-xs text-teal-200">
              {profile?.schoolName || 'ସରକାରୀ ଉଚ୍ଚ ବିଦ୍ୟାଳୟ, କଟକ'} · {profile?.curriculumCode}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ନମସ୍କାର, {profile?.fullName || 'ସୁଭଶ୍ରୀ ମହାନ୍ତି'}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-2xl">
            {categoryMeta.descriptionNative}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('study_session')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>ଧ୍ୟାନ ଅଧ୍ୟୟନ ଆରମ୍ଭ (Start Focus Study)</span>
            </button>

            <button
              onClick={() => onNavigate('companion')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs border border-teal-500/40 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ଏଆଇ ସାଥୀ (Companion)</span>
            </button>

            <button
              onClick={() => onNavigate('parent_dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition cursor-pointer"
            >
              <span>ଅଭିଭାବକ ପୋର୍ଟାଲ (Parent Portal)</span>
            </button>
          </div>
        </div>

        {/* Ambient accent */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Goal Summary Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">ଲକ୍ଷ୍ୟ ଅଗ୍ରଗତି (Goals)</div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                {completedGoalsCount} / {activeGoals.length} ସମ୍ପନ୍ନ
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('goals_setup')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
          >
            ସମ୍ପାଦନ
          </button>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">ଦୈନନ୍ଦିନ ଅଭ୍ୟାସ (Daily Target)</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
              30 ମିନିଟ୍ / ଦିନ
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">ପାଠ୍ୟକ୍ରମ ସୂତ୍ର (Curriculum)</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {profile?.curriculumCode} ମାନ୍ୟତା
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Subjects & Chapter Explorer */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Enrolled Subjects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>ଅଧ୍ୟୟନ ବିଷୟସମୂହ (Enrolled Subjects)</span>
            </h2>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer"
            >
              ସମସ୍ତ ବିଷୟ ({subjects.length})
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((sub) => {
              const isSelected = selectedSubject?.id === sub.id;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`p-5 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 ring-1 ring-teal-600 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {sub.titleNative.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                            {sub.titleNative}
                          </h3>
                          {sub.isDownloadedOffline && (
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.2 rounded-full">
                              ଅଫଲାଇନ୍ ଉପଲବ୍ଧ
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {sub.titleEnglish} · {sub.totalChapters} ଟି ଅଧ୍ୟାୟ
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 transition shrink-0 ${
                        isSelected ? 'text-teal-600 translate-x-0.5' : 'text-zinc-400'
                      }`}
                    />
                  </div>

                  <div className="mt-4">
                    <LinearProgress
                      percentage={sub.masteryPercentage}
                      label="ଦକ୍ଷତା ସ୍ତର"
                      sublabel={`${sub.completedChapters}/${sub.totalChapters} ଅଧ୍ୟାୟ`}
                      size="sm"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapters in Selected Subject */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              <span>ଅଧ୍ୟାୟ ତାଲିକା (Chapters)</span>
            </h2>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
              ବିଷୟ: <strong className="text-teal-600">{selectedSubject?.titleNative}</strong>
            </div>

            <div className="space-y-2.5">
              {selectedSubject?.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {idx + 1}. {ch.titleNative}
                    </span>
                    {ch.isDownloadedOffline && (
                      <span className="text-[10px] text-emerald-600 font-semibold shrink-0">
                        ସଂରକ୍ଷିତ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {ch.summaryNative}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigate('companion')}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>ପ୍ରଥମ ପ୍ରସଙ୍ଗ ଅଧ୍ୟୟନ ଆରମ୍ଭ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
