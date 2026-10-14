/**
 * BharatLearn AI — 4-Axis Multilingual Configuration & Registry Selector Component
 * Comprehensive support for all 22 Scheduled Indian Languages + English
 * Features: Search, Native Name Recognition, RTL Indicators, Interface Preview,
 * Sample Concept Explanation, and Preference Persistence.
 */

import { useState, useMemo } from 'react';
import {
  Globe,
  Check,
  X,
  Search,
  ShieldCheck,
  Sparkles,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { LanguageDimensionConfig, IndianLanguageCode, IndianLanguageMeta } from '../types';
import { ALL_SCHEDULED_LANGUAGES } from '../services/registryData';
import { applyDocumentDirection, t } from '../services/i18n';

interface LanguageSelectorProps {
  config: LanguageDimensionConfig;
  onUpdateAxis: (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
}

export function LanguageSelector({
  config,
  onUpdateAxis,
  isOpenExternal,
  onCloseExternal,
}: LanguageSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof LanguageDimensionConfig>('explanationLanguage');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewLangCode, setPreviewLangCode] = useState<IndianLanguageCode>(config.explanationLanguage);

  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onCloseExternal && !open) {
      onCloseExternal();
    }
    setInternalOpen(open);
  };

  const tabs: { key: keyof LanguageDimensionConfig; label: string; desc: string }[] = [
    {
      key: 'explanationLanguage',
      label: 'ବୁଝାଇବା ଭାଷା (Explanation)',
      desc: 'ଭାବ ଓ ଉଦାହରଣ ବୁଝାଇବା ପାଇଁ ଏଆଇ ବ୍ୟବହାର କରୁଥିବା ଭାଷା (Conceptual Scaffolding)',
    },
    {
      key: 'uiLanguage',
      label: 'ଇଣ୍ଟରଫେସ୍ (UI)',
      desc: 'ଆପ୍ ନେଭିଗେସନ୍, ମେନୁ ଓ ବଟନଗୁଡ଼ିକର ଭାଷା (Application Shell)',
    },
    {
      key: 'instructionalLanguage',
      label: 'ପାଠ୍ୟପୁସ୍ତକ (Instructional)',
      desc: 'ଅଫିସିଆଲ୍ ବୋର୍ଡ ସିଲାବସ୍ ପାଠ୍ୟପୁସ୍ତକର ମୂଳ ଭାଷା (Curriculum Medium)',
    },
    {
      key: 'assessmentLanguage',
      label: 'ପ୍ରଶ୍ନୋତ୍ତର (Assessment)',
      desc: 'ପରୀକ୍ଷା, ପ୍ରଶ୍ନ ଓ ମୂଲ୍ୟାଙ୍କନ ଭାଷା (Questions & Evaluation)',
    },
  ];

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ALL_SCHEDULED_LANGUAGES;
    const q = searchQuery.toLowerCase();
    return ALL_SCHEDULED_LANGUAGES.filter(
      (lang) =>
        lang.nameEnglish.toLowerCase().includes(q) ||
        lang.nameNative.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.script.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeLangMeta = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === config[activeTab]);
  const previewLangMeta = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === previewLangCode) || activeLangMeta || ALL_SCHEDULED_LANGUAGES[0];

  const handleSelectLanguage = (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => {
    onUpdateAxis(axis, code);
    setPreviewLangCode(code);
    if (axis === 'uiLanguage') {
      applyDocumentDirection(code);
    }
  };

  return (
    <div className="relative">
      {isOpenExternal === undefined && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/40 transition cursor-pointer"
          title="୨୨ଟି ଭାରତୀୟ ଭାଷା ବିନ୍ୟାସ (Configure 22 Indian Languages)"
        >
          <Globe className="w-4 h-4 text-teal-600 shrink-0" />
          <span className="font-semibold">{activeLangMeta?.nameNative || 'ଓଡ଼ିଆ'}</span>
          <span className="hidden sm:inline text-[11px] text-teal-600 dark:text-teal-400">
            (4-Axis)
          </span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-tight">
                    ୨୨ଟି ସମ୍ବିଧାନ ସ୍ଵୀକୃତ ଭାରତୀୟ ଭାଷା (22 Scheduled Languages)
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    4-Axis Decoupled Language Architecture & Real-Time Preview
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Axis Selector Tabs */}
            <div className="flex overflow-x-auto border-b border-zinc-200 dark:border-zinc-800 p-2 gap-1.5 bg-zinc-100/50 dark:bg-zinc-900/50 shrink-0">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const currentCode = config[tab.key];
                const matchedLang = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === currentCode);

                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      setPreviewLangCode(currentCode);
                    }}
                    className={`flex-1 min-w-[140px] text-left p-2.5 rounded-xl text-xs transition cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-300 font-semibold shadow-xs border border-teal-200 dark:border-teal-700 ring-1 ring-teal-500/20'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <div className="truncate font-semibold">{tab.label.split(' ')[0]}</div>
                    <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium truncate mt-0.5">
                      {matchedLang?.nameNative} ({matchedLang?.code.toUpperCase()})
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search Bar & Axis Description */}
            <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border-b border-teal-100 dark:border-teal-900/50 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs text-teal-900 dark:text-teal-300">
                <p>{tabs.find((t) => t.key === activeTab)?.desc}</p>
                <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">
                  Total: {ALL_SCHEDULED_LANGUAGES.length} Languages
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ଭାଷା ଖୋଜନ୍ତୁ (Search by name or code e.g. Odia, Bengali, Urdu, Hindi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Main Body: Language List + Interactive Live Preview */}
            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              {/* Language Options List */}
              <div className="md:col-span-7 p-3 overflow-y-auto space-y-2 border-r border-zinc-200 dark:border-zinc-800 max-h-[50vh] md:max-h-[60vh]">
                {filteredLanguages.map((lang) => {
                  const isSelected = config[activeTab] === lang.code;
                  const isPreviewing = previewLangCode === lang.code;

                  return (
                    <div
                      key={lang.code}
                      onClick={() => handleSelectLanguage(activeTab, lang.code)}
                      onMouseEnter={() => setPreviewLangCode(lang.code)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/80 dark:bg-teal-950/40 ring-1 ring-teal-600'
                          : isPreviewing
                          ? 'border-teal-300 dark:border-teal-800 bg-zinc-50 dark:bg-zinc-800/60'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            lang.isPilot
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                              : lang.direction === 'rtl'
                              ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {lang.code.toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 flex-wrap">
                            <span dir={lang.direction}>{lang.nameNative}</span>
                            <span className="text-xs font-normal text-zinc-500">
                              ({lang.nameEnglish})
                            </span>
                            {lang.isPilot && (
                              <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                Verified Pilot
                              </span>
                            )}
                            {lang.direction === 'rtl' && (
                              <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.2 rounded-full font-bold">
                                RTL Script
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                            {lang.script} · {lang.locale}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                          Tier {lang.tier}
                        </span>
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Panel: Live Preview of Interface & Sample Concept Explanation */}
              <div className="md:col-span-5 p-4 bg-zinc-50/70 dark:bg-zinc-950/40 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[60vh] space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      ଲାଇଭ୍ ପ୍ରଦର୍ଶନ (Live Preview)
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {previewLangMeta.nameEnglish} ({previewLangMeta.code})
                    </span>
                  </div>

                  {/* UI Preview Card */}
                  <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs space-y-2 mb-3">
                    <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">
                      ଇଣ୍ଟରଫେସ୍ ନମୁନା (UI Shell Preview)
                    </div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100" dir={previewLangMeta.direction}>
                      {t('dashboard.greeting', previewLangMeta.code, 'Welcome to BharatLearn AI')}
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded-md text-[10px] bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 font-semibold" dir={previewLangMeta.direction}>
                        {t('nav.dashboard', previewLangMeta.code, 'Dashboard')}
                      </span>
                      <span className="px-2 py-1 rounded-md text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold" dir={previewLangMeta.direction}>
                        {t('nav.companion', previewLangMeta.code, 'AI Companion')}
                      </span>
                    </div>
                  </div>

                  {/* Concept Explanation Preview Card */}
                  <div className="p-3.5 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/60 dark:bg-teal-950/20 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        ପାଠ୍ୟ ନମୁନା (Sample Concept)
                      </span>
                      <span className="text-[10px] bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-medium">
                        {previewLangMeta.direction === 'rtl' ? 'RTL Layout' : 'Standard LTR'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100" dir={previewLangMeta.direction}>
                      {previewLangMeta.sampleConceptExplanation.topic}
                    </div>

                    <p
                      className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed"
                      dir={previewLangMeta.direction}
                    >
                      {previewLangMeta.sampleConceptExplanation.text}
                    </p>

                    <div className="pt-2 border-t border-teal-200/60 dark:border-teal-900/40 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <div className="font-semibold text-zinc-700 dark:text-zinc-300 mb-0.5">
                        ବୋର୍ଡ ସିଲାବସ୍ ସ୍ଥିତି (Curriculum Status):
                      </div>
                      <p className="text-[10px] leading-normal">{previewLangMeta.supportDetails}</p>
                    </div>
                  </div>
                </div>

                {/* Limitations & Verification Notice */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>ସୀମିତତା ବିବରଣୀ (Limitations):</span>
                  </div>
                  <p className="text-[10px] leading-normal">{previewLangMeta.knownLimitations}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40 shrink-0">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>ଭାଷା ପରିବର୍ତ୍ତନରେ ଶିକ୍ଷଣ ଅଗ୍ରଗତି କିମ୍ବା ଷ୍ଟଡି ପ୍ଲାନ୍ ନଷ୍ଟ ହୁଏ ନାହିଁ।</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                ଲାଗୁ କରନ୍ତୁ (Apply Preferences)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Standalone Embedded Language Picker for Settings and Onboarding pages
 */
export function InlineLanguagePicker({
  languages,
  onUpdateAxis,
}: {
  languages: LanguageDimensionConfig;
  onUpdateAxis: (axis: keyof LanguageDimensionConfig, code: IndianLanguageCode) => void;
}) {
  const [activeAxis, setActiveAxis] = useState<keyof LanguageDimensionConfig>('explanationLanguage');
  const [search, setSearch] = useState('');
  const [previewCode, setPreviewCode] = useState<IndianLanguageCode>(languages[activeAxis]);

  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_SCHEDULED_LANGUAGES;
    const q = search.toLowerCase();
    return ALL_SCHEDULED_LANGUAGES.filter(
      (l) =>
        l.nameEnglish.toLowerCase().includes(q) ||
        l.nameNative.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  const previewMeta = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === previewCode) || ALL_SCHEDULED_LANGUAGES[0];

  return (
    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            ଭାଷା ନିୟନ୍ତ୍ରଣ (4-Axis Decoupled Configuration)
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select your preferred language across 22 constitutionally recognized Indian languages.
          </p>
        </div>

        {/* Axis selector pill */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          {[
            { axis: 'explanationLanguage' as const, label: 'Explanation' },
            { axis: 'uiLanguage' as const, label: 'UI' },
            { axis: 'assessmentLanguage' as const, label: 'Assessment' },
          ].map((item) => (
            <button
              key={item.axis}
              onClick={() => {
                setActiveAxis(item.axis);
                setPreviewCode(languages[item.axis]);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeAxis === item.axis
                  ? 'bg-white dark:bg-zinc-700 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
        <input
          type="text"
          placeholder="ଭାଷା ଖୋଜନ୍ତୁ (Search 22 languages e.g. Odia, Bengali, Urdu, Hindi)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1">
        {filtered.map((lang) => {
          const isSelected = languages[activeAxis] === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => {
                onUpdateAxis(activeAxis, lang.code);
                setPreviewCode(lang.code);
                if (activeAxis === 'uiLanguage') {
                  applyDocumentDirection(lang.code);
                }
              }}
              onMouseEnter={() => setPreviewCode(lang.code)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/40 ring-1 ring-teal-600'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100" dir={lang.direction}>
                  {lang.nameNative}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
              </div>
              <div className="text-[10px] text-zinc-400 truncate">
                {lang.nameEnglish} ({lang.code.toUpperCase()})
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Concept Preview in Selected Script */}
      <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/20 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 dark:text-teal-300">
          <span>ପ୍ରଦର୍ଶନ ନମୁନା (Preview: {previewMeta.nameEnglish})</span>
          <span className="text-[10px] font-mono">{previewMeta.locale} · Tier {previewMeta.tier}</span>
        </div>
        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed" dir={previewMeta.direction}>
          {previewMeta.sampleConceptExplanation.text}
        </p>
      </div>
    </div>
  );
}
