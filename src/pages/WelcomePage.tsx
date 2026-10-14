/**
 * Page 1: Welcome / Landing Page
 * Introduces BharatLearn AI, the 8 learner cohorts, and 22 languages.
 */

import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Globe,
  Layers,
  ShieldCheck,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import type { AppPage, LearnerCategoryId } from '../types';
import { ALL_LEARNER_CATEGORIES } from '../services/registryData';

interface WelcomePageProps {
  onNavigate: (page: AppPage) => void;
  onSelectCategory: (category: LearnerCategoryId) => void;
}

export function WelcomePage({ onNavigate, onSelectCategory }: WelcomePageProps) {
  return (
    <div className="space-y-12 py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 via-teal-800 to-zinc-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 text-amber-300 text-xs font-semibold mb-4 border border-teal-600/40">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NIRMIT · NEXTECH 2.0 Agentic AI Hackathon</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ଭାରତର ପ୍ରତ୍ୟେକ ଶିକ୍ଷାର୍ଥୀଙ୍କ ପାଇଁ ଏଜେଣ୍ଟିକ୍ ଶିକ୍ଷା।
          </h1>
          <p className="mt-2 text-xl sm:text-2xl font-semibold text-teal-200">
            Agentic, Adaptive & Multilingual Learning Across India.
          </p>

          <p className="mt-4 text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl">
            ଭାରତଲର୍ଣ୍ଣ ଏଆଇ କେବଳ ଏକ ଚାଟ୍‌ବଟ୍ ନୁହେଁ। ଏହା ଏକ ସ୍ଵୟଂଚାଳିତ ଶିକ୍ଷଣ ଏଜେଣ୍ଟ ଯାହା ତୁମର ମୂଳ ଦୁର୍ବଳତା ନିରୂପଣ କରେ, ସ୍ଥାନୀୟ ଓଡ଼ିଆ ଉଦାହରଣ ମାଧ୍ୟମରେ ବୁଝାଏ ଏବଂ ବିନା ଇଣ୍ଟରନେଟରେ ଅଭ୍ୟାସ ସୁଯୋଗ ଦିଏ।
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('onboarding')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>ଆରମ୍ଭ କରନ୍ତୁ (Start Guided Setup)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onSelectCategory('SECONDARY');
                onNavigate('dashboard');
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition cursor-pointer"
            >
              <span>ଦଶମ ଶ୍ରେଣୀ ପାଇଲଟ୍ ଡ୍ୟାସବୋର୍ଡ (Class 10 Demo)</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-teal-200/90">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              BSE Odisha & NCERT Grounded
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-teal-300" />
              22 Scheduled Languages
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <WifiOff className="w-4 h-4 text-amber-300" />
              Offline PWA Ready
            </span>
          </div>
        </div>

        {/* Ambient background accent */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 3 Core Value Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold mb-4">
            <Brain className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            ନିଦାନ ଭିତ୍ତିକ ଶିକ୍ଷଣ (Diagnostic Mastery)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            କେବଳ ଉତ୍ତର ମନେରଖିବା ନୁହେଁ। ଏଜେଣ୍ଟ ଛାତ୍ରଛାତ୍ରୀଙ୍କ ଭ୍ରମ ଧାରଣା (misconceptions) କୁ ଚିହ୍ନଟ କରି ତଳ ସ୍ତରରୁ ବୁଝାଇଥାଏ।
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold mb-4">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            ସ୍ଥାନୀୟ ଭାଷା ଓ ସଂସ୍କୃତି (Regional Grounding)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            ଚିଲିକା ହ୍ରଦ, ଓଡ଼ିଶାର କୃଷି ଓ ଦୈନନ୍ଦିନ ଉଦାହରଣ ସହିତ ବିଜ୍ଞାନ ପାଠ୍ୟକ୍ରମ ବୁଝାଯାଏ। ୪-ସ୍ତରୀୟ ଭାଷା ଚୟନ ସୁବିଧା।
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold mb-4">
            <WifiOff className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            ଅଫଲାଇନ୍ ସ୍ଥିତିସ୍ଥାପକତା (Offline Resilience)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            ଗ୍ରାମାଞ୍ଚଳର ମୋବାଇଲ୍ ଡାଟା ସମସ୍ୟା ପାଇଁ ଅଧ୍ୟାୟ ପ୍ୟାକ୍ ଡାଉନଲୋଡ୍ କରି ବିନା ନେଟ୍‌ରେ ପରୀକ୍ଷା ଦିଅନ୍ତୁ।
          </p>
        </div>
      </section>

      {/* 8 Learner Categories Overview */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              ୮ ଟି ଶିକ୍ଷାର୍ଥୀ ବର୍ଗ (8 Supported Learner Cohorts)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select your educational category to personalize your curriculum and companion.
            </p>
          </div>
          <button
            onClick={() => onNavigate('category_select')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
          >
            <span>ସମସ୍ତ ବର୍ଗ ଦେଖନ୍ତୁ (View All Categories)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_LEARNER_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onNavigate('dashboard');
              }}
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-teal-500 hover:shadow-md transition text-left cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 mb-1">
                  {cat.gradeSpan}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {cat.titleNative}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {cat.titleEnglish}
                </p>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                  {cat.descriptionNative}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-teal-600 font-semibold">
                <span>ଅଧ୍ୟୟନ ଆରମ୍ଭ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
