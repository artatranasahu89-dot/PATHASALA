/**
 * Page 3: Learner Category Selection Page
 * Allows exploring and switching between all 8 supported learner cohorts across India.
 */

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles, Filter } from 'lucide-react';
import type { AppPage, LearnerCategoryId } from '../types';
import { ALL_LEARNER_CATEGORIES } from '../services/registryData';
import { CategoryCard } from '../components/CategoryCard';

interface CategorySelectPageProps {
  activeCategory: LearnerCategoryId;
  onSelectCategory: (category: LearnerCategoryId) => void;
  onNavigate: (page: AppPage) => void;
}

export function CategorySelectPage({
  activeCategory,
  onSelectCategory,
  onNavigate,
}: CategorySelectPageProps) {
  const [filter, setFilter] = useState<'ALL' | 'SCHOOL' | 'HIGHER_COMPETITIVE' | 'SKILLS_ADULT'>('ALL');

  const filteredCategories = ALL_LEARNER_CATEGORIES.filter((cat) => {
    if (filter === 'SCHOOL') return ['PRIMARY', 'MIDDLE', 'SECONDARY', 'SENIOR_SECONDARY'].includes(cat.id);
    if (filter === 'HIGHER_COMPETITIVE') return ['HIGHER_ED', 'COMPETITIVE_EXAMS'].includes(cat.id);
    if (filter === 'SKILLS_ADULT') return ['VOCATIONAL', 'ADULT_EDUCATION'].includes(cat.id);
    return true;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-teal-600 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ଡ୍ୟାସବୋର୍ଡକୁ ଫେରନ୍ତୁ (Back to Dashboard)</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            ଶିକ୍ଷାର୍ଥୀ ବର୍ଗ ଚୟନ (Select Learner Cohort)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            BharatLearn AI adapts its curriculum standards, vocabulary, and explanation difficulty to your exact educational stage.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <span>ନିଶ୍ଚିତ କରନ୍ତୁ (Confirm Category)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl w-fit">
        {[
          { id: 'ALL', label: 'ସମସ୍ତ ବର୍ଗ (All 8)' },
          { id: 'SCHOOL', label: 'ବିଦ୍ୟାଳୟ ଶିକ୍ଷା (Classes 1–12)' },
          { id: 'HIGHER_COMPETITIVE', label: 'କଲେଜ୍ ଓ ପ୍ରତିଯୋଗିତା (Higher & Competitive)' },
          { id: 'SKILLS_ADULT', label: 'ବୃତ୍ତିଗତ ଓ ପ୍ରୌଢ଼ ଶିକ୍ଷା (Skills & Adult)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as typeof filter)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === tab.id
                ? 'bg-white dark:bg-zinc-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={activeCategory === category.id}
            onSelect={(id) => {
              onSelectCategory(id);
            }}
          />
        ))}
      </div>

      {/* Information Banner */}
      <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900 dark:text-teal-200 leading-relaxed">
          <strong>ସ୍ମାର୍ଟ ଅନୁକୂଳନ (Dynamic Adaptation):</strong> ଯେକୌଣସି ସମୟରେ ଆପଣ ବର୍ଗ ବଦଳାଇ ପାରିବେ। ଉଦାହରଣ ସ୍ଵରୂପ, ଦଶମ ଶ୍ରେଣୀ ବୋର୍ଡ ପରୀକ୍ଷା ଶେଷ ହେବା ପରେ ଆପଣ ଉଚ୍ଚ ମାଧ୍ୟମିକ କିମ୍ବା NEET/JEE ପ୍ରସ୍ତୁତି ବର୍ଗକୁ ଯାଇପାରିବେ।
        </div>
      </div>
    </div>
  );
}
