/**
 * Learner Category Selection Card Component
 */

import { Check, Sparkles, BookOpen, Brain, Layers, GraduationCap, Target, Wrench, HeartHandshake } from 'lucide-react';
import type { LearnerCategoryMeta } from '../types';

interface CategoryCardProps {
  category: LearnerCategoryMeta;
  isSelected: boolean;
  onSelect: (id: LearnerCategoryMeta['id']) => void;
}

const ICON_MAP = {
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  GraduationCap,
  Target,
  Wrench,
  HeartHandshake,
};

export function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const IconComponent = ICON_MAP[category.iconName as keyof typeof ICON_MAP] || BookOpen;

  return (
    <div
      onClick={() => onSelect(category.id)}
      className={`group relative p-5 rounded-2xl border transition text-left cursor-pointer ${
        isSelected
          ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/30 ring-1 ring-teal-600 shadow-sm'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition ${
              isSelected
                ? 'bg-teal-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/40 group-hover:text-teal-700'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {category.titleNative}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {category.titleEnglish} · {category.gradeSpan}
            </p>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition ${
            isSelected
              ? 'border-teal-600 bg-teal-600 text-white'
              : 'border-zinc-300 dark:border-zinc-700 text-transparent'
          }`}
          aria-hidden="true"
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
        {category.descriptionNative}
      </p>

      {/* Available Boards & Focus Area */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">ବୋର୍ଡ:</span>
        {category.availableBoards.map((board, i) => (
          <span key={board}>
            {board}
            {i < category.availableBoards.length - 1 && <span className="mx-1 opacity-40">/</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
