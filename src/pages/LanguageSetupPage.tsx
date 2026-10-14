/**
 * Page 4: Language Selection Page
 * 22 Scheduled Indian Languages Registry & 4-Axis Configuration.
 */

import { useState } from 'react';
import { ArrowLeft, Check, Globe, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { AppPage, LanguageDimensionConfig, IndianLanguageCode } from '../types';
import { ALL_SCHEDULED_LANGUAGES } from '../services/registryData';

interface LanguageSetupPageProps {
  languages: LanguageDimensionConfig;
  onUpdateAxis: (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => void;
  onNavigate: (page: AppPage) => void;
}

export function LanguageSetupPage({
  languages,
  onUpdateAxis,
  onNavigate,
}: LanguageSetupPageProps) {
  const [activeTab, setActiveTab] = useState<keyof LanguageDimensionConfig>('explanationLanguage');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = ALL_SCHEDULED_LANGUAGES.filter(
    (lang) =>
      lang.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nameNative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
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
            ଭାଷା ବିନ୍ୟାସ ଓ ରେଜିଷ୍ଟ୍ରି (Language Architecture)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Configure all 4 independent language axes across India's 22 constitutionally scheduled languages.
          </p>
        </div>

        <button
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <span>ସଂରକ୍ଷଣ କରନ୍ତୁ (Save Settings)</span>
        </button>
      </div>

      {/* Axis Selector Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            key: 'explanationLanguage' as const,
            title: 'ବୁଝାଇବା ଭାଷା (Explanation)',
            desc: 'Used by the agent for analogies & teaching',
          },
          {
            key: 'uiLanguage' as const,
            title: 'ଇଣ୍ଟରଫେସ୍ (UI Language)',
            desc: 'Navigation, headers, and buttons',
          },
          {
            key: 'instructionalLanguage' as const,
            title: 'ପାଠ୍ୟପୁସ୍ତକ (Instructional)',
            desc: 'Original textbook/syllabus language',
          },
          {
            key: 'assessmentLanguage' as const,
            title: 'ପ୍ରଶ୍ନୋତ୍ତର (Assessment)',
            desc: 'Quiz questions & evaluation rubric',
          },
        ].map((axis) => {
          const isActive = activeTab === axis.key;
          const currentCode = languages[axis.key];
          const matched = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === currentCode);

          return (
            <div
              key={axis.key}
              onClick={() => setActiveTab(axis.key)}
              className={`p-4 rounded-2xl border text-left cursor-pointer transition ${
                isActive
                  ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 ring-1 ring-teal-600 shadow-sm'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
              }`}
            >
              <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {axis.title}
              </div>
              <div className="text-base font-bold text-teal-700 dark:text-teal-300 mt-1">
                {matched?.nameNative} ({matched?.nameEnglish})
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                {axis.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="୨୨ଟି ଭାଷା ମଧ୍ୟରୁ ଖୋଜନ୍ତୁ (Search among 22 languages: Odia, Hindi, Bengali, Tamil, etc.)..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {/* Language Matrix List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredLanguages.map((lang) => {
          const isSelected = languages[activeTab] === lang.code;

          return (
            <div
              key={lang.code}
              onClick={() => onUpdateAxis(activeTab, lang.code)}
              className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/30 ring-1 ring-teal-600 shadow-xs'
                  : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    lang.isPilot
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {lang.code.toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {lang.nameNative}
                    </h3>
                    <span className="text-xs text-zinc-500">({lang.nameEnglish})</span>
                    {lang.isPilot && (
                      <span className="text-[10px] font-bold px-2 py-0.2 bg-teal-600 text-white rounded-full">
                        ପାଇଲଟ୍
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {lang.script} · Tier {lang.tier} Support
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                    {lang.supportDetails}
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-1 transition ${
                  isSelected
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : 'border-zinc-300 dark:border-zinc-700 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest Capability Notice */}
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>ସତ୍ୟନିଷ୍ଠ ଭାଷା ପ୍ରତିଶ୍ରୁତି (Honest Language Capability Policy)</span>
        </div>
        <p className="leading-relaxed">
          ଭାରତଲର୍ଣ୍ଣ ଏଆଇ କୌଣସି ଭାଷା ପାଇଁ ଅପରୀକ୍ଷିତ ଏଆଇ ବା ସ୍ପିଚ୍ ସୁବିଧା ଦାବି କରେ ନାହିଁ। Tier 1 ଭାଷାଗୁଡ଼ିକ (ଯେପରି ଓଡ଼ିଆ ପାଇଲଟ୍) ସମ୍ପୂର୍ଣ୍ଣ ପରୀକ୍ଷିତ। Tier 2 ଓ Tier 3 ଭାଷାଗୁଡ଼ିକରେ ସ୍ଥାନୀୟ ଶବ୍ଦକୋଷ ଓ ଟେକ୍ସଟ୍ ପ୍ରଥମେ ଉପଲବ୍ଧ କରାଯାଇଛି।
        </p>
      </div>
    </div>
  );
}
