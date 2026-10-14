/**
 * Reusable Subject / Course Card Component
 */

import { BookOpen, CheckCircle2, Download, ArrowRight } from 'lucide-react';
import type { CurriculumSubject } from '../types';
import { LinearProgress } from './ProgressIndicator';

interface SubjectCardProps {
  subject: CurriculumSubject;
  onOpenSubject: (subject: CurriculumSubject) => void;
  onToggleOffline?: (subjectId: string) => void;
}

export function SubjectCard({ subject, onOpenSubject, onToggleOffline }: SubjectCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{subject.curriculumCode}</span>
            <span aria-hidden="true">·</span>
            <span>{subject.totalChapters} ଟି ଅଧ୍ୟାୟ</span>
          </div>

          {subject.isDownloadedOffline ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ଅଫଲାଇନ୍ ପ୍ରସ୍ତୁତ
            </span>
          ) : (
            onToggleOffline && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleOffline(subject.id);
                }}
                className="text-zinc-400 hover:text-teal-600 transition p-1"
                title="ଅଫଲାଇନ୍ ପ୍ୟାକ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ"
              >
                <Download className="w-4 h-4" />
              </button>
            )
          )}
        </div>

        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {subject.titleNative}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {subject.titleEnglish}
        </p>

        {/* Progress Bar */}
        <div className="mt-4">
          <LinearProgress
            percentage={subject.masteryPercentage}
            label="ଦକ୍ଷତା ଅଗ୍ରଗତି"
            sublabel={`${subject.completedChapters}/${subject.totalChapters} ଅଧ୍ୟାୟ`}
            color={subject.masteryPercentage >= 70 ? 'emerald' : subject.masteryPercentage >= 40 ? 'teal' : 'amber'}
            size="sm"
          />
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {subject.chapters[0]?.titleNative || 'ପ୍ରଥମ ଅଧ୍ୟାୟ ପ୍ରସ୍ତୁତ'}
        </span>

        <button
          onClick={() => onOpenSubject(subject)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-xs font-semibold transition"
        >
          <span>ଅଧ୍ୟୟନ କରନ୍ତୁ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
